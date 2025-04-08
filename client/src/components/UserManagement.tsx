import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RolesPage from '@/pages/RolesPage';
import UsersPage from '@/pages/UsersPage';

const UserManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState("users");

  return (
    <div className="container mx-auto py-4">
      <Tabs defaultValue="users" className="w-full" onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">User Management</h1>
            <p className="text-gray-500">Manage users and roles</p>
          </div>
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="roles">Roles</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="users">
          <UsersPage />
        </TabsContent>
        
        <TabsContent value="roles">
          <RolesPage />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserManagement; 