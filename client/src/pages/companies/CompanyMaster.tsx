import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { PlusCircle, Search, Edit, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from '@/components/ui/skeleton';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Company, InsertCompany } from '@shared/schema';

export default function CompanyMaster() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState<InsertCompany>({
    name: '',
    address: '',
    website: '',
    gstNumber: '',
    cinNumber: '',
  });

  // Fetch companies
  const { data: companies = [], isLoading } = useQuery<Company[]>({
    queryKey: ['/api/companies'],
  });

  // Create company mutation
  const { mutate: createCompany } = useMutation({
    mutationFn: async (data: InsertCompany) => {
      const res = await apiRequest('POST', '/api/companies', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
      setShowAddDialog(false);
      resetForm();
      toast({
        title: 'Success',
        description: 'Company has been successfully created',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create company',
      });
    },
  });

  // Update company mutation
  const { mutate: updateCompany } = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: InsertCompany }) => {
      const res = await apiRequest('PUT', `/api/companies/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
      setShowAddDialog(false);
      setEditingCompany(null);
      resetForm();
      toast({
        title: 'Success',
        description: 'Company has been successfully updated',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update company',
      });
    },
  });

  // Delete company mutation
  const { mutate: deleteCompany } = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/companies/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
      toast({
        title: 'Success',
        description: 'Company has been successfully deleted',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete company',
      });
    },
  });

  // Filter companies based on search query
  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.gstNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.cinNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Reset form data
  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      website: '',
      gstNumber: '',
      cinNumber: '',
    });
  };

  // Handle edit company
  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      address: company.address,
      website: company.website,
      gstNumber: company.gstNumber,
      cinNumber: company.cinNumber,
    });
    setShowAddDialog(true);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCompany) {
      updateCompany({ id: editingCompany.id, data: formData });
    } else {
      createCompany(formData);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Company Master</h1>
          <p className="text-gray-600">Manage company information</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Company
        </Button>
      </div>

      {/* Search bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search companies..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Companies table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Companies</CardTitle>
          <CardDescription>
            {filteredCompanies.length} {filteredCompanies.length === 1 ? 'company' : 'companies'} found
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company Name</TableHead>
                <TableHead>GST Number</TableHead>
                <TableHead>CIN Number</TableHead>
                <TableHead>Website</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Loading skeletons
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-5 w-[200px]" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-[150px]" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-[150px]" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-[200px]" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-[100px]" /></TableCell>
                  </TableRow>
                ))
              ) : filteredCompanies.length > 0 ? (
                filteredCompanies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell className="font-medium">{company.name}</TableCell>
                    <TableCell>{company.gstNumber}</TableCell>
                    <TableCell>{company.cinNumber}</TableCell>
                    <TableCell>
                      <a href={company.website} target="_blank" rel="noopener noreferrer" 
                         className="text-blue-600 hover:underline">
                        {company.website}
                      </a>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(company)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this company?')) {
                              deleteCompany(company.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No companies found. Try adjusting your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Company Dialog */}
      <Dialog open={showAddDialog} onOpenChange={(open) => {
        setShowAddDialog(open);
        if (!open) {
          setEditingCompany(null);
          resetForm();
        }
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingCompany ? 'Edit Company' : 'Add New Company'}</DialogTitle>
            <DialogDescription>
              {editingCompany 
                ? 'Edit company information in the form below'
                : 'Fill out the form below to add a new company'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter company name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="Enter company website"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gstNumber">GST Number</Label>
                <Input
                  id="gstNumber"
                  value={formData.gstNumber}
                  onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                  placeholder="Enter GST number"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cinNumber">CIN Number</Label>
                <Input
                  id="cinNumber"
                  value={formData.cinNumber}
                  onChange={(e) => setFormData({ ...formData, cinNumber: e.target.value })}
                  placeholder="Enter CIN number"
                  required
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter company address"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddDialog(false);
                  setEditingCompany(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingCompany ? 'Update Company' : 'Add Company'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 