import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { motion } from 'framer-motion';
import { Wallet, Target, PiggyBank, PlusSquare } from 'lucide-react';
import GoalCard from './GoalCard';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newGoal, setNewGoal] = useState({ title: '', targetAmount: '', deadline: '' });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const res = await api.get('/goals');
      setGoals(res.data?.data || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const createGoal = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/goals/create', {
        ...newGoal,
        targetAmount: Number(newGoal.targetAmount),
        deadline: Number(newGoal.deadline)
      });
      setGoals([res.data?.data, ...goals]);
      setNewGoal({ title: '', targetAmount: '', deadline: '' });
      setShowForm(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (goalId, amount) => {
    try {
      const res = await api.patch('/goals/save', {
        goalId,
        amount
      });
      
      setGoals(goals.map(g => g._id === goalId ? res.data?.data : g));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error saving money');
    }
  };

  return (
    <div className="p-0 md:p-4 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl md:text-5xl font-black uppercase text-black tracking-tighter shadow-black drop-shadow-[4px_4px_0px_white]">
          Saving Goals
        </h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-black text-white px-4 md:px-6 py-3 font-black flex items-center justify-center gap-2 hover:bg-white hover:text-black border-4 border-black hover:-translate-y-1 hover:shadow-[6px_6px_0px_black] transition-all uppercase w-full sm:w-auto"
        >
          <PlusSquare size={24} /> New Goal
        </button>
      </div>

      {showForm && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 bg-pink-300 border-4 border-black shadow-[8px_8px_0px_black]"
        >
          <h2 className="text-2xl font-black uppercase mb-4 flex items-center gap-2">
            <Target /> Create New Goal
          </h2>
          <form onSubmit={createGoal} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex flex-col">
              <label className="font-bold uppercase mb-1">Goal Title</label>
              <input 
                required
                type="text" 
                placeholder="e.g. Nike Jordan" 
                value={newGoal.title}
                onChange={e => setNewGoal({...newGoal, title: e.target.value})}
                className="border-4 border-black p-3 font-bold bg-white focus:outline-none focus:bg-yellow-100"
              />
            </div>
            <div className="flex flex-col">
              <label className="font-bold uppercase mb-1">Target (₹)</label>
              <input 
                required
                type="number" 
                placeholder="₹6000" 
                value={newGoal.targetAmount}
                onChange={e => setNewGoal({...newGoal, targetAmount: e.target.value})}
                className="border-4 border-black p-3 font-bold bg-white focus:outline-none focus:bg-yellow-100"
              />
            </div>
            <div className="flex flex-col">
              <label className="font-bold uppercase mb-1">Deadline (Months)</label>
              <input 
                required
                type="number" 
                placeholder="3" 
                value={newGoal.deadline}
                onChange={e => setNewGoal({...newGoal, deadline: e.target.value})}
                className="border-4 border-black p-3 font-bold bg-white focus:outline-none focus:bg-yellow-100"
              />
            </div>
            <div className="flex flex-col justify-end">
              <button 
                type="submit" 
                className="w-full bg-[#a3e635] p-3 font-black uppercase border-4 border-black hover:shadow-[4px_4px_0px_black] hover:-translate-y-1 transition-all"
              >
                Create
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {loading ? (
        <div className="text-2xl font-black uppercase text-center mt-20">Loading Goals...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {goals.map(goal => (
            <GoalCard 
              key={goal._id} 
              goal={goal} 
              onSave={handleSave} 
            />
          ))}
          {goals.length === 0 && !showForm && (
            <div className="col-span-full text-center p-12 bg-white border-4 border-black border-dashed">
              <Target size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-2xl font-black uppercase opacity-50">No goals found. Dream bigger!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Goals;
