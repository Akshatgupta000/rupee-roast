import React from 'react';
import { motion } from 'framer-motion';
import { PiggyBank } from 'lucide-react';

const BudgetCard = ({ title, amount, subtitle, icon: Icon, colorClass }) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`relative p-6 bg-white border-4 border-black shadow-[6px_6px_0px_black] ${colorClass}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-black uppercase tracking-wider text-black/80">{title}</h3>
          <p className="text-4xl font-black mt-2">₹{amount.toLocaleString()}</p>
          {subtitle && <p className="text-black/70 mt-1 font-bold">{subtitle}</p>}
        </div>
        <div className="p-4 bg-black rounded-none">
          {Icon ? <Icon className="text-white" size={32} /> : <PiggyBank className="text-white" size={32} />}
        </div>
      </div>
    </motion.div>
  );
};

export default BudgetCard;
