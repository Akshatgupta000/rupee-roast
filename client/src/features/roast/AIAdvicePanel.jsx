import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Flame, ArrowRight, Loader } from 'lucide-react';
import api from '../../services/api';

const AIAdvicePanel = () => {
  const [advice, setAdvice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchAdvice = async () => {
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/roast');
      const data = res?.data;
      if (!data?.roast) throw new Error('No advice received from AI.');
      setAdvice(data);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 429) {
        setError('AI is overwhelmed. Please wait a moment and try again.');
      } else if (status === 401) {
        setError('Session expired. Please log in again.');
      } else {
        setError('Could not fetch AI advice. Try again later.');
      }
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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black uppercase tracking-tighter text-black flex items-center gap-2">
          <Flame className="text-red-500" /> AI Financial Roast
        </h2>
        <button
          onClick={fetchAdvice}
          disabled={loading}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 font-black uppercase text-sm border-2 border-black shadow-[3px_3px_0px_0px_rgba(255,0,153,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader size={14} className="animate-spin" /> Roasting...
            </>
          ) : (
            <>
              Roast Me <ArrowRight size={14} />
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border-2 border-red-500 p-3 font-bold text-sm text-red-700 mb-4">
          {error}
        </div>
      )}

      <AnimatePresence mode="wait">
        {!advice && !loading && !error && (
          <motion.div
            key="placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-10 text-center gap-4"
          >
            <div className="p-4 bg-wrapped-yellow border-2 border-black shadow-[4px_4px_0px_black]">
              <Lightbulb size={40} className="text-black" />
            </div>
            <p className="font-black uppercase text-sm text-gray-500">
              Click "Roast Me" to get AI-powered financial feedback based on your spending habits.
            </p>
          </motion.div>
        )}

        {advice && (
          <motion.div
            key="advice"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="bg-wrapped-pink/10 border-l-4 border-wrapped-pink p-4">
              <p className="text-xs font-black uppercase text-gray-500 mb-1">🔥 The Roast</p>
              <p className="font-black text-black text-lg leading-snug">"{advice.roast}"</p>
            </div>

            {advice.advice && (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                <p className="text-xs font-black uppercase text-gray-500 mb-1">💡 Advice</p>
                <p className="font-bold text-black text-sm">{advice.advice}</p>
              </div>
            )}

            {advice.suggestion && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4">
                <p className="text-xs font-black uppercase text-gray-500 mb-1">✅ Fix It</p>
                <p className="font-bold text-black text-sm">{advice.suggestion}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AIAdvicePanel;
