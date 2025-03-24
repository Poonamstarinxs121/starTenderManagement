import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { PlusCircle, Search, Filter, FileIcon, Pencil, DownloadCloud, Check, X } from 'lucide-react';

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
import { formatDate, formatFileSize, getFileIcon } from '@/lib/utils';

import DocumentUploadModal from '@/components/modals/DocumentUploadModal';
import DocumentForm from '@/components/forms/DocumentForm';
import { Document, Lead, Project, Tender } from '@shared/schema';

export default function DocumentManagement() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  
  // Fetch all documents
  const { data: documents = [], isLoading } = useQuery<Document[]>({
    queryKey: ['/api/documents'],
  });
  
  // Fetch related entities for document relationships
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });
  
  const { data: leads = [] } = useQuery<Lead[]>({
    queryKey: ['/api/leads'],
  });
  
  const { data: tenders = [] } = useQuery<Tender[]>({
    queryKey: ['/api/tenders'],
  });
  
  // Update document mutation
  const { mutate: updateDocument, isPending: isUpdating } = useMutation({
    mutationFn: async (updatedDoc: Partial<Document> & { id: number }) => {
      const { id, ...docData } = updatedDoc;
      const res = await apiRequest('PATCH', `/api/documents/${id}`, docData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      setShowEditDialog(false);
      toast({
        title: 'Document updated',
        description: 'Document has been successfully updated',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update document',
      });
    },
  });
  
  // Quick status update mutation
  const { mutate: updateStatus } = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest('PATCH', `/api/documents/${id}`, { status, performedById: 1 });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      toast({
        title: 'Status updated',
        description: 'Document status has been updated',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update status',
      });
    },
  });
  
  // Filter documents based on search query, type, and status
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = typeFilter === 'all' || doc.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });
  
  // Unique document types and statuses for filters
  const types = ['all', ...new Set(documents.map(doc => doc.type))];
  const statuses = ['all', ...new Set(documents.map(doc => doc.status))];
  
  // Get related entity name
  const getRelatedEntityName = (doc: Document) => {
    if (!doc.relatedToId || !doc.relatedToType) return 'Not linked';
    
    switch (doc.relatedToType) {
      case 'project':
        const project = projects.find(p => p.id === doc.relatedToId);
        return project ? project.name : 'Unknown project';
      case 'lead':
        const lead = leads.find(l => l.id === doc.relatedToId);
        return lead ? `${lead.name} (${lead.company})` : 'Unknown lead';
      case 'tender':
        const tender = tenders.find(t => t.id === doc.relatedToId);
        return tender ? tender.title : 'Unknown tender';
      default:
        return 'Unknown';
    }
  };
  
  // Prepare related options for document linking
  const getRelatedOptions = () => {
    const options = [
      ...projects.map(p => ({ id: p.id, name: p.name, type: 'project' })),
      ...leads.map(l => ({ id: l.id, name: `${l.name} (${l.company})`, type: 'lead' })),
      ...tenders.map(t => ({ id: t.id, name: t.title, type: 'tender' })),
    ];
    
    return options;
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Document Management</h1>
          <p className="text-gray-600">Manage, track and organize all business documents</p>
        </div>
        <Button onClick={() => setShowUploadModal(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </div>
      
      {/* Search and filter bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search documents..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              <Filter className="mr-2 h-4 w-4" />
              Type: {typeFilter === 'all' ? 'All' : typeFilter}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className={typeFilter === 'all' ? 'bg-muted' : ''}
              onClick={() => setTypeFilter('all')}
            >
              All Types
            </DropdownMenuItem>
            {types
              .filter(type => type !== 'all')
              .map(type => (
                <DropdownMenuItem
                  key={type}
                  className={typeFilter === type ? 'bg-muted' : ''}
                  onClick={() => setTypeFilter(type)}
                >
                  {type}
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              <Filter className="mr-2 h-4 w-4" />
              Status: {statusFilter === 'all' ? 'All' : statusFilter}
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
      </div>
      
      {/* Documents table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Documents</CardTitle>
          <CardDescription>
            {filteredDocuments.length} {filteredDocuments.length === 1 ? 'document' : 'documents'} found
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Related To</TableHead>
                <TableHead>Upload Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Loading skeletons
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Skeleton className="h-10 w-10 rounded" />
                        <div>
                          <Skeleton className="h-5 w-[140px]" />
                          <Skeleton className="h-4 w-[100px] mt-1" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-5 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-[140px]" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-[100px]" /></TableCell>
                  </TableRow>
                ))
              ) : filteredDocuments.length > 0 ? (
                // Document rows
                filteredDocuments.map((doc) => {
                  const isPending = doc.status === 'pending';
                  
                  return (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="bg-gray-100 p-2 rounded">
                            <FileIcon className="h-6 w-6 text-gray-500" />
                          </div>
                          <div>
                            <p className="font-medium">{doc.title}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(doc.fileSize)}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{doc.type}</TableCell>
                      <TableCell>{getRelatedEntityName(doc)}</TableCell>
                      <TableCell>{formatDate(doc.uploadedAt)}</TableCell>
                      <TableCell>
                        <Badge variant={
                          doc.status === 'approved' 
                            ? 'success' 
                            : doc.status === 'rejected' 
                            ? 'destructive' 
                            : 'outline'
                        }>
                          {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedDocument(doc);
                              setShowEditDialog(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          
                          <Button variant="outline" size="sm">
                            <DownloadCloud className="h-4 w-4" />
                          </Button>
                          
                          {isPending && (
                            <>
                              <Button 
                                variant="outline"
                                size="sm"
                                className="text-green-600"
                                onClick={() => updateStatus({ id: doc.id, status: 'approved' })}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              
                              <Button 
                                variant="outline"
                                size="sm"
                                className="text-red-600"
                                onClick={() => updateStatus({ id: doc.id, status: 'rejected' })}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                // Empty state
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No documents found. Try adjusting your search or filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredDocuments.length} of {documents.length} documents
          </p>
        </CardFooter>
      </Card>
      
      {/* Document Upload Modal */}
      <DocumentUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        uploadedById={1} // Default to admin for demo
        relatedOptions={getRelatedOptions()}
      />
      
      {/* Edit Document Dialog */}
      {selectedDocument && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Edit Document</DialogTitle>
            </DialogHeader>
            
            <DocumentForm 
              document={selectedDocument}
              onSubmit={(data) => updateDocument({ ...data, id: selectedDocument.id })}
              isLoading={isUpdating}
              buttonText="Save Changes"
              relatedOptions={getRelatedOptions()}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
