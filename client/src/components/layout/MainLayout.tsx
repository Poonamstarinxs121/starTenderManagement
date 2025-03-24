import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import useMobile from '@/lib/hooks/useMobile';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const isMobile = useMobile();
  // By default, don't show sidebar on mobile, but show on desktop
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  // Always reset sidebar state on screen size changes
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);
  
  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };
  
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <Header onMenuClick={toggleSidebar} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
