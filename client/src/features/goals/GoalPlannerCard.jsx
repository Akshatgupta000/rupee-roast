import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, PiggyBank, Calculator } from 'lucide-react';

const GoalPlannerCard = () => {
  const [goal, setGoal] = useState({ product: '', price: '', months: 1 });
  const [result, setResult] = useState(null);

  const calculate = (e) => {
    e.preventDefault();
    if (!goal.price || !goal.months) return;
    
    const monthly = Math.round(goal.price / goal.months);
    const daily = Math.round(goal.price / (goal.months * 30));
    
    setResult({ monthly, daily });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#FFBD00] border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
    >
      <h2 className="text-2xl font-black uppercase tracking-tighter text-black flex items-center gap-2 mb-6">
        <Target /> Goal Planner
      </h2>

      <form onSubmit={calculate} className="space-y-4">
        <div>
          <label className="block text-xs font-black uppercase mb-1">What do you want?</label>
          <input 
            type="text" 
            placeholder="iPhone 16 Pro, Shoes, etc."
            className="w-full bg-white border-2 border-black p-2 font-bold placeholder:text-gray-400 focus:outline-none"
            value={goal.product}
            onChange={e => setGoal({...goal, product: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-black uppercase mb-1">Price (₹)</label>
            <input 
              type="number" 
              placeholder="5000"
              className="w-full bg-white border-2 border-black p-2 font-bold focus:outline-none"
              value={goal.price}
              onChange={e => setGoal({...goal, price: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase mb-1">Months</label>
            <input 
              type="number" 
              placeholder="1"
              className="w-full bg-white border-2 border-black p-2 font-bold focus:outline-none"
              value={goal.months}
              onChange={e => setGoal({...goal, months: e.target.value})}
            />
          </div>
        </div>

        <button 
          type="submit"
          className="w-full bg-black text-white p-3 font-black uppercase hover:bg-white hover:text-black transition-colors border-2 border-black"
        >
          Calculate Savings
        </button>
      </form>

      {result && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 p-4 bg-white border-2 border-black space-y-3"
        >
          <div className="flex items-center gap-2 text-blue-600">
            <Calculator size={16} />
            <span className="text-xs font-black uppercase leading-none">Strategy for {goal.product || 'Your Goal'}</span>
          </div>
          
          <div className="flex justify-between items-center bg-gray-100 p-2 border-b-2 border-black">
            <span className="font-bold text-xs uppercase">Monthly</span>
            <span className="text-xl font-black tracking-tighter">₹{result.monthly}</span>
          </div>
          
          <div className="flex justify-between items-center bg-gray-100 p-2">
            <span className="font-bold text-xs uppercase">Daily</span>
            <span className="text-xl font-black tracking-tighter text-blue-600">₹{result.daily}</span>
          </div>

          <div className="pt-2">
            <div className="flex items-center gap-2 text-green-600 mb-1">
              <PiggyBank size={14} />
              <span className="text-[10px] font-black uppercase leading-none">Pro Tip</span>
            </div>
            <p className="text-[10px] font-bold text-gray-500 leading-tight">
              Invest ₹{result.daily} daily in a liquid fund to reach this goal 5 days earlier.
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default GoalPlannerCard;
