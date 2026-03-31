import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Laugh, ThumbsUp, Sparkles } from 'lucide-react';

const getScoreLabel = (score) => {
  const n = Number(score);
  if (!Number.isFinite(n)) return null;
  if (n >= 80) return { label: 'CA Approved', color: 'bg-green-200' };
  if (n >= 60) return { label: 'Theek Thaak', color: 'bg-blue-200' };
  if (n >= 40) return { label: 'Wallet Danger Zone', color: 'bg-yellow-200' };
  return { label: 'Papa ko pata chala toh khatam', color: 'bg-red-200' };
};

const RoastCard = ({
  roastData,
  loading = false,
  meta,
  score,
  amountLine = '',
  variant = 'full', // full | mini
}) => {
  const scoreMeta = useMemo(() => getScoreLabel(score), [score]);
  const isMini = variant === 'mini';

  const [phase, setPhase] = useState('hidden'); // hidden | countdown | revealed
  const [countdown, setCountdown] = useState(3);
  const [reaction, setReaction] = useState(null);

  useEffect(() => {
    if (roastData?.roast) {
      setReaction(null);
      setCountdown(3);
      setPhase('countdown');
    }
  }, [roastData?.roast]);

  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown <= 0) {
      setPhase('revealed');
      return;
    }

    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  if (loading) {
    return (
      <div className="bg-white border-4 border-black p-8 md:p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-pulse">
        <div className="h-10 w-2/3 bg-gray-200 mb-4" />
        <div className="h-8 w-full bg-gray-200 mb-3" />
        <div className="h-16 w-full bg-gray-200 mb-6" />
        <div className="h-8 w-1/2 bg-gray-200" />
      </div>
    );
  }

  if (!roastData) return null;

  const roastText = String(roastData.roast ?? '');
  const insightText = String(roastData.insight ?? '');
  const suggestionText = String(roastData.suggestion ?? '');

  const blurPx = phase === 'countdown' ? 10 : 0;
  const roastOpacity = phase === 'countdown' ? 0.35 : 1;

  return (
    <motion.div
      className={`bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden ${
        isMini ? 'p-5 md:p-6' : 'p-8 md:p-10'
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* subtle background */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-black/5 rotate-12 pointer-events-none" />

      <div className="relative z-10 flex items-start justify-between gap-6 mb-6 border-b-4 border-black pb-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-wrapped-pink text-white border-4 border-black px-4 py-2 shadow-[4px_4px_0px_0px_rgba(255,0,153,1)]">
            <Flame className="text-white" />
            <h2 className="text-xl md:text-2xl font-black uppercase leading-none">
              {isMini ? 'The Roast' : "Today&apos;s Rupee Roast"}
            </h2>
          </div>

          {!isMini && amountLine ? (
            <p
              className="mt-3 font-mono font-bold bg-wrapped-yellow text-black border-2 border-black inline-block px-3 py-1 shadow-hard uppercase text-xs"
              title="Screenshot friendly: includes your main spend line."
            >
              {amountLine}
            </p>
          ) : null}
        </div>

        {scoreMeta ? (
          <div className={`p-3 border-2 border-black shadow-hard inline-flex items-center gap-2 ${scoreMeta.color}`}>
            <Sparkles className="w-5 h-5" />
            <span className="font-black uppercase text-xs">{scoreMeta.label}</span>
          </div>
        ) : null}
      </div>

      {/* Roast reveal */}
      <div className="relative z-10">
        <div className="absolute -left-2 top-0 bottom-0 w-2 bg-wrapped-yellow border-r-4 border-black hidden md:block" />

        <motion.p
          className="text-2xl md:text-4xl text-black font-black leading-tight uppercase tracking-tighter pl-0 md:pl-4 py-3 bg-white/95"
          style={{
            filter: `blur(${blurPx}px)`,
            opacity: roastOpacity,
          }}
          animate={{ filter: `blur(${blurPx}px)` }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          &ldquo;{roastText}&rdquo;
        </motion.p>

        <AnimatePresence>
          {phase === 'countdown' ? (
            <motion.div
              key="countdown"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="bg-black text-white border-4 border-black shadow-hard px-10 py-6">
                <div className="text-xs font-black uppercase tracking-tighter text-wrapped-pink mb-1">
                  Roast Reveal in
                </div>
                <div className="text-6xl font-black leading-none">{countdown}</div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Reactions + meta */}
      <div className="relative z-10 mt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-t-4 border-black pt-6">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={`p-2 border-2 border-black shadow-hard bg-white hover:bg-wrapped-pink transition-colors ${reaction === 'lol' ? 'bg-wrapped-pink text-white' : ''}`}
            onClick={() => setReaction('lol')}
            title="Budget dekh ke RBI bhi shock ho gaya."
          >
            <Laugh className="w-5 h-5" />
          </button>
          <button
            type="button"
            className={`p-2 border-2 border-black shadow-hard bg-white hover:bg-wrapped-lime transition-colors ${reaction === 'up' ? 'bg-wrapped-lime text-black' : ''}`}
            onClick={() => setReaction('up')}
            title="Thumbs up for financial honesty."
          >
            <ThumbsUp className="w-5 h-5" />
          </button>
          <div className="text-xs font-bold uppercase font-mono text-black/60">
            {meta?.cached ? 'Cached roast' : meta?.fallbackUsed ? 'Fallback roast' : 'Fresh roast'}
          </div>
        </div>

        {/* tooltip-like microcopy */}
        <div className="text-xs font-bold uppercase font-mono bg-black text-white border-2 border-black px-3 py-2 shadow-hard">
          {phase === 'revealed' ? 'Now shareable. Screenshot time.' : 'Financial discipline loading...'}
        </div>
      </div>

      <div className={`relative z-10 grid gap-6 mt-6 ${isMini ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
        <div className="bg-blue-50 border-4 border-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="text-xs font-black uppercase text-gray-700 mb-2">💡 Insight</div>
          <p className="font-bold text-black text-sm leading-snug">{insightText}</p>
        </div>

        <div className="bg-green-50 border-4 border-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="text-xs font-black uppercase text-gray-700 mb-2">✅ Fix It</div>
          <p className="font-bold text-black text-sm leading-snug">{suggestionText}</p>
        </div>
      </div>

      <div className="relative z-10 mt-6 pt-4 border-t-4 border-black text-center font-mono font-bold uppercase text-xs text-black/60">
        – Rupee Roast
      </div>
    </motion.div>
  );
};

export default RoastCard;

