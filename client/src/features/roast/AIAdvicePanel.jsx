import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Flame, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import RoastCard from './RoastCard';

const AIAdvicePanel = () => {
  const [roastData, setRoastData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [meta, setMeta] = useState({ cached: false, fallbackUsed: false });
  const [healthScore, setHealthScore] = useState(null);
  const [loadingText, setLoadingText] = useState('');

  const roastModes = [
    { id: 'chill', label: 'Chill Friend 😄' },
    { id: 'savage', label: 'Savage Dost 🔥' },
    { id: 'mom', label: 'Indian Mom Mode 👩‍👦' },
    { id: 'ca', label: 'CA Uncle Mode 📊' },
  ];

  const [roastMode, setRoastMode] = useState(() => {
    try {
      return localStorage.getItem('roastMode') || 'chill';
    } catch (e) {
      return 'chill';
    }
  });

  const roastLoadingMessages = [
    'AI tumhari financial life ka postmortem kar rahi hai...',
    'Roast chef data paka raha hai...',
    'Tumhare wallet ko thoda reality dikhaya ja raha hai...',
  ];

  useEffect(() => {
    try {
      localStorage.setItem('roastMode', roastMode);
    } catch (e) {
      // Ignore storage failures.
    }
  }, [roastMode]);

  useEffect(() => {
    const fetchHealthScore = async () => {
      try {
        const res = await api.get('/finance/health-score');
        setHealthScore(res?.data?.data?.score ?? null);
      } catch (e) {
        // Best-effort: panel works even without score.
      }
    };

    fetchHealthScore();
  }, []);

  const fetchAdvice = async () => {
    if (loading) return;
    const pickLoadingText =
      roastLoadingMessages[Math.floor(Math.random() * roastLoadingMessages.length)];

    setLoading(true);
    setError('');
    setRoastData(null);
    setMeta({ cached: false, fallbackUsed: false });
    setLoadingText(pickLoadingText);
    try {
      const res = await api.post('/roast/generate', { roastMode, forceRefresh: true });
      const payload = res?.data?.data || res?.data;

      if (!payload?.roast || !payload?.insight || !payload?.suggestion) {
        throw new Error('AI response missing required fields (roast/insight/suggestion).');
      }
      setRoastData(payload);
      setMeta({ cached: Boolean(res?.data?.cached), fallbackUsed: Boolean(res?.data?.fallbackUsed) });
    } catch (err) {
      const status = err?.response?.status;
      if (status === 429) {
        setError('AI is overwhelmed. Please wait a moment and try again.');
      } else if (status === 401) {
        setError('Session expired. Please log in again.');
      } else {
        setError('Could not fetch AI advice. Try again later.');
      }
      setRoastData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] h-full"
    >
      <div className="mb-4 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-black uppercase tracking-tighter text-black flex items-center gap-2">
            <Flame className="text-red-500" /> AI Financial Roast
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="font-black uppercase text-xs bg-wrapped-yellow border-2 border-black px-3 py-2 shadow-hard">
            Roast Mode
          </div>
          <select
            value={roastMode}
            onChange={(e) => setRoastMode(e.target.value)}
            className="bg-black text-white border-2 border-black px-3 py-2 font-black uppercase tracking-tighter text-xs flex-grow"
            title="Same wallet. Different tone."
          >
            {roastModes.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border-2 border-red-500 p-3 font-bold text-sm text-red-700 mb-4">
          {error}
        </div>
      )}

      <AnimatePresence mode="wait">
        {!roastData && !loading && !error && (
          <motion.div
            key="placeholder"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-10 text-center"
          >
            <button
              onClick={fetchAdvice}
              disabled={loading}
              className="group flex flex-col items-center gap-6 focus:outline-none transition-transform hover:scale-105"
            >
              <div className="p-6 bg-wrapped-yellow border-4 border-black shadow-[8px_8px_0px_black] group-hover:shadow-none group-hover:translate-x-[4px] group-hover:translate-y-[4px] transition-all">
                <Lightbulb size={60} className="text-black" />
              </div>
              
              <div className="space-y-3">
                <h3 className="text-3xl font-black uppercase tracking-tighter text-black group-hover:text-wrapped-pink transition-colors">
                  Sach sunne ki himmat hai? 🔥
                </h3>
                <p className="font-black uppercase text-xs text-gray-400 tracking-widest bg-gray-50 border border-gray-200 px-3 py-1">
                  Mode choose karo, phir roast karwao. Wallet ko drama pasand hai.
                </p>
              </div>
              
              <div className="flex items-center gap-2 text-black font-black uppercase text-sm mt-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                Click to Roast Me <ArrowRight size={18} className="text-wrapped-pink" />
              </div>
            </button>
          </motion.div>
        )}

        {loading && !error && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="text-xs font-bold uppercase bg-black text-white border-2 border-black px-3 py-2 shadow-hard inline-flex items-center gap-2">
              <span>🔥</span> {loadingText || 'Roast chef data paka raha hai...'}
            </div>

            <div className="bg-wrapped-pink/10 border-l-4 border-wrapped-pink p-4">
              <div className="h-4 w-3/4 bg-gray-200 animate-pulse mb-2" />
              <div className="h-10 w-full bg-gray-200 animate-pulse" />
            </div>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
              <div className="h-4 w-1/2 bg-gray-200 animate-pulse mb-2" />
              <div className="h-6 w-full bg-gray-200 animate-pulse" />
            </div>
            <div className="bg-green-50 border-l-4 border-green-500 p-4">
              <div className="h-4 w-1/3 bg-gray-200 animate-pulse mb-2" />
              <div className="h-6 w-full bg-gray-200 animate-pulse" />
            </div>
          </motion.div>
        )}

        {roastData && !loading && (
          <motion.div
            key="roastData"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <RoastCard
              roastData={roastData}
              meta={meta}
              score={healthScore}
              variant="mini"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AIAdvicePanel;
