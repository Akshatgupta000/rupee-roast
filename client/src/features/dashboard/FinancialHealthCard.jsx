import React from 'react';
import { motion } from 'framer-motion';
import { Activity, ShieldAlert, ShieldCheck, HeartPulse } from 'lucide-react';

const FinancialHealthCard = ({ healthData, loading }) => {
  if (loading) {
    return (
      <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-pulse">
        <div className="h-8 bg-gray-200 w-1/2 mb-4"></div>
        <div className="h-12 bg-gray-200 w-full"></div>
      </div>
    );
  }

  if (!healthData) return null;

  const { score, status, message, factors } = healthData;

  const getStatusColor = () => {
    if (score >= 80) return 'bg-green-400';
    if (score >= 60) return 'bg-blue-400';
    if (score >= 40) return 'bg-yellow-400';
    return 'bg-red-400';
  };

  const getStatusIcon = () => {
    if (score >= 80) return <ShieldCheck className="w-8 h-8" />;
    if (score >= 60) return <HeartPulse className="w-8 h-8" />;
    if (score >= 40) return <Activity className="w-8 h-8" />;
    return <ShieldAlert className="w-8 h-8" />;
  };

  const getDisciplineLabel = () => {
    if (score >= 80) return 'CA Approved';
    if (score >= 60) return 'Theek Thaak';
    if (score >= 40) return 'Wallet Danger Zone';
    return 'Papa ko pata chala toh khatam';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${getStatusColor()} border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden`}
    >
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter text-black flex items-center gap-2">
            Financial Health
          </h2>
          <p className="text-black/80 font-bold uppercase text-sm mt-1">{status}</p>
          <p className="mt-2 inline-flex items-center bg-white/30 border-2 border-black px-3 py-1 text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            {getDisciplineLabel()}
          </p>
        </div>
        <div className="bg-white border-2 border-black p-2">
          {getStatusIcon()}
        </div>
      </div>

      <div className="flex items-end gap-2 mb-4 relative z-10">
        <span className="text-6xl font-black text-black">{score}</span>
        <span className="text-2xl font-bold text-black/60 mb-2">/100</span>
      </div>

      <p className="text-black font-medium text-lg leading-tight mb-6 relative z-10">
        "{message}"
      </p>

      <div className="grid grid-cols-2 gap-2 relative z-10">
        {Object.entries(factors).map(([key, val]) => (
          <div key={key} className="bg-white/30 border-2 border-black/20 p-2 text-xs font-bold uppercase">
            <div className="text-black/60">{key}</div>
            <div className="text-lg text-black">{val}%</div>
          </div>
        ))}
      </div>

      {/* Retro background pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-black/5 rotate-45 translate-x-16 -translate-y-16"></div>
    </motion.div>
  );
};

export default FinancialHealthCard;
