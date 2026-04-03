import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Menu, X, LayoutDashboard, Receipt, Target, Flame } from 'lucide-react';
import { useNavigate, NavLink } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Expenses', path: '/expenses', icon: Receipt },
    { name: 'Goals', path: '/goals', icon: Target },
    { name: 'Roast Me', path: '/roast', icon: Flame, special: true },
  ];

  return (
    <nav className="bg-wrapped-yellow sticky top-0 z-50 w-full px-4 md:px-6 py-3 md:py-4 flex justify-between items-center border-b-[3px] border-black transition-all duration-300">
      <div className="flex items-center gap-2">
        {/* Hamburger Menu Toggle (Mobile Only) */}
        {user && (
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none translate-x-[-2px]"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        )}
        
        <div className="bg-wrapped-black p-2 border-2 border-white shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
          <span className="text-lg md:text-xl font-black text-white font-heading uppercase tracking-tighter">
            RupeeRoast
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {user && (
          <div className="hidden sm:flex items-center gap-2 text-xs md:text-sm font-mono font-bold bg-white px-3 md:px-4 py-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase">
            <User size={16} className="text-black" />
            <span className="truncate max-w-[80px] md:max-w-none">{user?.name || 'User'}</span>
          </div>
        )}
        
        {user && (
          <button 
            onClick={handleLogout}
            className="p-2 bg-wrapped-pink text-white border-2 border-black hover:bg-black hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        )}
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && user && (
        <div className="absolute top-[calc(100%+3px)] left-0 w-full bg-wrapped-yellow border-b-[3px] border-black md:hidden animate-pop z-50">
          <div className="p-4 flex flex-col gap-3 bg-white">
            <div className="flex items-center gap-2 text-sm font-mono font-bold bg-wrapped-cyan px-4 py-3 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase mb-2">
              <User size={20} className="text-black" />
              <span>{user?.name || 'User'}</span>
            </div>
            
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 border-[3px] border-black font-black uppercase tracking-tight transition-all duration-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                  ${isActive 
                    ? item.special 
                      ? 'bg-wrapped-pink text-white translate-x-[2px] translate-y-[2px] shadow-none'
                      : 'bg-wrapped-lime text-black translate-x-[2px] translate-y-[2px] shadow-none'
                    : 'bg-white text-black hover:bg-gray-100'}
                `}
              >
                <item.icon size={20} />
                <span>{item.name}</span>
              </NavLink>
            ))}
            
            <div className="p-3 border-[3px] border-black bg-wrapped-black text-white font-mono font-bold text-[10px] uppercase text-center mt-2">
              <p>"Delulu is not the solulu. Data is."</p>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
