import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const res = await register(name, email, password);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background relative uppercase tracking-tight">
      <div className="absolute top-1/3 right-10 w-32 h-32 bg-wrapped-lime border-4 border-black rounded-full shadow-hard animate-wobble mix-blend-multiply hidden md:block" />
      <div className="absolute bottom-1/4 left-10 w-48 h-48 bg-wrapped-yellow border-4 border-black shadow-hard mix-blend-multiply rotate-6 hidden md:block" />
      
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="neo-card w-full max-w-md p-8 md:p-10 z-10 bg-white"
      >
        <div className="text-center border-b-4 border-black pb-6 mb-8">
          <h2 className="text-3xl md:text-4xl font-black mb-2 font-heading">Create Account</h2>
          <p className="font-mono font-bold bg-wrapped-cyan inline-block px-2 py-1 border-2 border-black">Start your journey to self-awareness.</p>
        </div>

        {error && (
          <div className="bg-wrapped-pink border-2 border-black text-white font-bold p-3 mb-6 flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] animate-pop">
            <span className="text-xl">!</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block font-black mb-2 text-lg">Name</label>
            <input 
              type="text" 
              required
              className="w-full bg-white border-2 border-black p-3 font-mono font-bold focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(0,255,255,1)] transition-shadow"
              placeholder="JOHN DOE"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-black mb-2 text-lg">Email</label>
            <input 
              type="email" 
              required
              className="w-full bg-white border-2 border-black p-3 font-mono font-bold focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(204,255,0,1)] transition-shadow"
              placeholder="YOU@EXAMPLE.COM"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block font-black mb-2 text-lg">Password</label>
            <input 
              type="password" 
              required
              className="w-full bg-white border-2 border-black p-3 font-mono font-bold focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(255,0,153,1)] transition-shadow"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            className="neo-btn bg-wrapped-cyan w-full text-xl mt-4"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-8 text-center font-bold text-sm">
          Already have an account? <Link to="/login" className="bg-black text-white px-2 py-1 mx-1 hover:bg-wrapped-lime hover:text-black transition-colors">Log in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
