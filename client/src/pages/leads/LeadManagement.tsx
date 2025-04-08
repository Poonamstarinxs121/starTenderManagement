import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { PlusCircle, Search, Filter, Download } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { getStatusColor } from '@/lib/utils';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

import LeadForm from '@/components/forms/LeadForm';
import { Lead, InsertLead, Company } from '@shared/schema';

export default function LeadManagement() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddLeadDialog, setShowAddLeadDialog] = useState(false);
  
  // Fetch all leads
  const { data: leads = [], isLoading } = useQuery<Lead[]>({
    queryKey: ['/api/leads'],
  });
  
  // Fetch all companies
  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ['/api/companies'],
  });
  
  // Create lead mutation
  const { mutate: createLead, isPending: isCreating } = useMutation({
    mutationFn: async (newLead: InsertLead) => {
      const res = await apiRequest('POST', '/api/leads', newLead);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
      setShowAddLeadDialog(false);
      toast({
        title: 'Lead created',
        description: 'New lead has been successfully created',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create lead',
      });
    },
  });
  
  // Filter leads based on search query and status filter
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Unique statuses for filter
  const statuses = ['all', ...new Set(leads.map(lead => lead.status))];
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Lead Management</h1>
          <p className="text-gray-600">Manage and track potential business opportunities</p>
        </div>
        <Button onClick={() => setShowAddLeadDialog(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Lead
        </Button>
      </div>
      
      {/* Search and filter bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search leads..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className={statusFilter === 'all' ? 'bg-muted' : ''}
              onClick={() => setStatusFilter('all')}
            >
              All Statuses
            </DropdownMenuItem>
            {statuses
              .filter(status => status !== 'all')
              .map(status => (
                <DropdownMenuItem
                  key={status}
                  className={statusFilter === status ? 'bg-muted' : ''}
                  onClick={() => setStatusFilter(status)}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button variant="outline" className="w-full sm:w-auto">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>
      
      {/* Leads table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Leads</CardTitle>
          <CardDescription>
            {filteredLeads.length} {filteredLeads.length === 1 ? 'lead' : 'leads'} found
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Source</TableHead>
                <TableHead className="text-right">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Loading skeletons
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-5 w-[120px]" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-[140px]" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-[180px]" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-[100px]" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-[60px] ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredLeads.length > 0 ? (
                // Lead rows
                filteredLeads.map((lead) => {
                  const statusColor = getStatusColor(lead.status);
                  
                  return (
                    <TableRow 
                      key={lead.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/leads/${lead.id}`)}
                    >
                      <TableCell className="font-medium">{lead.name}</TableCell>
                      <TableCell>{lead.company}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${statusColor.bg} ${statusColor.text}`}>
                          {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{lead.email}</TableCell>
                      <TableCell>{lead.source.charAt(0).toUpperCase() + lead.source.slice(1)}</TableCell>
                      <TableCell className="text-right">
                        {lead.value 
                          ? new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: 'USD',
                              maximumFractionDigits: 0
                            }).format(lead.value)
                          : '-'}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                // Empty state
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No leads found. Try adjusting your search or filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredLeads.length} of {leads.length} leads
          </p>
        </CardFooter>
      </Card>
      
      {/* Add Lead Dialog */}
      <Dialog open={showAddLeadDialog} onOpenChange={setShowAddLeadDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Lead</DialogTitle>
          </DialogHeader>
          
          <LeadForm 
            onSubmit={createLead}
            isLoading={isCreating}
            companies={companies}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
