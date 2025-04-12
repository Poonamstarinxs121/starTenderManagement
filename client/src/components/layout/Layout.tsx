import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Factory,
  Users,
  FileText,
  FileStack,
  Target,
  UserCog,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { Outlet } from "react-router-dom";

const Layout = () => {
  const location = useLocation();
  
  const navigation = [
    {
      name: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      name: "Companies",
      href: "/companies",
      icon: Building2,
    },
    {
      name: "OEMs",
      href: "/oems",
      icon: Factory,
    },
    {
      name: "Customers",
      href: "/customers",
      icon: Users,
    },
    {
      name: "User Management",
      href: "/users",
      icon: UserCog,
    },
    {
      name: "Leads",
      href: "/leads",
      icon: Target,
    },
    {
      name: "Document Management",
      href: "/documents",
      icon: FileText,
    },
    {
      name: "Tender Management",
      href: "/tenders",
      icon: FileStack,
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Header with yellow wave background */}
      <div className="relative bg-gradient-to-b from-yellow-300 to-yellow-100">
        <div className="absolute inset-0" style={{
          backgroundImage: "url('/wave.svg')",
          backgroundSize: "cover",
          backgroundPosition: "bottom",
          opacity: 0.5
        }} />
        <div className="relative px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">StarTenderManagement</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-5rem)]">
          <nav className="flex flex-col p-4 gap-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-h-[calc(100vh-5rem)] bg-gray-50">
          <main className="p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout; 