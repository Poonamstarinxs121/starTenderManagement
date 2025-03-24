import React, { useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import useMobile from '@/lib/hooks/useMobile';
import { 
  X, 
  LayoutDashboard, 
  Users, 
  Settings, 
  FolderOpen, 
  Briefcase, 
  FileText, 
  UserCheck 
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();
  const isMobile = useMobile();
  
  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile && isOpen) {
      onClose();
    }
  }, [location, isMobile, isOpen, onClose]);

  // Add/remove body scroll based on sidebar open state on mobile
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, isOpen]);

  // Mobile sidebar class handling
  const sidebarClasses = `
    fixed inset-y-0 left-0 z-50 w-64 h-full bg-white shadow-md overflow-y-auto
    ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
    transition-transform duration-300 ease-in-out
    lg:translate-x-0 lg:static lg:z-0
  `;

  return (
    <>
      {/* Backdrop for mobile */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}
      
      <aside className={sidebarClasses}>
        {/* Logo and Close button */}
        <div className="sticky top-0 bg-white p-4 border-b border-gray-200 z-10">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-800">BMS</h1>
            {isMobile && (
              <button 
                onClick={onClose}
                className="p-1 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>
        
        {/* Navigation items */}
        <nav className="p-2">
          {/* Main section */}
          <div className="mb-6">
            <div className="px-3 mb-2">
              <h2 className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Main</h2>
            </div>
            
            <MenuItem 
              href="/" 
              icon={<LayoutDashboard size={18} />} 
              label="Dashboard" 
              isActive={location === '/'} 
            />
            
            <MenuItem 
              href="/documents" 
              icon={<FolderOpen size={18} />} 
              label="Document Management" 
              isActive={location.startsWith('/documents')} 
            />
          </div>
          
          {/* Business section */}
          <div className="mb-6">
            <div className="px-3 mb-2">
              <h2 className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Business</h2>
            </div>
            
            <MenuItem 
              href="/leads" 
              icon={<UserCheck size={18} />} 
              label="Lead Management" 
              isActive={location.startsWith('/leads')} 
            />
            
            <MenuItem 
              href="/tenders" 
              icon={<FileText size={18} />} 
              label="Tender Management" 
              isActive={location.startsWith('/tenders')} 
            />
            
            <MenuItem 
              href="/projects" 
              icon={<Briefcase size={18} />} 
              label="Project Tracking" 
              isActive={location.startsWith('/projects')} 
            />
          </div>
          
          {/* Administration section */}
          <div className="mb-6">
            <div className="px-3 mb-2">
              <h2 className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Administration</h2>
            </div>
            
            <MenuItem 
              href="/users" 
              icon={<Users size={18} />} 
              label="User Management" 
              isActive={location.startsWith('/users')} 
            />
            
            <MenuItem 
              href="/settings" 
              icon={<Settings size={18} />} 
              label="Settings" 
              isActive={location.startsWith('/settings')} 
            />
          </div>
        </nav>
        
        {/* User profile at bottom */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 z-10">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-3">
              <Users size={16} className="text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">John Doe</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

// Helper component for menu items
interface MenuItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

function MenuItem({ href, icon, label, isActive }: MenuItemProps) {
  return (
    <Link 
      href={href}
      className={`
        flex items-center px-3 py-2 rounded-md my-1
        ${isActive 
          ? 'bg-primary/10 text-primary border-l-4 border-primary font-medium' 
          : 'text-gray-700 hover:bg-gray-100'
        }
      `}
    >
      <span className={`mr-3 ${isActive ? 'text-primary' : 'text-gray-600'}`}>
        {icon}
      </span>
      {label}
    </Link>
  );
}

export default Sidebar;
