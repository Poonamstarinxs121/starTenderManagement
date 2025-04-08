import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import RoleManagementForm from "@/components/forms/RoleManagementForm";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface Role {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  permissions: {
    [key: string]: {
      view: boolean;
      create: boolean;
      edit: boolean;
      delete: boolean;
    };
  };
}

const mockRoles: Role[] = [
  {
    id: "1",
    name: "Admin",
    description: "Full system access",
    isActive: true,
    permissions: {
      users: { view: true, create: true, edit: true, delete: true },
      roles: { view: true, create: true, edit: true, delete: true },
      projects: { view: true, create: true, edit: true, delete: true },
      leads: { view: true, create: true, edit: true, delete: true },
      documents: { view: true, create: true, edit: true, delete: true },
      oems: { view: true, create: true, edit: true, delete: true },
    },
  },
  {
    id: "2",
    name: "Manager",
    description: "Department management access",
    isActive: true,
    permissions: {
      users: { view: true, create: false, edit: false, delete: false },
      roles: { view: true, create: false, edit: false, delete: false },
      projects: { view: true, create: true, edit: true, delete: false },
      leads: { view: true, create: true, edit: true, delete: false },
      documents: { view: true, create: true, edit: true, delete: false },
      oems: { view: true, create: true, edit: true, delete: false },
    },
  },
];

const RolesPage: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>(mockRoles);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSubmit = (data: any) => {
    const newRole: Role = {
      id: (roles.length + 1).toString(),
      name: data.roleName,
      description: data.description || "",
      isActive: data.isActive,
      permissions: data.permissions,
    };

    setRoles([...roles, newRole]);
    setIsDialogOpen(false);
  };

  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Role Management</h1>
          <p className="text-gray-500">Manage user roles and permissions</p>
        </div>
        <div className="flex gap-4">
          <Button onClick={() => setIsDialogOpen(true)} className="bg-blue-600">
            New Role
          </Button>
        </div>
      </div>

      <div className="w-full max-w-sm">
        <Input
          type="search"
          placeholder="Search roles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRoles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-gray-500">
                  No results.
                </TableCell>
              </TableRow>
            ) : (
              filteredRoles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell>{role.description}</TableCell>
                  <TableCell>
                    <Badge
                      variant={role.isActive ? "default" : "secondary"}
                      className={role.isActive ? "bg-green-100 text-green-800" : ""}
                    >
                      {role.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Edit role</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                        <path d="m15 5 4 4" />
                      </svg>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <RoleManagementForm
            onSubmit={handleSubmit}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RolesPage; 