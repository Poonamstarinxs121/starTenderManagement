import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Factory,
  Users,
  FileText,
  FolderOpen,
  UserCircle,
  FileCheck2
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Companies", href: "/companies", icon: Building2 },
  { name: "OEM", href: "/oem", icon: Factory },
  { name: "Customer", href: "/customers", icon: Users },
  { name: "Lead", href: "/leads", icon: FileText },
  { name: "Document Management", href: "/documents", icon: FolderOpen },
  { name: "User", href: "/users", icon: UserCircle },
  { name: "Project", href: "/projects", icon: FileCheck2 },
];

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg">
          <div className="h-16 flex items-center px-6">
            <h1 className="text-xl font-semibold text-gray-800">StarTender</h1>
          </div>
          <nav className="mt-4">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <item.icon
                        className={`mr-3 h-5 w-5 ${
                          isActive ? "text-blue-600" : "text-gray-400"
                        }`}
                      />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout; 