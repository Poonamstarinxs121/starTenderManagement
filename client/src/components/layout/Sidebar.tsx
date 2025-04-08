import React from 'react';
import { Link, useLocation } from 'wouter';
import { 
  X, 
  LayoutDashboard, 
  Users, 
  Settings, 
  FolderOpen, 
  Briefcase, 
  FileText, 
  UserCheck,
  Building2
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [, location] = useLocation();
  const currentPath = location as unknown as string;
  
  // Simple list of navigation links
  const navLinks = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/leads', label: 'Lead Management', icon: <UserCheck size={20} /> },
    { path: '/oems', label: 'OEM Management', icon: <Building2 size={20} /> },
    { path: '/tenders', label: 'Tender Management', icon: <FileText size={20} /> },
    { path: '/projects', label: 'Project Tracking', icon: <Briefcase size={20} /> },
    { path: '/documents', label: 'Document Management', icon: <FolderOpen size={20} /> },
    { path: '/users', label: 'User Management', icon: <Users size={20} /> },
    { path: '/settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40" 
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg overflow-y-auto
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-30
        `}
      >
        {/* Logo and close button */}
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="text-xl font-bold text-primary">BMS</h1>
          <button 
            onClick={onClose} 
            className="lg:hidden p-1 rounded-md text-gray-500 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Navigation links */}
        <nav className="p-2">
          <ul className="space-y-1">
            {navLinks.map((link) => {
              const isActive = link.path === '/' 
                ? currentPath === link.path
                : currentPath.startsWith(link.path);
                
              return (
                <li key={link.path}>
                  <Link
                    href={link.path}
                    className={`
                      flex items-center gap-3 px-3 py-3 rounded-md 
                      ${isActive 
                        ? 'bg-primary text-white font-medium' 
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    <span>{link.icon}</span>
                    <span>{link.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        {/* User profile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">JD</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">John Doe</p>
              <p className="text-xs text-gray-500 truncate">john.doe@example.com</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
