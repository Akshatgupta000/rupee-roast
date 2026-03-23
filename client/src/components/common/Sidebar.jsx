import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, Target, Flame } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Expenses', path: '/expenses', icon: Receipt },
    { name: 'Goals', path: '/goals', icon: Target },
    { name: 'Roast Me', path: '/roast', icon: Flame, special: true },
  ];

  return (
    <aside className="w-64 hidden md:flex flex-col h-[calc(100vh-90px)] my-6 ml-6 mr-2 sticky top-[95px] bg-white border-[3px] border-black shadow-hard z-10">
      <div className="flex-1 p-4 flex flex-col gap-3">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 border-[3px] border-black font-black uppercase tracking-tight transition-all duration-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
              ${isActive 
                ? item.special 
                  ? 'bg-wrapped-pink text-white translate-x-[2px] translate-y-[2px] shadow-none'
                  : 'bg-wrapped-lime text-black translate-x-[2px] translate-y-[2px] shadow-none'
                : 'bg-white text-black hover:bg-gray-100 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'}
            `}
          >
            {({ isActive }) => (
              <>
                <item.icon size={20} className={isActive && item.special ? 'text-white' : 'text-black'} />
                <span>{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>

      <div className="p-4 border-t-[3px] border-black bg-wrapped-cyan text-black font-mono font-bold text-xs uppercase text-center">
        <p>"Delulu is not the solulu. Data is."</p>
      </div>
    </aside>
  );
};

export default Sidebar;
