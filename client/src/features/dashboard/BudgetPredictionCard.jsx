import React from 'react';
import { motion } from 'framer-motion';
import { Skull, TrendingDown, Wallet, Clock } from 'lucide-react';

const BudgetPredictionCard = ({ prediction, loading }) => {
  if (loading) {
    return (
      <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-pulse">
        <div className="h-8 bg-gray-200 w-1/2 mb-4"></div>
        <div className="h-24 bg-gray-200 w-full"></div>
      </div>
    );
  }

  if (!prediction) return null;

  const { balance, avgDailySpend, predictedDaysLeft, predictedHoursLeft, warning } = prediction;

  const isDying = predictedDaysLeft < 5;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col h-full`}
    >
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-2xl font-black uppercase tracking-tighter text-black flex items-center gap-2">
          {isDying ? <Skull className="text-red-500 fill-red-500 animate-bounce" /> : <Wallet />}
          Death Clock
        </h2>
        <div className="bg-black text-white px-2 py-1 text-xs font-bold uppercase">
          Live Estimate
        </div>
      </div>

      <div className="space-y-4 flex-grow">
        <div className="flex justify-between items-end border-b-2 border-dashed border-black pb-2">
          <span className="text-gray-500 font-bold uppercase text-xs">Remaining Balance</span>
          <span className="text-2xl font-black">₹{balance.toLocaleString()}</span>
        </div>
        
        <div className="flex justify-between items-end border-b-2 border-dashed border-black pb-2">
          <span className="text-gray-500 font-bold uppercase text-xs">Daily Burn Rate</span>
          <span className="text-2xl font-black text-red-500">₹{Math.round(avgDailySpend)}</span>
        </div>

        <div className="mt-8 text-center p-4 bg-black text-white rounded-none border-2 border-black transform rotate-1">
          <p className="text-[10px] font-bold uppercase mb-1 text-gray-400">Time Until Financial Death</p>
          <div className="flex justify-center items-baseline gap-2">
            <span className="text-4xl font-black text-red-400">
              {predictedDaysLeft}
            </span>
            <span className="text-lg font-bold">DAYS</span>
            <span className="text-4xl font-black text-red-400 ml-2">
              {predictedHoursLeft}
            </span>
            <span className="text-lg font-bold">HRS</span>
          </div>
        </div>
      </div>

      <div className="mt-6 p-3 bg-yellow-200 border-2 border-black flex items-center gap-3">
        <TrendingDown className="w-6 h-6 shrink-0" />
        <p className="text-xs font-black uppercase italic leading-none">
          {warning}
        </p>
      </div>
    </motion.div>
  );
};

export default BudgetPredictionCard;
