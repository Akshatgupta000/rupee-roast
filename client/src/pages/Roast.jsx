import { useState } from 'react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, ArrowRight, Skull, Frown, ThumbsUp } from 'lucide-react';

const Roast = () => {
  const [roastData, setRoastData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRoast = async () => {
    setLoading(true);
    setError('');
    setRoastData(null);
    try {
      const res = await api.post('/roast');
      setRoastData(res.data);
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.message || 'Failed to generate roast. Gemini Free Tier rate limit? Or you are too broke to roast.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-10 px-4 relative">
      
      {!roastData && !loading && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-3xl relative z-10">
          <div className="inline-flex p-6 bg-wrapped-pink border-[4px] border-black rounded-none mb-10 shadow-hard animate-wobble">
            <Flame size={80} className="text-white" />
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-white mb-6 uppercase tracking-tighter text-stroke-2 font-heading leading-none">Ready to face reality?</h1>
          <p className="text-xl md:text-2xl font-mono font-bold text-black bg-wrapped-yellow border-[3px] border-black p-4 shadow-hard mb-12 transform -rotate-1">
            Our AI Indian Dad has reviewed your recent spending habits. Let's see if you survive the roast.
          </p>
          
          <button 
            onClick={handleRoast}
            className="group relative px-10 py-5 bg-black text-white font-black text-3xl uppercase tracking-tighter border-4 border-wrapped-pink shadow-[8px_8px_0px_0px_rgba(255,0,153,1)] transition-all hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none flex items-center justify-center gap-4 mx-auto"
          >
            ROAST ME NOW
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
            Analyzing your terrible choices...
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
              
              <div className="flex items-center justify-between mb-8 relative z-10 border-b-4 border-black pb-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-wrapped-black text-white rounded-none border-4 border-wrapped-pink shadow-[4px_4px_0px_0px_rgba(255,0,153,1)] animate-wobble">
                    <Flame size={40} />
                  </div>
                  <h2 className="text-5xl font-black text-black uppercase font-heading tracking-tighter">The Verdict</h2>
                </div>
                <div className="font-mono font-bold bg-wrapped-pink text-white border-2 border-black px-4 py-2 text-xl shadow-hard hidden md:block rotate-3">
                  100% TRUTH
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute top-0 left-0 w-8 h-full bg-wrapped-yellow border-r-4 border-black"></div>
                <p className="text-2xl md:text-4xl text-black font-black leading-tight uppercase font-heading tracking-tighter relative z-10 pl-14 py-4 bg-white/90">
                  "{roastData.roast}"
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="neo-card p-8 bg-wrapped-cyan hover:-translate-y-2 hover:rotate-1 transition-transform">
                <div className="flex items-center gap-4 mb-6 border-b-4 border-black pb-4">
                  <div className="bg-white p-3 border-[3px] border-black shadow-hard">
                    <Frown size={32} className="text-black" />
                  </div>
                  <h3 className="text-3xl font-black uppercase font-heading tracking-tighter text-stroke-white-1">Brutal Advice</h3>
                </div>
                <p className="text-lg font-mono font-bold text-black bg-white p-6 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase leading-relaxed">
                  {roastData.advice}
                </p>
              </div>

              <div className="neo-card p-8 bg-wrapped-lime hover:-translate-y-2 hover:-rotate-1 transition-transform">
                <div className="flex items-center gap-4 mb-6 border-b-4 border-black pb-4">
                  <div className="bg-white p-3 border-[3px] border-black shadow-hard">
                    <ThumbsUp size={32} className="text-black" />
                  </div>
                  <h3 className="text-3xl font-black uppercase font-heading tracking-tighter text-stroke-white-1">How to fix it</h3>
                </div>
                <p className="text-lg font-mono font-bold text-black bg-white p-6 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase leading-relaxed">
                  {roastData.suggestion}
                </p>
              </div>
            </div>

            <div className="text-center mt-12 pt-8">
              <button 
                onClick={handleRoast}
                className="neo-btn bg-white text-black text-2xl"
              >
                Request another beating
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Roast;
