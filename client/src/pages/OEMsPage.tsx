import React, { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { PlusCircle, Search, Edit, Trash2 } from "lucide-react";
import OEMForm from "@/components/forms/OEMForm";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface OEM {
  id: string;
  vendorId: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  status: string;
}

const OEMsPage: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [oems, setOems] = useState<OEM[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingOEM, setEditingOEM] = useState<OEM | null>(null);

  const handleSubmit = (data: any) => {
    if (editingOEM) {
      // Update existing OEM
      setOems(oems.map(oem => 
        oem.id === editingOEM.id ? { ...oem, ...data } : oem
      ));
    } else {
      // Add new OEM
      const newOEM: OEM = {
        id: Date.now().toString(),
        ...data
      };
      setOems([...oems, newOEM]);
    }
    setIsDialogOpen(false);
    setEditingOEM(null);
  };

  const handleEdit = (oem: OEM) => {
    setEditingOEM(oem);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this OEM?")) {
      setOems(oems.filter(oem => oem.id !== id));
    }
  };

  const filteredOEMs = oems.filter(oem => 
    oem.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    oem.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
    oem.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Inactive":
        return "bg-red-100 text-red-800";
      case "Under Review":
        return "bg-yellow-100 text-yellow-800";
      case "Blacklisted":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">OEMs</h1>
          <p className="text-gray-600">Manage your OEM information</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingOEM(null);
        }}>
          <DialogTrigger asChild>
            <Button className="bg-black text-white hover:bg-gray-800 flex items-center gap-2 px-6">
              <PlusCircle className="h-5 w-5" />
              Add New OEM
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="px-6 py-4 border-b sticky top-0 bg-white z-10">
              <DialogTitle className="text-xl font-semibold">Add New OEM</DialogTitle>
            </DialogHeader>
            <div className="p-6">
              <OEMForm 
                onSubmit={handleSubmit} 
                onCancel={() => {
                  setIsDialogOpen(false);
                  setEditingOEM(null);
                }}
                initialData={editingOEM || undefined}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          type="search"
          placeholder="Search OEMs..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company Name</TableHead>
              <TableHead>Contact Person</TableHead>
              <TableHead>Phone No.</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOEMs.length > 0 ? (
              filteredOEMs.map((oem) => (
                <TableRow key={oem.id}>
                  <TableCell className="font-medium">{oem.companyName}</TableCell>
                  <TableCell>{oem.contactPerson}</TableCell>
                  <TableCell>{oem.phone}</TableCell>
                  <TableCell>{oem.email}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(oem.status)}>
                      {oem.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(oem)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleDelete(oem.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No OEMs found. Add your first OEM to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default OEMsPage; 