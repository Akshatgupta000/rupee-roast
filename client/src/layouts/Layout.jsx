import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const Layout = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navbar />
      <div className="flex flex-1 max-w-[1600px] w-full mx-auto relative">
        <Sidebar />
        
        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-8 lg:p-10 min-h-full overflow-x-hidden relative z-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
