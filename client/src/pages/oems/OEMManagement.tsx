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
import { Skeleton } from '@/components/ui/skeleton';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { OEM, InsertOEM } from '@shared/schema';
import OEMForm from '@/components/forms/OEMForm';

export default function OEMManagement() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingOEM, setEditingOEM] = useState<OEM | null>(null);

  // Fetch OEMs
  const { data: oems = [], isLoading } = useQuery<OEM[]>({
    queryKey: ['/api/oems'],
  });

  // Create OEM mutation
  const { mutate: createOEM } = useMutation({
    mutationFn: async (data: InsertOEM) => {
      const res = await apiRequest('POST', '/api/oems', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/oems'] });
      setShowAddDialog(false);
      toast({
        title: 'Success',
        description: 'OEM has been successfully created',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create OEM',
      });
    },
  });

  // Update OEM mutation
  const { mutate: updateOEM } = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: InsertOEM }) => {
      const res = await apiRequest('PUT', `/api/oems/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/oems'] });
      setShowAddDialog(false);
      setEditingOEM(null);
      toast({
        title: 'Success',
        description: 'OEM has been successfully updated',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update OEM',
      });
    },
  });

  // Delete OEM mutation
  const { mutate: deleteOEM } = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/oems/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/oems'] });
      toast({
        title: 'Success',
        description: 'OEM has been successfully deleted',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete OEM',
      });
    },
  });

  // Filter OEMs based on search query
  const filteredOEMs = oems.filter(oem =>
    oem.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    oem.panNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    oem.gstNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">OEM Management</h1>
          <p className="text-gray-600">Manage OEM information and documents</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add OEM
        </Button>
      </div>

      {/* Search bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search OEMs..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* OEMs table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>OEMs</CardTitle>
          <CardDescription>
            {filteredOEMs.length} {filteredOEMs.length === 1 ? 'OEM' : 'OEMs'} found
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company Name</TableHead>
                <TableHead>PAN Number</TableHead>
                <TableHead>GST Number</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Status</TableHead>
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
                    <TableCell><Skeleton className="h-5 w-[150px]" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-[100px]" /></TableCell>
                  </TableRow>
                ))
              ) : filteredOEMs.length > 0 ? (
                filteredOEMs.map((oem) => (
                  <TableRow key={oem.id}>
                    <TableCell className="font-medium">{oem.companyName}</TableCell>
                    <TableCell>{oem.panNumber}</TableCell>
                    <TableCell>{oem.gstNumber}</TableCell>
                    <TableCell>{oem.contactPersonName}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        oem.oemStatus === 'verified' ? 'bg-green-100 text-green-800' :
                        oem.oemStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {oem.oemStatus.charAt(0).toUpperCase() + oem.oemStatus.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingOEM(oem);
                            setShowAddDialog(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this OEM?')) {
                              deleteOEM(oem.id);
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
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No OEMs found. Try adjusting your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit OEM Dialog */}
      <Dialog open={showAddDialog} onOpenChange={(open) => {
        setShowAddDialog(open);
        if (!open) {
          setEditingOEM(null);
        }
      }}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>{editingOEM ? 'Edit OEM' : 'Add New OEM'}</DialogTitle>
            <DialogDescription>
              {editingOEM 
                ? 'Edit OEM information in the form below'
                : 'Fill out the form below to add a new OEM'}
            </DialogDescription>
          </DialogHeader>

          <OEMForm
            onSubmit={(data) => {
              if (editingOEM) {
                updateOEM({ id: editingOEM.id, data });
              } else {
                createOEM(data);
              }
            }}
            isLoading={false}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
} 