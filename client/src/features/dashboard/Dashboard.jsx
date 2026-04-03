import { useState, useEffect } from 'react';
import api from '../../services/api';
import { motion } from 'framer-motion';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  AreaChart, Area
} from 'recharts';
import { IndianRupee, TrendingDown, AlertTriangle, Target, Wallet, Flame, Lightbulb } from 'lucide-react';

// New Components
import FinancialHealthCard from './FinancialHealthCard';
import BudgetPredictionCard from './BudgetPredictionCard';
import GoalPlannerCard from '../goals/GoalPlannerCard';
import AIAdvicePanel from '../roast/AIAdvicePanel';

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [goals, setGoals] = useState([]);
  const [budget, setBudget] = useState(null);
  const [healthData, setHealthData] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [newBudget, setNewBudget] = useState('');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [expRes, goalsRes, budgetRes, healthRes, predRes, summaryRes] = await Promise.all([
        api.get('/expenses'),
        api.get('/goals'),
        api.get('/budget/current'),
        api.get('/finance/health-score'),
        api.get('/finance/predict-budget'),
        api.get('/finance/summary'),
      ]);
      setExpenses(expRes.data?.data || []);
      setGoals(goalsRes.data?.data || []);
      setBudget(budgetRes.data?.data?.monthlyBudget ?? null);
      setHealthData(healthRes.data?.data || null);
      setPrediction(predRes.data?.data || null);
      setSummary(summaryRes.data?.data || null);
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
      setBudget(res.data?.data?.monthlyBudget ?? null);
      setNewBudget('');
      // Refresh prediction after budget change
      const predRes = await api.get('/finance/predict-budget');
      setPrediction(predRes.data?.data || null);
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
  
  const totalSpent = summary?.totalMonthlySpending ?? currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const impulsiveSpent = currentMonthExpenses.filter(e => e.type === 'impulsive').reduce((sum, e) => sum + e.amount, 0);
  const necessarySpent = currentMonthExpenses.filter(e => e.type === 'necessary').reduce((sum, e) => sum + e.amount, 0);

  const categoryBreakdown =
    summary?.categoryBreakdown ??
    currentMonthExpenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});

  const categoryLabelMap = {
    food: 'Pet Puja Fund 🍕',
    transport: 'Traffic Tax 🚗',
    shopping: 'Retail Therapy 🛍️',
    entertainment: 'Monthly Paisa Drain 💸',
    bills: 'Bill Board Chilla 🚨',
    grocery: 'Ration Ransom 🥬',
    other: 'Misc Money Mystery 🧩',
    subscriptions: 'Monthly Paisa Drain 💸',
  };

  const getCategoryLabel = (cat) => categoryLabelMap[String(cat ?? '').toLowerCase()] || String(cat ?? '');

  const pieData = Object.keys(categoryBreakdown).map(key => ({
    name: getCategoryLabel(key),
    value: categoryBreakdown[key]
  }));

  const COLORS = ['#ccff00', '#ff0099', '#00ffff', '#ffcc00', '#121212', '#ffffff'];

  // Trend Data (Monthly). Falls back to last 7 days if summary isn't available.
  const trendData = Array.isArray(summary?.monthlyTrend)
    ? summary.monthlyTrend.map((d) => ({ name: d.label, amount: d.amount }))
    : [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dateStr = d.toISOString().split('T')[0];
        const dayTotal = validExpenses
          .filter(e => e.date.split('T')[0] === dateStr)
          .reduce((sum, e) => sum + e.amount, 0);
        return { name: dateStr.split('-').slice(1).join('/'), amount: dayTotal };
      });

  // Top Wasteful Categories
  const wastefulCategories = Object.entries(categoryBreakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  const topExpensesData = Array.isArray(summary?.topExpenses)
    ? summary.topExpenses.map((e) => ({
        name: String(e?.title ?? 'Expense').slice(0, 18),
        amount: Number(e?.amount) || 0,
      }))
    : [];

  return (
    <div className="space-y-10 pb-20">
      <header className="mb-4 md:mb-8 border-b-4 border-black pb-4 inline-block w-full sm:w-auto">
        <h1 className="text-3xl md:text-5xl font-black text-black mb-2 uppercase tracking-tighter shadow-hard-white inline-block bg-wrapped-cyan px-4 py-2 border-4 border-black">Intelligence</h1>
        <p className="font-mono font-bold bg-white px-2 py-1 border-2 border-black inline-block mt-2 md:mt-4 md:ml-4 translate-y-0 md:translate-y-[-10px] rotate-0 md:rotate-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs md:text-base">Predicting your financial doom.</p>
      </header>

      {/* NEW: Financial Intelligence Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <FinancialHealthCard healthData={healthData} loading={loading} />
        <BudgetPredictionCard 
          prediction={prediction ? { 
            ...prediction, 
            balance: budget ? (budget - totalSpent) : 0,
            avgDailySpend: totalSpent / Math.max(1, new Date().getDate())
          } : null} 
          loading={loading} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
           <AIAdvicePanel />
        </div>
        <GoalPlannerCard />
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="neo-card p-6 bg-wrapped-lime border-4 border-black shadow-[8px_8px_0px_black]">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="font-black text-[10px] md:text-xs uppercase mb-1 md:mb-2">Total Monthly Spend</p>
              <h3 className="text-2xl md:text-4xl font-black tracking-tight">₹{totalSpent.toLocaleString()}</h3>
            </div>
            <div className="bg-white p-1 md:p-2 border-2 border-black">
              <IndianRupee size={20} className="md:w-6 md:h-6" />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.1 }} className="neo-card p-6 bg-wrapped-cyan border-4 border-black shadow-[8px_8px_0px_black]">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="font-black text-[10px] md:text-xs uppercase mb-1 md:mb-2">Essential Spending</p>
              <h3 className="text-2xl md:text-4xl font-black tracking-tight">₹{necessarySpent.toLocaleString()}</h3>
            </div>
            <div className="bg-white p-1 md:p-2 border-2 border-black">
              <TrendingDown size={20} className="md:w-6 md:h-6" />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.2 }} className="neo-card p-6 bg-wrapped-pink border-4 border-black shadow-[8px_8px_0px_black]">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="font-black text-[10px] md:text-xs uppercase mb-1 md:mb-2">Impulsive Damage</p>
              <h3 className="text-2xl md:text-4xl font-black text-white text-stroke-1 tracking-tight">₹{impulsiveSpent.toLocaleString()}</h3>
            </div>
            <div className="bg-white p-1 md:p-2 border-2 border-black">
              <AlertTriangle size={20} className="md:w-6 md:h-6" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Spending Trend Graph */}
        <motion.div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_black]">
          <h2 className="text-xl font-black uppercase mb-6 flex items-center gap-2">
            <TrendingDown className="text-blue-500" /> Monthly Trend (Last 6 Months)
          </h2>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" stroke="#000" tick={{fontSize: 10, fontWeight: 'bold'}} />
                <YAxis stroke="#000" tick={{fontSize: 10, fontWeight: 'bold'}} />
                <Tooltip contentStyle={{ border: '2px solid black', borderRadius: '0', fontWeight: 'bold' }} />
                <Area type="monotone" dataKey="amount" stroke="#000" strokeWidth={4} fill="#ccff00" fillOpacity={1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Wasteful Categories */}
        <motion.div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_black]">
          <h2 className="text-xl font-black uppercase mb-6 flex items-center gap-2">
            <Flame className="text-red-500" /> Top Damage Categories
          </h2>
          <div className="space-y-4">
            {wastefulCategories.map(([cat, amt], i) => (
              <div key={cat} className="flex items-center gap-4">
                <div className="bg-black text-white w-8 h-8 flex items-center justify-center font-black">
                  {i + 1}
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between mb-1">
                    <span className="font-bold uppercase text-sm">{getCategoryLabel(cat)}</span>
                    <span className="font-black tracking-tighter">₹{amt.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-3 border-2 border-black bg-gray-100">
                    <div 
                      className="h-full bg-wrapped-pink" 
                      style={{ width: totalSpent > 0 ? `${(amt / totalSpent) * 100}%` : '0%' }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Expenses */}
        <motion.div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_black]">
          <h2 className="text-xl font-black uppercase mb-6 flex items-center gap-2">
            <Wallet className="text-black" /> Top Expenses
          </h2>
          <div className="h-[250px] w-full">
            {topExpensesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={topExpensesData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="name" stroke="#000" tick={{ fontSize: 10, fontWeight: 'bold' }} />
                  <YAxis stroke="#000" tick={{ fontSize: 10, fontWeight: 'bold' }} />
                  <Tooltip contentStyle={{ border: '2px solid black', borderRadius: '0', fontWeight: 'bold' }} />
                  <Bar dataKey="amount" radius={[0, 0, 0, 0]} fill="#ff0099" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center font-bold uppercase text-gray-400 border-4 border-dashed border-gray-100">
                No Data
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Budget & Goals Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
        {/* Category breakdown pie */}
        <motion.div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_black] relative">
          <div className="absolute top-[-15px] left-8 bg-wrapped-yellow px-4 py-1 border-2 border-black shadow-hard font-black uppercase text-xl z-10">Category Mix</div>
          <div className="h-[250px] w-full mt-4">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={0}
                    dataKey="value"
                    stroke="#000000"
                    strokeWidth={2}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ border: '2px solid black', borderRadius: '0', fontWeight: 'bold' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center font-bold uppercase text-gray-400 border-4 border-dashed border-gray-100">No Data</div>
            )}
          </div>
        </motion.div>

        {/* Financial Tips */}
        <motion.div className="bg-[#ccff00] border-4 border-black p-8 shadow-[8px_8px_0px_black] relative">
          <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-2">
            <Lightbulb /> Financial Tips
          </h2>
          <div className="space-y-4">
            <div className="bg-white border-2 border-black p-3 hover:translate-x-1 transition-transform">
              <p className="text-sm font-bold leading-tight">Follow the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings.</p>
            </div>
            <div className="bg-white border-2 border-black p-3 hover:translate-x-1 transition-transform">
              <p className="text-sm font-bold leading-tight">An emergency fund should cover at least 3-6 months of your essential expenses.</p>
            </div>
            <div className="bg-white border-2 border-black p-3 hover:translate-x-1 transition-transform">
              <p className="text-sm font-bold leading-tight">Avoid "Impulsive Damage" by waiting 24 hours before making any non-essential purchase over ₹1000.</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Budget Management */}
      <motion.div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_black]">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="flex-grow">
              <h2 className="text-2xl font-black uppercase mb-2">Budget Management</h2>
              {budget ? (
                <p className="font-bold">Current Monthly Limit: <span className="bg-wrapped-lime px-2 py-1">₹{budget.toLocaleString()}</span></p>
              ) : (
                <p className="text-red-500 font-bold animate-pulse">SET YOUR BUDGET NOW OR DIE!</p>
              )}
           </div>
           <form onSubmit={saveBudget} className="flex gap-2 w-full md:w-auto">
              <input 
                type="number" 
                placeholder="New Limit" 
                className="border-2 border-black p-2 font-bold focus:outline-none w-full"
                value={newBudget}
                onChange={e => setNewBudget(e.target.value)}
              />
              <button className="bg-black text-white px-4 font-black uppercase border-2 border-black hover:bg-wrapped-lime hover:text-black transition-colors">Update</button>
           </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
