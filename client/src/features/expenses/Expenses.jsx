import { useState, useEffect } from 'react';
import api from '../../services/api';
import { motion } from 'framer-motion';
import { Plus, Trash2, X } from 'lucide-react';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', amount: '', category: 'food', type: 'necessary', date: new Date().toISOString().split('T')[0] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await api.get('/expenses');
      setExpenses(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/expenses', { ...formData, amount: Number(formData.amount) });
      setShowForm(false);
      setFormData({ title: '', amount: '', category: 'food', type: 'necessary', date: new Date().toISOString().split('T')[0] });
      fetchExpenses();
    } catch (error) {
      console.error(error);
    }
  };

  const deleteExpense = async (id) => {
    try {
      await api.delete(`/expenses/${id}`);
      setExpenses(expenses.filter(e => e._id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const categories = ['food', 'transport', 'shopping', 'entertainment', 'bills', 'grocery', 'other'];

  if(loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-16 h-16 border-4 border-black border-t-wrapped-pink rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <header className="border-b-4 border-black pb-4 inline-block">
          <h1 className="text-5xl font-black text-white mb-2 uppercase tracking-tighter text-stroke-1 inline-block bg-wrapped-pink px-4 py-2 border-4 border-black shadow-hard-white">Expenses</h1>
          <p className="font-mono font-bold bg-white px-2 py-1 border-2 border-black inline-block mt-4 ml-4 translate-y-[-10px] -rotate-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">Manage all your spending in one place.</p>
        </header>

        <button 
          onClick={() => setShowForm(!showForm)}
          className={`neo-btn flex items-center gap-2 ${showForm ? 'bg-white text-black' : 'bg-wrapped-lime text-black'} text-lg`}
        >
          {showForm ? <><X size={20} className="text-black inline" /> Cancel</> : <><Plus size={20} className="text-black inline" /> Add Expense</>}
        </button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0, y: -20 }} animate={{ opacity: 1, height: 'auto', y: 0 }} className="neo-card p-6 md:p-8 mb-8 bg-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-wrapped-pink border-b-2 border-black"></div>
          <h2 className="text-2xl font-black uppercase mb-6 mt-4">New Expense</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-black uppercase mb-1">Title</label>
              <input required type="text" className="w-full bg-white border-[3px] border-black p-3 font-mono font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(255,0,153,1)] transition-shadow" placeholder="E.g., Swiggy order" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-black uppercase mb-1">Amount (₹)</label>
              <input required type="number" className="w-full bg-white border-[3px] border-black p-3 font-mono font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(255,0,153,1)] transition-shadow" placeholder="0.00" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-black uppercase mb-1">Date</label>
              <input required type="date" className="w-full bg-white border-[3px] border-black p-3 font-mono font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(255,0,153,1)] transition-shadow" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-black uppercase mb-1">Category</label>
              <select required className="w-full bg-wrapped-cyan border-[3px] border-black p-3 font-mono font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow uppercase appearance-none" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-black uppercase mb-1">Type</label>
              <select required className="w-full bg-wrapped-yellow border-[3px] border-black p-3 font-mono font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow uppercase appearance-none" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                <option value="necessary">Necessary</option>
                <option value="impulsive">Impulsive</option>
              </select>
            </div>
            <div className="flex items-end lg:col-span-1">
              <button type="submit" className="neo-btn bg-black text-white w-full shadow-[4px_4px_0px_0px_rgba(204,255,0,1)] hover:shadow-none hover:bg-wrapped-lime hover:text-black">Save Expense</button>
            </div>
          </form>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="neo-card overflow-hidden bg-white p-0">
        <div className="bg-wrapped-black text-white p-4 border-b-4 border-black">
          <h2 className="text-2xl font-black uppercase tracking-tight">All Transactions</h2>
        </div>
        <div className="overflow-x-auto p-4 md:p-6 bg-surface">
          <table className="w-full text-left border-collapse border-[3px] border-black bg-white shadow-hard mb-2">
            <thead className="bg-wrapped-cyan">
              <tr className="border-b-[3px] border-black text-black font-black uppercase font-mono text-sm">
                <th className="p-4 border-r-[3px] border-black">Date</th>
                <th className="p-4 border-r-[3px] border-black">Title</th>
                <th className="p-4 border-r-[3px] border-black">Category</th>
                <th className="p-4 border-r-[3px] border-black">Type</th>
                <th className="p-4 border-r-[3px] border-black text-right">Amount</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {(Array.isArray(expenses) ? expenses : []).map(expense => (
                <tr key={expense._id} className="border-b-[3px] border-black hover:bg-gray-100 transition-colors group">
                  <td className="p-4 font-mono font-bold border-r-[3px] border-black">{new Date(expense.date).toLocaleDateString()}</td>
                  <td className="p-4 font-bold border-r-[3px] border-black uppercase">{expense.title}</td>
                  <td className="p-4 font-mono font-bold border-r-[3px] border-black uppercase">{expense.category}</td>
                  <td className="p-4 border-r-[3px] border-black">
                    <span className={`px-3 py-1 text-xs font-black uppercase border-2 border-black inline-block shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${expense.type === 'impulsive' ? 'bg-wrapped-pink text-white' : 'bg-wrapped-lime text-black'}`}>
                      {expense.type}
                    </span>
                  </td>
                  <td className="p-4 text-right font-black text-xl border-r-[3px] border-black">
                    ₹{expense.amount.toLocaleString()}
                  </td>
                  <td className="p-4 text-center">
                    <button onClick={() => deleteExpense(expense._id)} className="bg-white border-2 border-black p-2 hover:bg-wrapped-pink hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]">
                      <Trash2 size={20} className="inline" />
                    </button>
                  </td>
                </tr>
              ))}
              {(Array.isArray(expenses) ? expenses : []).length === 0 && (
                <tr>
                  <td colSpan="6" className="p-10 text-center font-mono font-bold uppercase text-gray-500 bg-white">No expenses found. Start tracking!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Expenses;
