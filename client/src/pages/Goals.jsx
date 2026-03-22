import { useState, useEffect } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';
import { Target, Plus, X, Trash2, IndianRupee } from 'lucide-react';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ goalName: '', targetAmount: '', targetDate: '', savedAmount: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const res = await api.get('/goals');
      setGoals(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/goals', { 
        ...formData, 
        targetAmount: Number(formData.targetAmount),
        savedAmount: Number(formData.savedAmount || 0)
      });
      setShowForm(false);
      setFormData({ goalName: '', targetAmount: '', targetDate: '', savedAmount: '' });
      fetchGoals();
    } catch (error) {
      console.error(error);
    }
  };

  const deleteGoal = async (id) => {
    try {
      await api.delete(`/goals/${id}`);
      setGoals(goals.filter(g => g._id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  if(loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-16 h-16 border-4 border-black border-t-wrapped-yellow rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <header className="border-b-4 border-black pb-4 inline-block">
          <h1 className="text-5xl font-black text-black mb-2 uppercase tracking-tighter shadow-hard-white inline-block bg-wrapped-yellow px-4 py-2 border-4 border-black">Savings Goals</h1>
          <p className="font-mono font-bold bg-white px-2 py-1 border-2 border-black inline-block mt-4 ml-4 translate-y-[-10px] rotate-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">Calculate exact monthly savings needed.</p>
        </header>

        <button 
          onClick={() => setShowForm(!showForm)}
          className={`neo-btn flex items-center gap-2 ${showForm ? 'bg-white text-black' : 'bg-wrapped-cyan text-black'} text-lg`}
        >
          {showForm ? <><X size={20} className="text-black inline" /> Cancel</> : <><Plus size={20} className="text-black inline" /> New Goal</>}
        </button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0, y: -20 }} animate={{ opacity: 1, height: 'auto', y: 0 }} className="neo-card p-6 md:p-8 mb-8 bg-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-wrapped-cyan border-b-2 border-black"></div>
          <h2 className="text-2xl font-black uppercase mb-6 mt-4">Create Goal</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-black uppercase mb-1">Goal Name</label>
              <input required type="text" className="w-full bg-white border-[3px] border-black p-3 font-mono font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,255,255,1)] transition-shadow" placeholder="E.g., PS5, Vacation" value={formData.goalName} onChange={(e) => setFormData({...formData, goalName: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-black uppercase mb-1">Target Amount (₹)</label>
              <input required type="number" className="w-full bg-white border-[3px] border-black p-3 font-mono font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,255,255,1)] transition-shadow" placeholder="50000" value={formData.targetAmount} onChange={(e) => setFormData({...formData, targetAmount: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-black uppercase mb-1">Already Saved (₹)</label>
              <input type="number" className="w-full bg-wrapped-lime border-[3px] border-black p-3 font-mono font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow" placeholder="0" value={formData.savedAmount} onChange={(e) => setFormData({...formData, savedAmount: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-black uppercase mb-1">Target Date</label>
              <input required type="date" className="w-full bg-white border-[3px] border-black p-3 font-mono font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,255,255,1)] transition-shadow" value={formData.targetDate} onChange={(e) => setFormData({...formData, targetDate: e.target.value})} />
            </div>
            <div className="lg:col-span-4 flex justify-end">
              <button type="submit" className="neo-btn bg-black text-white w-full md:w-auto shadow-[4px_4px_0px_0px_rgba(0,255,255,1)] hover:shadow-none hover:bg-wrapped-cyan hover:text-black">Save Goal</button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {(Array.isArray(goals) ? goals : []).map((goal, index) => {
          const progress = Math.min(100, Math.max(0, (goal.savedAmount / goal.targetAmount) * 100));
          const isDanger = progress < 10 && goal.monthlySavingRequired > 0;
          const bgColors = ['bg-wrapped-lime', 'bg-wrapped-cyan', 'bg-wrapped-pink', 'bg-wrapped-yellow'];
          const cardColor = bgColors[index % bgColors.length];
          
          return (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ delay: index * 0.1 }}
              key={goal._id} 
              className={`neo-card p-6 md:p-8 relative group ${cardColor} hover:-translate-y-2 hover:-translate-x-2 transition-transform duration-200`}
            >
              <div className="absolute top-2 right-2 w-full h-full bg-white opacity-20 blur-xl rounded-full pointer-events-none mix-blend-overlay" />

              <button onClick={() => deleteGoal(goal._id)} className="absolute top-[-10px] right-[-10px] bg-white border-[3px] border-black p-2 hover:bg-wrapped-pink hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] z-10 w-10 h-10 flex items-center justify-center rounded-full">
                <Trash2 size={18} className="text-black" />
              </button>
              
              <div className="flex justify-between items-start mb-6 border-b-[3px] border-black pb-4">
                <div className="flex gap-2 items-center">
                  <div className="p-2 bg-black text-white rounded-none border-2 border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <Target size={24} />
                  </div>
                  <span className="font-mono font-bold bg-white px-2 py-1 border-2 border-black text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    BY {new Date(goal.targetDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <h3 className="font-heading text-3xl font-black mb-4 uppercase leading-[0.9] tracking-tighter text-black text-stroke-white-1">
                {goal.goalName}
              </h3>

              <div className="font-mono text-sm font-bold leading-relaxed mb-6 bg-white/90 p-4 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] block">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <p className="text-xs uppercase font-black text-gray-500 mb-1">Saved Amount</p>
                    <p className="font-black text-black text-xl flex items-center">
                      ₹{goal.savedAmount.toLocaleString()} <span className="text-gray-500 ml-1 font-bold text-sm">/ {goal.targetAmount.toLocaleString()}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black bg-black text-white px-2 uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">{progress.toFixed(0)}%</p>
                  </div>
                </div>

                <div className="w-full bg-white border-2 border-black h-4 mb-4 overflow-hidden mt-4 shadow-inner">
                  <div className={`h-full border-r-2 border-black ${isDanger ? 'bg-wrapped-pink' : 'bg-wrapped-lime'}`} style={{ width: `${progress}%` }}></div>
                </div>

                <div className="border-t-[3px] border-black pt-4 mt-2 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase font-black text-gray-500 mb-1">Required per month</p>
                    <p className={`font-black text-2xl flex items-center ${goal.monthlySavingRequired > 10000 ? 'text-wrapped-pink text-stroke-1' : 'text-black'}`}>
                      <IndianRupee size={20} className={goal.monthlySavingRequired > 10000 ? "text-wrapped-pink" : "text-black"} />
                      {goal.monthlySavingRequired.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

            </motion.div>
          );
        })}
      </div>

      {(Array.isArray(goals) ? goals : []).length === 0 && (
        <div className="neo-card py-20 px-6 text-center border-dashed border-4 border-black bg-surface relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
            <Target size={200} />
          </div>
          <Target size={64} className="mx-auto text-black mb-6 animate-wobble" />
          <h3 className="text-3xl font-black text-black mb-4 uppercase font-heading text-stroke-white-1">No Goals Set</h3>
          <p className="font-mono font-bold text-black mb-8 bg-wrapped-cyan inline-block px-4 py-2 border-[3px] border-black shadow-hard z-10 relative">You're currently saving for absolutely nothing? Time to change that.</p>
          <br/>
          <button onClick={() => setShowForm(true)} className="neo-btn bg-wrapped-lime text-black inline-block z-10 relative text-xl">Add First Goal</button>
        </div>
      )}
    </div>
  );
};

export default Goals;
