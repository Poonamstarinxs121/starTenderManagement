import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Layout: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto py-4 px-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Welcome Home</h1>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => navigate('/users')}>
              Manage Users
            </Button>
            <Button onClick={() => {}} className="bg-blue-600">
              Refresh
            </Button>
          </div>
        </div>
      </header>
      <main className="container mx-auto py-6 px-6">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout; 