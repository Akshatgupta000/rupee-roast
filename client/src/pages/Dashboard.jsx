import { useState, useEffect } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend 
} from 'recharts';
import { IndianRupee, TrendingDown, AlertTriangle, Target, Wallet } from 'lucide-react';

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [goals, setGoals] = useState([]);
  const [budget, setBudget] = useState(null);
  const [newBudget, setNewBudget] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [expRes, goalsRes, budgetRes] = await Promise.all([
        api.get('/expenses'),
        api.get('/goals'),
        api.get('/budget/current')
      ]);
      setExpenses(expRes.data);
      setGoals(goalsRes.data);
      setBudget(budgetRes.data?.monthlyBudget || null);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const saveBudget = async (e) => {
    e.preventDefault();
    if (!newBudget || isNaN(newBudget) || Number(newBudget) <= 0) return;
    try {
      const res = await api.post('/budget/set', { monthlyBudget: Number(newBudget) });
      setBudget(res.data.monthlyBudget);
      setNewBudget('');
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-16 h-16 border-4 border-black border-t-wrapped-lime rounded-full animate-spin"></div>
    </div>
  );

  // Analytics
  const validExpenses = Array.isArray(expenses) ? expenses : [];
  const currentMonth = new Date().getMonth();
  const currentMonthExpenses = validExpenses.filter(e => new Date(e.date).getMonth() === currentMonth);
  
  const totalSpent = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const impulsiveSpent = currentMonthExpenses.filter(e => e.type === 'impulsive').reduce((sum, e) => sum + e.amount, 0);
  const necessarySpent = currentMonthExpenses.filter(e => e.type === 'necessary').reduce((sum, e) => sum + e.amount, 0);

  const categoryBreakdown = currentMonthExpenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  const pieData = Object.keys(categoryBreakdown).map(key => ({
    name: key,
    value: categoryBreakdown[key]
  }));

  const COLORS = ['#ccff00', '#ff0099', '#00ffff', '#ffcc00', '#121212', '#ffffff'];

  const typeData = [
    { name: 'Necessary', amount: necessarySpent },
    { name: 'Impulsive', amount: impulsiveSpent }
  ];

  return (
    <div className="space-y-10 pb-20">
      <header className="mb-8 border-b-4 border-black pb-4 inline-block">
        <h1 className="text-5xl font-black text-black mb-2 uppercase tracking-tighter shadow-hard-white inline-block bg-wrapped-cyan px-4 py-2 border-4 border-black">Dashboard</h1>
        <p className="font-mono font-bold bg-white px-2 py-1 border-2 border-black inline-block mt-4 ml-4 translate-y-[-10px] rotate-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">Here's the damage for this month.</p>
      </header>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="neo-card p-6 bg-wrapped-lime hover:-translate-y-2 hover:-translate-x-2 transition-transform duration-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="font-mono font-bold text-sm bg-white px-2 py-1 border-2 border-black mb-2 inline-block shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">TOTAL SPENT</p>
              <h3 className="text-4xl font-black flex items-center gap-1 font-heading uppercase text-stroke-white-1">
                <IndianRupee size={32} /> {totalSpent.toLocaleString()}
              </h3>
            </div>
            <div className="bg-white p-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <TrendingDown className="text-black" size={28} />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.1 }} className="neo-card p-6 bg-wrapped-cyan hover:-translate-y-2 hover:-translate-x-2 transition-transform duration-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="font-mono font-bold text-sm bg-white px-2 py-1 border-2 border-black mb-2 inline-block shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">NECESSARY</p>
              <h3 className="text-4xl font-black flex items-center gap-1 font-heading uppercase text-stroke-white-1">
                <IndianRupee size={32} /> {necessarySpent.toLocaleString()}
              </h3>
            </div>
            <div className="bg-white p-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <div className="w-7 h-7 border-4 border-black rounded-full flex items-center justify-center text-black text-sm font-bold animate-wobble">✓</div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.2 }} className="neo-card p-6 bg-wrapped-pink hover:-translate-y-2 hover:-translate-x-2 transition-transform duration-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="font-mono font-bold text-sm bg-white px-2 py-1 border-2 border-black mb-2 inline-block shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">IMPULSIVE</p>
              <h3 className="text-4xl font-black flex items-center gap-1 text-white font-heading uppercase text-stroke-1">
                <IndianRupee size={32} /> {impulsiveSpent.toLocaleString()}
              </h3>
            </div>
            <div className="bg-white p-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <AlertTriangle className="text-black animate-wobble" size={28} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* My Monthly Budget Card */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.25 }} className="neo-card p-0 mt-8 bg-white relative overflow-hidden border-4 border-black shadow-[8px_8px_0px_black]">
        <div className="bg-[#fbbf24] text-black p-4 border-b-4 border-black flex justify-between items-center">
          <h2 className="text-2xl font-black uppercase tracking-tight">My Monthly Budget</h2>
          <Wallet size={24} />
        </div>
        <div className="p-4 md:p-6 bg-surface grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div>
            {budget === null || budget === 0 ? (
              <div className="text-red-500 font-bold uppercase animate-pulse border-2 border-red-500 p-2 inline-block shadow-[2px_2px_0px_red]">
                ⚠️ Budget not set for this month!
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between border-b-[3px] border-black border-dashed pb-1">
                  <span className="font-bold uppercase">Budget:</span>
                  <span className="font-black text-xl">₹{budget.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-b-[3px] border-black border-dashed pb-1">
                  <span className="font-bold uppercase">Total Spending:</span>
                  <span className="font-black text-xl text-red-600">₹{totalSpent.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="font-bold uppercase text-lg">Remaining:</span>
                  <span className={`font-black text-2xl ${budget - totalSpent < 0 ? 'text-red-500' : 'text-[#a3e635]'}`}>
                    ₹{(budget - totalSpent).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>
          <form onSubmit={saveBudget} className="flex flex-col gap-2">
            <label className="font-black uppercase text-sm">
              {budget ? "Update Budget" : "Set Budget"}
            </label>
            <div className="flex gap-2">
              <input 
                type="number" 
                placeholder="e.g. 40000" 
                value={newBudget}
                onChange={e => setNewBudget(e.target.value)}
                className="flex-1 w-full border-4 border-black p-3 font-bold focus:outline-none focus:bg-yellow-100 placeholder-gray-500"
              />
              <button 
                type="submit"
                className="bg-black text-white px-6 font-black uppercase border-4 border-black hover:bg-[#a3e635] hover:text-black hover:-translate-y-1 hover:shadow-[4px_4px_0px_black] transition-all"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </motion.div>

      {/* Charts List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
        
        {/* Category breakdown pie */}
        <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} transition={{ delay: 0.3 }} className="neo-card p-6 md:p-8 bg-white relative">
          <div className="absolute top-[-15px] left-8 bg-wrapped-yellow px-4 py-1 border-2 border-black shadow-hard font-black uppercase text-xl z-10">Category Breakdown</div>
          <div className="h-[300px] w-full mt-8">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={0}
                    dataKey="value"
                    stroke="#000000"
                    strokeWidth={2}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', border: '3px solid #000000', borderRadius: '0px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)', fontWeight: 'bold', fontFamily: '"DM Mono", monospace' }}
                    itemStyle={{ color: '#000000' }}
                  />
                  <Legend wrapperStyle={{ fontFamily: '"DM Mono", monospace', fontWeight: 'bold' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center font-mono font-bold text-black border-4 border-dashed border-black">No data for this month</div>
            )}
          </div>
        </motion.div>

        {/* Impulsive vs Necessary Bar */}
        <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} transition={{ delay: 0.4 }} className="neo-card p-6 md:p-8 bg-white relative">
          <div className="absolute top-[-15px] left-8 bg-wrapped-cyan px-4 py-1 border-2 border-black shadow-hard font-black uppercase text-xl z-10">Type Comparison</div>
          <div className="h-[300px] w-full mt-8">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="0" stroke="#000000" vertical={false} />
                <XAxis dataKey="name" stroke="#000000" tick={{fontFamily: '"DM Mono", monospace', fontWeight: 'bold', fill: '#000000'}} />
                <YAxis stroke="#000000" tick={{fontFamily: '"DM Mono", monospace', fontWeight: 'bold', fill: '#000000'}} />
                <Tooltip 
                  cursor={{fill: 'rgba(0,0,0,0.1)'}}
                  contentStyle={{ backgroundColor: '#ffffff', border: '3px solid #000000', borderRadius: '0px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)', fontWeight: 'bold', fontFamily: '"DM Mono", monospace' }}
                />
                <Bar 
                  dataKey="amount" 
                  radius={[0, 0, 0, 0]}
                  barSize={60}
                  stroke="#000000"
                  strokeWidth={3}
                >
                  {
                    typeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.name === 'Necessary' ? '#ccff00' : '#ff0099'} />
                    ))
                  }
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

      </div>

      {/* Recent transactions */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.5 }} className="neo-card p-0 mt-12 bg-white relative overflow-hidden">
        <div className="bg-wrapped-black text-white p-4 border-b-4 border-black flex justify-between items-center">
          <h2 className="text-2xl font-black uppercase tracking-tight">Recent Transactions</h2>
          <div className="w-4 h-4 rounded-full bg-wrapped-lime border-2 border-white animate-pulse"></div>
        </div>
        <div className="overflow-x-auto p-4 md:p-6 bg-surface">
          <table className="w-full text-left border-collapse border-[3px] border-black bg-white shadow-hard mb-2">
            <thead>
              <tr className="border-b-[3px] border-black bg-wrapped-yellow font-black uppercase font-mono text-sm">
                <th className="p-4 border-r-[3px] border-black">Date</th>
                <th className="p-4 border-r-[3px] border-black">Title</th>
                <th className="p-4 border-r-[3px] border-black">Category</th>
                <th className="p-4 border-r-[3px] border-black">Type</th>
                <th className="p-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {validExpenses.slice(0, 5).map(expense => (
                <tr key={expense._id} className="border-b-[3px] border-black hover:bg-gray-100 transition-colors">
                  <td className="p-4 font-mono font-bold border-r-[3px] border-black">{new Date(expense.date).toLocaleDateString()}</td>
                  <td className="p-4 font-bold border-r-[3px] border-black uppercase">{expense.title}</td>
                  <td className="p-4 font-mono font-bold uppercase border-r-[3px] border-black">{expense.category}</td>
                  <td className="p-4 border-r-[3px] border-black">
                    <span className={`px-3 py-1 text-xs font-black uppercase border-2 border-black inline-block shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${expense.type === 'impulsive' ? 'bg-wrapped-pink text-white' : 'bg-wrapped-lime text-black'}`}>
                      {expense.type}
                    </span>
                  </td>
                  <td className="p-4 text-right font-black text-xl">
                    ₹{expense.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
              {validExpenses.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-10 text-center font-mono font-bold uppercase text-gray-500 bg-white">No transactions recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Saving Goals Preview */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.6 }} className="neo-card p-0 mt-12 bg-white relative overflow-hidden">
        <div className="bg-purple-300 text-black p-4 border-b-4 border-black flex justify-between items-center">
          <h2 className="text-2xl font-black uppercase tracking-tight">Saving Goals Overview</h2>
          <Target className="animate-spin-slow" size={24} />
        </div>
        <div className="p-4 md:p-6 bg-surface">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.length > 0 ? goals.slice(0, 2).map((g, idx) => (
              <div key={idx} className="border-4 border-black p-4 bg-[#fef08a] hover:-translate-y-1 shadow-[4px_4px_0px_black] transition-all">
                <h3 className="font-black text-xl uppercase mb-2">{g.title}</h3>
                <div className="w-full h-4 border-2 border-black bg-white mb-2 relative">
                  <div className="h-full bg-[#a3e635] border-r-2 border-black" style={{ width: `${Math.min((g.savedAmount/g.targetAmount)*100, 100)}%` }}></div>
                </div>
                <div className="flex justify-between font-bold text-sm">
                  <span>Saved: ₹{g.savedAmount}</span>
                  <span>Target: ₹{g.targetAmount}</span>
                </div>
                <p className="mt-2 text-sm font-black text-black/70">
                  Remaining: ₹{Math.max(0, g.targetAmount - g.savedAmount)}
                </p>
              </div>
            )) : (
              <div className="col-span-full border-4 border-black border-dashed p-6 text-center font-black uppercase text-gray-500 bg-white">
                No active goals. <a href="/goals" className="text-black underline decoration-2">Set one now!</a>
              </div>
            )}
          </div>
        </div>
      </motion.div>

    </div>
  );
};

export default Dashboard;
