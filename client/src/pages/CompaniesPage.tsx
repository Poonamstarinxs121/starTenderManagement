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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import CompanyForm from "@/components/forms/CompanyForm";

interface Company {
  id: string;
  companyName: string;
  vendorType: string;
  status: string;
  email: string;
  phone: string;
  city: string;
  country: string;
}

const mockCompanies: Company[] = [
  {
    id: "1",
    companyName: "Tech Solutions Inc",
    vendorType: "OEM",
    status: "Active",
    email: "contact@techsolutions.com",
    phone: "+1 234-567-8900",
    city: "San Francisco",
    country: "USA",
  },
  {
    id: "2",
    companyName: "Global Services Ltd",
    vendorType: "Service Provider",
    status: "Active",
    email: "info@globalservices.com",
    phone: "+1 987-654-3210",
    city: "London",
    country: "UK",
  },
];

const CompaniesPage: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>(mockCompanies);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSubmit = (data: any) => {
    const newCompany: Company = {
      id: (companies.length + 1).toString(),
      companyName: data.companyName,
      vendorType: data.vendorType,
      status: data.status,
      email: data.email,
      phone: data.phone,
      city: data.city,
      country: data.country,
    };

    setCompanies([...companies, newCompany]);
    setIsDialogOpen(false);
  };

  const filteredCompanies = companies.filter(company => 
    company.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.vendorType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Companies</h1>
          <p className="text-gray-500">Manage company information</p>
        </div>
        <div className="flex gap-4">
          <Button onClick={() => setIsDialogOpen(true)} className="bg-blue-600">
            Add Company
          </Button>
        </div>
      </div>

      <div className="w-full max-w-sm">
        <Input
          type="search"
          placeholder="Search companies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company Name</TableHead>
              <TableHead>Vendor Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCompanies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500">
                  No results.
                </TableCell>
              </TableRow>
            ) : (
              filteredCompanies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="font-medium">{company.companyName}</TableCell>
                  <TableCell>{company.vendorType}</TableCell>
                  <TableCell>
                    <Badge
                      variant={company.status === "Active" ? "default" : "secondary"}
                      className={company.status === "Active" ? "bg-green-100 text-green-800" : ""}
                    >
                      {company.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{company.email}</TableCell>
                  <TableCell>{company.phone}</TableCell>
                  <TableCell>{`${company.city}, ${company.country}`}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Edit company</span>
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
        <DialogContent className="max-w-2xl">
          <CompanyForm
            onSubmit={handleSubmit}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompaniesPage; 