import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, ArrowRight, Skull } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import RoastCard from './RoastCard';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const Roast = () => {
  const [roastData, setRoastData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [expensesLoading, setExpensesLoading] = useState(true);
  const [roastMeta, setRoastMeta] = useState({ cached: false, fallbackUsed: false });
  const [healthScore, setHealthScore] = useState(null);
  const [loadingText, setLoadingText] = useState('');

  const roastModes = [
    { id: 'chill', label: 'Chill Friend 😄', hint: 'Warm & friendly teasing' },
    { id: 'savage', label: 'Savage Dost 🔥', hint: 'Sharper sarcasm, still respectful' },
    { id: 'mom', label: 'Indian Mom Mode 👩‍👦', hint: 'Disappointed beta vibes' },
    { id: 'ca', label: 'CA Uncle Mode 📊', hint: 'ROI, percentages, finance-nerd roast' },
  ];

  const roastLoadingMessages = [
    'AI tumhari financial life ka postmortem kar raha hai...',
    'Roast chef data paka raha hai...',
    'Tumhare wallet ka audit chal raha hai (with love)...',
    'Delulu check: pending...',
  ];

  const [roastMode, setRoastMode] = useState(() => {
    try {
      return localStorage.getItem('roastMode') || 'chill';
    } catch (e) {
      return 'chill';
    }
  });

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const res = await api.get('/expenses');
            setExpenses(Array.isArray(res?.data?.data) ? res.data.data : []);
      } catch (err) {
        // Chart is best-effort; roast itself can still work.
        console.error('Failed to load expenses for chart:', err);
        setExpenses([]);
      } finally {
        setExpensesLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('roastMode', roastMode);
    } catch (e) {
      // Ignore storage failures (e.g., private mode).
    }
  }, [roastMode]);

  useEffect(() => {
    const fetchHealthScore = async () => {
      try {
        const res = await api.get('/finance/health-score');
        setHealthScore(res?.data?.data?.score ?? null);
      } catch (e) {
        // Not critical for roast generation; best-effort.
      }
    };

    fetchHealthScore();
  }, []);

  const currentMonthExpenses = useMemo(() => {
    const valid = Array.isArray(expenses) ? expenses : [];
    const now = new Date();
    return valid.filter((e) => {
      const d = new Date(e?.date);
      return !Number.isNaN(d.getTime()) && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
  }, [expenses]);

  const amountLine = useMemo(() => {
    const valid = Array.isArray(currentMonthExpenses) ? currentMonthExpenses : [];
    const total = valid.reduce((sum, e) => sum + (Number(e?.amount) || 0), 0);

    const byCat = valid.reduce((acc, e) => {
      const cat = String(e?.category ?? 'Other');
      acc[cat] = (acc[cat] || 0) + (Number(e?.amount) || 0);
      return acc;
    }, {});

    const top = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';
    if (total <= 0 || !top) return '';
    return `₹${total.toLocaleString()} on ${top} spend`;
  }, [currentMonthExpenses]);

  const spendByTypeData = useMemo(() => {
    const totals = currentMonthExpenses.reduce(
      (acc, e) => {
        const amt = Number(e?.amount) || 0;
        if (e?.type === 'impulsive') acc.impulsive += amt;
        else if (e?.type === 'necessary') acc.necessary += amt;
        return acc;
      },
      { impulsive: 0, necessary: 0 }
    );

    // Recharts will render even when both are 0; we can still show a placeholder UI if needed.
    return [
      { name: 'Necessary', amount: totals.necessary, color: '#a3e635' }, // lime-400
      { name: 'Impulsive', amount: totals.impulsive, color: '#ef4444' }, // red-500
    ];
  }, [currentMonthExpenses]);

  const handleRoast = async (retryCount = 0) => {
    if (loading && retryCount === 0) return;
    
    const pickLoadingText = () => roastLoadingMessages[Math.floor(Math.random() * roastLoadingMessages.length)];
    setLoading(true);
    setError('');
    if (retryCount === 0) setRoastData(null);
    if (retryCount === 0) setRoastMeta({ cached: false, fallbackUsed: false });
    if (retryCount === 0) setLoadingText(pickLoadingText());
    
    try {
      const res = await api.post('/roast/generate', { roastMode, forceRefresh: true });
      const payload = res?.data?.data || res?.data;
      if (!payload?.roast || !payload?.insight || !payload?.suggestion) {
        throw new Error('AI response missing required fields (roast/insight/suggestion).');
      }
      setRoastData(payload);
      setRoastMeta({
        cached: Boolean(res?.data?.cached),
        fallbackUsed: Boolean(res?.data?.fallbackUsed),
      });
    } catch (err) {
      console.error('Roast error:', err);

      const status = err?.response?.status;
      const serverMessage = err?.response?.data?.message;

      if (status === 429 && retryCount < 1) {
        // Simple retry once after 5 seconds
        setError('AI is busy. Retrying in 5 seconds...');
        await sleep(5000);
        return handleRoast(retryCount + 1);
      }

      if (status === 429) {
        setError(serverMessage || 'Too many requests. Our AI Dad is tired of your spending. Wait 10 seconds.');
      } else if (status === 401) {
        setError('Your session expired. Please log in again.');
      } else if (status >= 500) {
        setError('Server is overwhelmed by your bad choices. Try again in a bit.');
      } else {
        setError(err.message || 'Failed to generate roast. Please try again.');
      }
    } finally {
      if (retryCount === 0 || !error) setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-10 px-4 relative">
      
      {!roastData && !loading && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-3xl relative z-10">
          <div className="inline-flex p-6 bg-wrapped-pink border-[4px] border-black rounded-none mb-10 shadow-hard animate-wobble">
            <Flame size={80} className="text-white" />
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-white mb-6 uppercase tracking-tighter text-stroke-2 font-heading leading-none">
            Wallet reality ke liye ready?
          </h1>
          <p className="text-xl md:text-2xl font-mono font-bold text-black bg-wrapped-yellow border-[3px] border-black p-4 shadow-hard mb-12 transform -rotate-1">
            AI tumhari financial life ka stand-up karne wali hai. Tum survive kar paoge ya nahi?
          </p>

          <div className="mb-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <div className="font-black uppercase text-xs bg-white border-2 border-black px-3 py-2 shadow-hard">
              Roast Mode
            </div>
            <select
              value={roastMode}
              onChange={(e) => setRoastMode(e.target.value)}
              className="bg-black text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(255,0,153,1)] px-4 py-3 font-black uppercase tracking-tighter text-base"
              title="Pick your roast intensity. Same wallet, different tone."
            >
              {roastModes.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          
          <button 
            onClick={handleRoast}
            disabled={loading}
            className="group relative px-10 py-5 bg-black text-white font-black text-3xl uppercase tracking-tighter border-4 border-wrapped-pink shadow-[8px_8px_0px_0px_rgba(255,0,153,1)] transition-all hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none flex items-center justify-center gap-4 mx-auto"
          >
            Sach sunne ki himmat hai? 🔥
            <ArrowRight size={36} className="text-wrapped-pink group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
          </button>
          
          {error && (
            <div className="mt-10 bg-wrapped-pink text-white font-mono font-bold text-xl p-4 border-[4px] border-black shadow-hard max-w-xl mx-auto flex items-center justify-center gap-4 animate-pop">
              <Skull size={32} />
              {error}
            </div>
          )}
        </motion.div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center space-y-8 absolute top-[40%]">
          <div className="w-32 h-32 border-[8px] border-black border-t-wrapped-pink rounded-full animate-spin"></div>
          <p className="text-4xl font-black font-heading tracking-tighter uppercase text-white text-stroke-1 bg-black px-4 py-2 border-4 border-wrapped-pink animate-pulse">
            {loadingText || 'Roast chef data paka raha hai...'}
          </p>
        </div>
      )}

      <AnimatePresence>
        {roastData && !loading && (
          <motion.div 
            initial={{ opacity: 0, y: 100, rotate: -2 }} 
            animate={{ opacity: 1, y: 0, rotate: 0 }} 
            className="w-full max-w-4xl space-y-8 relative z-10"
          >
            <div className="neo-card p-8 md:p-12 bg-white relative overflow-hidden ring-[10px] ring-black/10">
              <div className="absolute top-[-30px] right-[-30px] opacity-10 rotate-12 pointer-events-none">
                <Skull size={300} className="text-black" />
              </div>

              <RoastCard
                roastData={roastData}
                meta={roastMeta}
                score={healthScore}
                amountLine={amountLine}
                variant="mini"
              />

              {/* Charts: keep container size-safe to avoid Recharts -1/-1 warnings. */}
              <div className="mt-10 bg-wrapped-pink/20 border-4 border-black p-4 md:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-xl md:text-2xl font-black uppercase font-heading tracking-tighter text-black mb-4">
                  This Month: Spend Split
                </h3>
                {expensesLoading ? (
                  <div className="h-32 flex items-center justify-center text-black font-bold">
                    Loading chart...
                  </div>
                ) : (
                  <div className="w-full h-[300px] md:h-[400px]">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                      <BarChart data={spendByTypeData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                        <XAxis dataKey="name" stroke="#000" tick={{ fontSize: 12, fontWeight: 'bold' }} />
                        <YAxis stroke="#000" tick={{ fontSize: 12, fontWeight: 'bold' }} />
                        <Tooltip
                          formatter={(value) => {
                            const n = Number(value);
                            return [`₹${Number.isFinite(n) ? n.toLocaleString() : '0'}`, 'Amount'];
                          }}
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '2px solid black',
                            borderRadius: '0',
                            fontWeight: 'bold',
                          }}
                        />
                        <Bar dataKey="amount" radius={[0, 0, 0, 0]}>
                          {spendByTypeData.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    {currentMonthExpenses.length === 0 && (
                      <div className="mt-3 text-black font-bold uppercase text-sm text-center">
                        No expenses yet for this month.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="text-center mt-12 pt-8">
              <button 
                onClick={handleRoast}
                disabled={loading}
                className="neo-btn bg-white text-black text-2xl"
              >
                Ek aur roast? 🔥
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Roast;
