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
import { CompanyList } from '../components/CompanyList';
import { AddCompanyForm } from '../components/AddCompanyForm';

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

export const CompaniesPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);

  const handleAddClick = () => {
    setSelectedCompany(null);
    setShowForm(true);
  };

  const handleEditClick = (company: any) => {
    setSelectedCompany(company);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedCompany(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Companies</h1>
          <p className="text-gray-600 mt-1">Manage your company information</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {showForm ? 'View Companies' : 'Add New Company'}
        </button>
      </div>

      {showForm ? <AddCompanyForm /> : <CompanyList />}
    </div>
  );
};

export default CompaniesPage; 