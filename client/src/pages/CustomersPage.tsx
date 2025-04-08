import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusCircle, Search } from "lucide-react";
import CustomerForm from "@/components/forms/CustomerForm";

const CustomersPage: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSubmit = (data: any) => {
    console.log("Customer data:", data);
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Customers</h1>
          <p className="text-gray-600">Manage your customer information</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
            <DialogHeader className="px-6 py-4 border-b sticky top-0 bg-white z-10">
              <DialogTitle>Add New Customer</DialogTitle>
            </DialogHeader>
            <CustomerForm 
              onSubmit={handleSubmit} 
              onCancel={() => setIsDialogOpen(false)} 
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          type="search"
          placeholder="Search customers..."
          className="pl-8"
        />
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company Name</TableHead>
              <TableHead>GST Number</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Contact No.</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                No customers found. Add your first customer to get started.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CustomersPage; 