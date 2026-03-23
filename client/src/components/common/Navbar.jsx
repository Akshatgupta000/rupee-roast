import { useAuth } from '../../context/AuthContext';
import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-wrapped-yellow sticky top-0 z-50 w-full px-6 py-4 flex justify-between items-center border-b-[3px] border-black transition-all duration-300">
      <div className="flex items-center gap-2">
        <div className="bg-wrapped-black p-2 border-2 border-white shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
          <span className="text-xl font-black text-white font-heading uppercase tracking-tighter">
            RupeeRoast
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm font-mono font-bold bg-white px-4 py-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase">
          <User size={16} className="text-black" />
          <span>{user?.name || 'User'}</span>
        </div>
        
        <button 
          onClick={handleLogout}
          className="p-2 bg-wrapped-pink text-white border-2 border-black hover:bg-black hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
