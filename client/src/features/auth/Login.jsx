import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const res = await login(email, password);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background relative uppercase tracking-tight">
      <div className="absolute top-20 left-20 w-48 h-48 bg-wrapped-pink border-4 border-black rounded-full shadow-hard animate-wobble mix-blend-multiply hidden md:block" />
      <div className="absolute bottom-20 right-20 w-64 h-64 bg-wrapped-cyan border-4 border-black shadow-hard mix-blend-multiply flex items-center justify-center font-black text-6xl rotate-12 hidden md:block" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="neo-card w-full max-w-md p-8 md:p-10 z-10 bg-white"
      >
        <div className="text-center border-b-4 border-black pb-6 mb-8">
          <h2 className="text-2xl md:text-4xl font-black mb-2 font-heading">Welcome Back</h2>
          <p className="font-mono font-bold bg-wrapped-yellow inline-block px-2 py-1 border-2 border-black">Log in to face your financial reality.</p>
        </div>

        {error && (
          <div className="bg-wrapped-pink border-2 border-black text-white font-bold p-3 mb-6 flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] animate-pop">
            <span className="text-xl">!</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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
            className="neo-btn bg-wrapped-lime w-full text-xl mt-4"
          >
            Log In
          </button>
        </form>

        <p className="mt-8 text-center font-bold text-sm">
          Don't have an account? <Link to="/signup" className="bg-black text-white px-2 py-1 mx-1 hover:bg-wrapped-yellow hover:text-black transition-colors">Sign up</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
