import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import LeadForm from "@/components/forms/LeadForm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Static data for leads
const mockLeads = [
  {
    id: 1,
    name: "John Doe",
    company: "Company A",
    email: "john@example.com",
    phone: "123-456-7890",
    source: "Website",
    department: "Sales",
    value: "10000",
    city: "New York",
    state: "NY",
    country: "USA",
    status: "New",
  },
  {
    id: 2,
    name: "Jane Smith",
    company: "Company B",
    email: "jane@example.com",
    phone: "098-765-4321",
    source: "Referral",
    department: "Marketing",
    value: "15000",
    city: "Los Angeles",
    state: "CA",
    country: "USA",
    status: "In Progress",
  },
];

const LeadsPage: React.FC = () => {
  const [leads, setLeads] = React.useState(mockLeads);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const handleSubmit = (data: any) => {
    const newLead = {
      id: leads.length + 1,
      ...data,
      status: "New",
    };
    setLeads([...leads, newLead]);
    setIsDialogOpen(false);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Leads</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Lead
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl h-[85vh] p-6">
            <DialogHeader className="pb-4">
              <DialogTitle>Add New Lead</DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto pr-2">
              <LeadForm onSubmit={handleSubmit} />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell>{lead.name}</TableCell>
                <TableCell>{lead.company}</TableCell>
                <TableCell>{lead.email}</TableCell>
                <TableCell>{lead.phone}</TableCell>
                <TableCell>{lead.source}</TableCell>
                <TableCell>{lead.department}</TableCell>
                <TableCell>${lead.value}</TableCell>
                <TableCell>
                  {lead.city}, {lead.state}, {lead.country}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      lead.status === "New"
                        ? "default"
                        : lead.status === "In Progress"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {lead.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default LeadsPage; 