import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { Wallet, Target, PiggyBank, Briefcase } from 'lucide-react';
import BudgetCard from '../../components/common/BudgetCard';

const Savings = () => {
  const [budget, setBudget] = useState(0);
  const [newBudget, setNewBudget] = useState('');
  const [expenses, setExpenses] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const budgetRes = await api.get('/budget/current');
      setBudget(budgetRes.data?.data?.monthlyBudget || 0);

      // Fetch expenses for current month to calculate 'expenses'
      // We can use the existing expenses endpoint. Assuming it returns all expenses we can filter,
      // or if there is a summary endpoint, use that.
      const expensesRes = await api.get('/expenses');
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const monthlyTotal = expensesRes.data?.data?.reduce((acc, curr) => {
        const d = new Date(curr.date);
        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
          return acc + curr.amount;
        }
        return acc;
      }, 0);
      
      setExpenses(monthlyTotal);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const updateBudget = async (e) => {
    e.preventDefault();
    if (!newBudget || isNaN(newBudget) || Number(newBudget) < 0) return;
    
    try {
      const res = await api.post('/budget/set', {
        monthlyBudget: Number(newBudget)
      });
      setBudget(res.data?.data?.monthlyBudget);
      setNewBudget('');
    } catch (err) {
      console.error(err);
    }
  };

  const remainingBudget = Math.max(0, budget - expenses);

  const chartData = [
    { name: 'Spent', value: expenses, color: '#ef4444' }, // red-500
    { name: 'Remaining', value: remainingBudget, color: '#a3e635' } // lime-400
  ];

  if (loading) return <div className="min-h-screen pt-20 text-center font-black text-2xl uppercase">Loading...</div>;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen bg-[#f3f4f6]">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-black uppercase text-black tracking-tighter mb-4 shadow-black drop-shadow-[4px_4px_0px_white]">
          Budget Intelligence
        </h1>
        
        <form onSubmit={updateBudget} className="flex flex-col sm:flex-row gap-4 mb-8 bg-blue-300 p-6 border-4 border-black shadow-[6px_6px_0px_black]">
          <div className="flex-1 flex flex-col">
            <label className="font-bold uppercase text-sm mb-1">Set Monthly Budget</label>
            <input 
              type="number" 
              placeholder="e.g. ₹40000"
              value={newBudget}
              onChange={(e) => setNewBudget(e.target.value)}
              className="border-4 border-black p-3 font-bold bg-white focus:outline-none focus:bg-yellow-100"
            />
          </div>
          <div className="flex items-end">
            <button 
              type="submit" 
              className="w-full sm:w-auto bg-black text-white px-8 py-3 font-black uppercase border-4 border-black hover:bg-white hover:text-black hover:-translate-y-1 hover:shadow-[4px_4px_0px_black] transition-all"
            >
              Update Budget
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <BudgetCard 
          title="Monthly Budget" 
          amount={budget} 
          icon={Briefcase} 
          colorClass="bg-[#fbbf24]" // amber-400
        />
        <BudgetCard 
          title="Monthly Spent" 
          amount={expenses} 
          icon={Wallet} 
          colorClass="bg-[#ef4444] text-white" // red-500
        />
        <BudgetCard 
          title="Remaining" 
          amount={remainingBudget} 
          icon={PiggyBank} 
          colorClass="bg-[#a3e635]" // lime-400
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div 
          className="bg-white p-6 border-4 border-black shadow-[8px_8px_0px_black]"
        >
          <h2 className="text-2xl font-black uppercase mb-4">Budget vs Spending</h2>
          <div className="h-80 w-full relative">
             <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="black"
                  strokeWidth={2}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'white', border: '4px solid black', fontWeight: 'bold', borderRadius: '0px', boxShadow: '4px 4px 0px black' }}
                />
                <Legend wrapperStyle={{ fontWeight: 'bold' }}/>
              </PieChart>
            </ResponsiveContainer>
            {budget === 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm border-4 border-black border-dashed">
                <p className="font-black uppercase text-xl">Set a budget first</p>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div 
          className="bg-purple-200 p-6 border-4 border-black shadow-[8px_8px_0px_black]"
        >
          <h2 className="text-2xl font-black uppercase mb-4">Intelligence Insights</h2>
          <ul className="space-y-4 font-bold text-lg">
            <li className="flex items-start gap-4">
              <span className="bg-white p-2 border-2 border-black inline-block shadow-[2px_2px_0px_black]">💡</span>
              <p>You have <strong className="text-black bg-white px-1">₹{remainingBudget}</strong> remaining. Allocate this strictly if you want to hit your savings goals.</p>
            </li>
            <li className="flex items-start gap-4">
              <span className="bg-white p-2 border-2 border-black inline-block shadow-[2px_2px_0px_black]">🔥</span>
              <p>Keep your impulsive spending to a minimum! It drains your budget feasibility quickly.</p>
            </li>
            <li className="flex items-start gap-4">
              <span className="bg-white p-2 border-2 border-black inline-block shadow-[2px_2px_0px_black]">🎯</span>
              <p>Check the <a href="/goals" className="underline decoration-4">Goals Tab</a> to see how your current budget impacts your dreams.</p>
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default Savings;
