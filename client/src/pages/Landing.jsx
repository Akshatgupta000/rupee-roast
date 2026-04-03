import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Flame, Target, TrendingUp, ArrowRight } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background text-black flex flex-col items-center justify-center p-4 md:p-12 overflow-x-hidden relative selection:bg-wrapped-lime selection:text-black">
      
      {/* Background decoration */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-wrapped-cyan rounded-full border-[3px] border-black shadow-hard animate-wobble opacity-50 hidden md:block" />
      <div className="absolute bottom-10 right-10 w-48 h-48 bg-wrapped-pink rounded-none border-[4px] border-black shadow-hard transform rotate-12 opacity-50 hidden md:block" />
      <div className="absolute top-1/4 right-1/4 w-16 h-16 bg-wrapped-yellow rounded-full border-[3px] border-black shadow-hard animate-bounce hidden lg:block" />

      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring", bounce: 0.5 }}
        className="z-10 text-center max-w-4xl bg-white border-4 border-black p-8 md:p-16 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative"
      >
        <div className="absolute -top-8 -left-8 w-16 h-16 bg-wrapped-lime border-4 border-black shadow-hard rounded-full flex items-center justify-center animate-wobble">
          <Flame size={32} className="text-black" />
        </div>

        <h1 className="text-4xl md:text-8xl font-black mb-6 tracking-tighter uppercase font-heading text-stroke-1 leading-none">
          Welcome to <span className="bg-wrapped-pink text-white px-2 md:px-4 border-4 border-black inline-block mt-4 -rotate-2 hover:rotate-2 transition-transform shadow-hard">RupeeRoast</span>
        </h1>
        
        <p className="font-mono text-xl md:text-2xl font-bold bg-wrapped-yellow inline-block px-4 py-2 border-2 border-black mb-8 shadow-hard">
          "Delulu is not the solulu. Data is."
        </p>
        
        <p className="text-lg md:text-xl font-bold mb-10 max-w-2xl mx-auto border-l-4 border-black pl-4 text-left">
          Track expenses, set savings goals, and get brutally roasted by our AI Indian Dad for your terrible financial decisions. 
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link to="/signup" className="neo-btn bg-wrapped-lime w-full sm:w-auto text-xl flex items-center justify-center gap-2 group">
            Get Started
            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link to="/login" className="neo-btn bg-white w-full sm:w-auto text-xl">
            Login
          </Link>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 z-10 w-full max-w-6xl"
      >
        <div className="neo-card p-8 bg-wrapped-cyan flex flex-col items-start hover:-translate-y-2 group">
          <div className="bg-white p-3 border-2 border-black mb-6 shadow-hard group-hover:animate-wobble">
            <TrendingUp size={32} />
          </div>
          <h3 className="text-2xl font-black mb-4 uppercase mt-auto text-stroke-white-1">Track Spending</h3>
          <p className="font-mono font-bold text-sm bg-white p-3 border-2 border-black w-full">Log every impulsive Swiggy order and necessary bill.</p>
        </div>
        <div className="neo-card p-8 bg-wrapped-yellow flex flex-col items-start hover:-translate-y-2 group">
          <div className="bg-white p-3 border-2 border-black mb-6 shadow-hard group-hover:animate-wobble">
            <Target size={32} />
          </div>
          <h3 className="text-2xl font-black mb-4 uppercase mt-auto text-stroke-white-1">Set Goals</h3>
          <p className="font-mono font-bold text-sm bg-white p-3 border-2 border-black w-full">Find out exactly how much you need to save monthly.</p>
        </div>
        <div className="neo-card p-8 bg-wrapped-pink flex flex-col items-start hover:-translate-y-2 group">
          <div className="bg-white p-3 border-2 border-black mb-6 shadow-hard group-hover:animate-wobble">
            <Flame size={32} className="text-wrapped-pink" />
          </div>
          <h3 className="text-2xl font-black text-white mb-4 uppercase mt-auto text-stroke-1">Get Roasted</h3>
          <p className="font-mono font-bold text-sm bg-white p-3 border-2 border-black w-full text-black">AI-powered brutal financial reality checks.</p>
        </div>
      </motion.div>

    </div>
  );
};

export default Landing;
