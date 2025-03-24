import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { PlusCircle, Search, Filter, Download, CalendarIcon } from 'lucide-react';

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
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { formatDate, formatCurrency, getStatusColor } from '@/lib/utils';

import TenderForm from '@/components/forms/TenderForm';
import { Tender, InsertTender } from '@shared/schema';

export default function TenderManagement() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddTenderDialog, setShowAddTenderDialog] = useState(false);
  
  // Fetch all tenders
  const { data: tenders = [], isLoading } = useQuery<Tender[]>({
    queryKey: ['/api/tenders'],
  });
  
  // Create tender mutation
  const { mutate: createTender, isPending: isCreating } = useMutation({
    mutationFn: async (newTender: InsertTender) => {
      const res = await apiRequest('POST', '/api/tenders', newTender);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tenders'] });
      setShowAddTenderDialog(false);
      toast({
        title: 'Tender created',
        description: 'New tender has been successfully created',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create tender',
      });
    },
  });
  
  // Filter tenders based on search query and status filter
  const filteredTenders = tenders.filter(tender => {
    const matchesSearch = 
      tender.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tender.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tender.reference.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || tender.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Unique statuses for filter
  const statuses = ['all', ...new Set(tenders.map(tender => tender.status))];
  
  // Calculate remaining days
  const getRemainingDays = (deadline: string | Date) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    return `${diffDays} days left`;
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Tender Management</h1>
          <p className="text-gray-600">Manage bids and tender opportunities</p>
        </div>
        <Button onClick={() => setShowAddTenderDialog(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Tender
        </Button>
      </div>
      
      {/* Search and filter bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search tenders..."
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
                  {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button variant="outline" className="w-full sm:w-auto">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>
      
      {/* Tenders table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Tenders</CardTitle>
          <CardDescription>
            {filteredTenders.length} {filteredTenders.length === 1 ? 'tender' : 'tenders'} found
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead>Probability</TableHead>
                <TableHead>Deadline</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Loading skeletons
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-5 w-[180px]" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-[140px]" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-[80px]" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-[80px] ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-[60px]" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-[100px]" /></TableCell>
                  </TableRow>
                ))
              ) : filteredTenders.length > 0 ? (
                // Tender rows
                filteredTenders.map((tender) => {
                  const statusColor = getStatusColor(tender.status);
                  const deadlineText = getRemainingDays(tender.deadline);
                  const isOverdue = deadlineText === 'Overdue';
                  
                  return (
                    <TableRow 
                      key={tender.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/tenders/${tender.id}`)}
                    >
                      <TableCell className="font-medium">{tender.title}</TableCell>
                      <TableCell className="font-mono text-sm">{tender.reference}</TableCell>
                      <TableCell>{tender.client}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${statusColor.bg} ${statusColor.text}`}>
                          {tender.status.charAt(0).toUpperCase() + tender.status.slice(1).replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {tender.value 
                          ? formatCurrency(tender.value)
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="w-12 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className={`${
                                tender.probability >= 70 
                                  ? 'bg-green-500'
                                  : tender.probability >= 40
                                  ? 'bg-blue-500'
                                  : 'bg-amber-500'
                              } h-2 rounded-full`}
                              style={{ width: `${tender.probability}%` }}
                            ></div>
                          </div>
                          <span className="text-sm">{tender.probability}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                          <div>
                            <div className="text-sm">{formatDate(tender.deadline)}</div>
                            <div className={`text-xs ${isOverdue ? 'text-red-500 font-semibold' : 'text-gray-500'}`}>
                              {deadlineText}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                // Empty state
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No tenders found. Try adjusting your search or filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredTenders.length} of {tenders.length} tenders
          </p>
        </CardFooter>
      </Card>
      
      {/* Add Tender Dialog */}
      <Dialog open={showAddTenderDialog} onOpenChange={setShowAddTenderDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Tender</DialogTitle>
          </DialogHeader>
          
          <TenderForm 
            onSubmit={createTender}
            isLoading={isCreating}
            buttonText="Create Tender"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
