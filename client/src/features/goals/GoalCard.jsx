import React, { useState } from 'react';
import { motion } from 'framer-motion';
import GoalProgress from './GoalProgress';
import { Target, Flame, CheckCircle, TrendingUp } from 'lucide-react';
import api from '../../services/api';

const GoalCard = ({ goal, onSave, onUpdate }) => {
  const [saveAmount, setSaveAmount] = useState('');
  const [roast, setRoast] = useState('');
  const [loadingRoast, setLoadingRoast] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!saveAmount || isNaN(saveAmount) || Number(saveAmount) <= 0) return;
    await onSave(goal._id, Number(saveAmount));
    setSaveAmount('');
  };

  const getAnalysis = async () => {
    setLoadingAnalysis(true);
    try {
      const res = await api.get(`/goals/analysis/${goal._id}`);
      setAnalysis(res.data?.data || null);
    } catch (err) {
      console.error(err);
    }
    setLoadingAnalysis(false);
  };

  const handleRoast = async () => {
    if (loadingRoast) return;
    setLoadingRoast(true);
    try {
      // Need stats to pass to roast, if we have analysis use it, else generic.
      // Easiest is to always fetch analysis first if not present
      let currentAnalysis = analysis;
      if (!currentAnalysis) {
        const res = await api.get(`/goals/analysis/${goal._id}`);
        currentAnalysis = res.data?.data || null;
        setAnalysis(res.data?.data || null);
      }

      const { data } = await api.post(`/goals/roast`, {
        budget: currentAnalysis.monthlyBudget,
        spending: currentAnalysis.currentMonthlySpending,
        goalTitle: goal.title,
        targetAmount: goal.targetAmount,
        remainingAmount: goal.targetAmount - goal.savedAmount,
        monthsLeft: goal.deadline
      });
      
      setRoast(data?.data?.roast || data?.roast || '');
    } catch (err) {
      setRoast("Beta server down hai, paise bachao aur error handling theek karo.");
    }
    setLoadingRoast(false);
  };

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-white p-6 border-4 border-black shadow-[6px_6px_0px_black] text-black relative"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-2xl font-black uppercase flex items-center gap-2">
            <Target size={24} /> {goal.title}
          </h3>
          <p className="font-bold opacity-80 mt-1">Deadline: {goal.deadline} months left</p>
        </div>
        {goal.status === 'completed' && (
          <span className="bg-[#a3e635] text-black px-3 py-1 font-black uppercase border-2 border-black flex items-center gap-1 shadow-[2px_2px_0px_black]">
            <CheckCircle size={16} /> Completed
          </span>
        )}
      </div>

      <GoalProgress saved={goal.savedAmount} target={goal.targetAmount} />

      {goal.status !== 'completed' && (
        <form onSubmit={handleSave} className="mt-4 flex gap-2">
          <input 
            type="number" 
            placeholder="Amount to save" 
            value={saveAmount}
            onChange={(e) => setSaveAmount(e.target.value)}
            className="flex-1 border-2 border-black p-2 font-bold focus:outline-none focus:bg-pink-100"
          />
          <button 
            type="submit"
            className="bg-[#fbbf24] px-4 font-black border-2 border-black shadow-[2px_2px_0px_black] hover:translate-y-px hover:shadow-none transition-all uppercase"
          >
            Add
          </button>
        </form>
      )}

      {/* Analysis Section */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button 
          onClick={getAnalysis}
          disabled={loadingAnalysis}
          className="bg-purple-300 px-4 py-2 font-black border-2 border-black shadow-[2px_2px_0px_black] hover:translate-y-px hover:shadow-none transition-all text-sm uppercase flex items-center gap-1"
        >
          <TrendingUp size={16} /> Analyze
        </button>
        <button 
          onClick={handleRoast}
          disabled={loadingRoast}
          className="bg-red-400 px-4 py-2 text-white font-black border-2 border-black shadow-[2px_2px_0px_black] hover:translate-y-px hover:shadow-none transition-all text-sm uppercase flex items-center gap-1"
        >
          <Flame size={16} /> Roast My Decisions
        </button>
      </div>

      {analysis && (
        <div className={`mt-4 p-4 border-2 border-black font-bold text-sm ${
          analysis.status === 'Achievable' ? 'bg-green-200' :
          analysis.status === 'Risky' ? 'bg-yellow-200' : 'bg-red-200'
        }`}>
          <div className="flex justify-between items-center mb-2">
            <span className="uppercase text-black/60">Feasibility</span>
            <span className="uppercase font-black border-black border px-2 py-1 bg-white">{analysis.status}</span>
          </div>
          <p>Required Monthly Saving: ₹{Math.round(analysis.requiredMonthlySaving)}</p>
          <p>Remaining Budget: ₹{Math.round(analysis.remainingBudget)}</p>
          <p className="mt-2 text-black/80 italic">"{analysis.suggestion}"</p>
        </div>
      )}

      {roast && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-yellow-100 border-x-4 border-black border-y-4 border-y-black border-dashed font-black italic relative overflow-hidden"
        >
          <Flame className="absolute -right-2 -top-2 text-orange-400 opacity-20" size={64} />
          <p className="relative z-10 text-orange-900">"{roast}"</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default GoalCard;
