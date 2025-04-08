import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import UserManagementForm from "@/components/forms/UserManagementForm";
import { Search, RefreshCcw } from "lucide-react";

const UsersPage: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSubmit = (data: any) => {
    console.log("User data:", data);
    setIsDialogOpen(false);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">User Management</h1>
            <p className="text-sm text-gray-500">Manage system users and permissions</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => console.log("Manage Roles")}>
              Manage Roles
            </Button>
            <Button variant="outline" onClick={() => console.log("Refresh")}>
              <RefreshCcw className="h-4 w-4" />
              <span className="ml-2">Refresh</span>
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  New User
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <UserManagementForm 
                  onSubmit={handleSubmit}
                  onCancel={() => setIsDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow">
          <Search className="h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm border-none shadow-none focus-visible:ring-0"
          />
        </div>

        <div className="bg-white rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                  No results.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-gray-500">
              Showing 1 to 0 of 0 entries
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <div className="flex items-center gap-1">
                <span className="text-sm">Page 1 of 0</span>
              </div>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
              <select className="h-8 w-16 rounded-md border border-input bg-background px-2 text-sm">
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersPage; 