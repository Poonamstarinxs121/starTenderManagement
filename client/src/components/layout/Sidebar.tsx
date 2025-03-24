import React, { useState, useEffect } from 'react';
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
  UserCheck,
  FileSpreadsheet 
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

  const sidebarLinks = [
    { href: '/', icon: 'dashboard', iconComponent: LayoutDashboard, label: 'Dashboard', section: 'Main' },
    { href: '/documents', icon: 'folder', iconComponent: FolderOpen, label: 'Document Management', section: 'Main' },
    { href: '/leads', icon: 'users', iconComponent: UserCheck, label: 'Lead Management', section: 'Business' },
    { href: '/tenders', icon: 'file-text', iconComponent: FileSpreadsheet, label: 'Tender Management', section: 'Business' },
    { href: '/projects', icon: 'briefcase', iconComponent: Briefcase, label: 'Project Tracking', section: 'Business' },
    { href: '/users', icon: 'users', iconComponent: Users, label: 'User Management', section: 'Administration' },
    { href: '/settings', icon: 'settings', iconComponent: Settings, label: 'Settings', section: 'Administration' },
  ];

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-md transition-transform duration-300 
    ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
    lg:translate-x-0 lg:static lg:z-0
    overflow-y-auto
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
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-800">BMS</h1>
            {isMobile && (
              <button 
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>
        
        <div className="flex flex-col h-auto min-h-[calc(100%-64px)]">
          <div className="py-4">
            {/* Group sidebar links by section */}
            {['Main', 'Business', 'Administration'].map(section => {
              const sectionLinks = sidebarLinks.filter(link => link.section === section);
              
              return (
                <div key={section}>
                  <div className="px-4 mb-3 mt-2">
                    <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                      {section}
                    </p>
                  </div>
                  
                  {sectionLinks.map(link => {
                    const isActive = location === link.href || 
                                    (link.href !== '/' && location.startsWith(link.href));
                    
                    return (
                      <Link 
                        key={link.href} 
                        href={link.href}
                        className={`flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100
                          ${isActive ? 'bg-blue-50 border-l-3 border-primary' : ''}
                        `}
                      >
                        <span className="mr-3">
                          {link.iconComponent && 
                            <link.iconComponent 
                              size={18} 
                              className={isActive ? 'text-primary' : 'text-gray-600'} 
                            />
                          }
                        </span>
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
              );
            })}
          </div>
          
          {/* User info at bottom */}
          <div className="border-t border-gray-200 p-4">
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
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
