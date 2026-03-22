import React from 'react';
import { motion } from 'framer-motion';

const GoalProgress = ({ saved, target }) => {
  const percentage = Math.min((saved / target) * 100, 100);

  return (
    <div className="mt-4">
      <div className="flex justify-between font-bold text-sm mb-2 uppercase">
        <span>Progress</span>
        <span>{percentage.toFixed(1)}%</span>
      </div>
      <div className="w-full h-8 bg-gray-200 border-2 border-black relative overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full bg-[#a3e635] border-r-2 border-black"
        />
      </div>
      <div className="flex justify-between mt-2 text-sm font-bold opacity-80">
        <span>₹{saved} saved</span>
        <span>Target: ₹{target}</span>
      </div>
    </div>
  );
};

export default GoalProgress;
