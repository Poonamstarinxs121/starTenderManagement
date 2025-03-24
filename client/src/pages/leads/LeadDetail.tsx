import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { ChevronLeft, Edit, Trash2, FileIcon, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { formatDate, getStatusColor } from '@/lib/utils';

import LeadForm from '@/components/forms/LeadForm';
import DocumentUploadModal from '@/components/modals/DocumentUploadModal';
import { Lead, Document, Activity } from '@shared/schema';

interface LeadDetailProps {
  id: number;
}

export default function LeadDetail({ id }: LeadDetailProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  
  // Fetch lead details
  const { data: lead, isLoading } = useQuery<Lead>({
    queryKey: [`/api/leads/${id}`],
  });
  
  // Fetch lead documents
  const { data: documents = [], isLoading: documentsLoading } = useQuery<Document[]>({
    queryKey: ['/api/documents', { relatedToId: id, relatedToType: 'lead' }],
  });
  
  // Fetch lead activities
  const { data: activities = [], isLoading: activitiesLoading } = useQuery<Activity[]>({
    queryKey: ['/api/activities', { relatedToId: id, relatedToType: 'lead' }],
  });
  
  // Update lead mutation
  const { mutate: updateLead, isPending: isUpdating } = useMutation({
    mutationFn: async (updatedLead: Partial<Lead>) => {
      const res = await apiRequest('PATCH', `/api/leads/${id}`, updatedLead);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/leads/${id}`] });
      setShowEditDialog(false);
      toast({
        title: 'Lead updated',
        description: 'Lead has been successfully updated',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update lead',
      });
    },
  });
  
  // Delete lead mutation
  const { mutate: deleteLead, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('DELETE', `/api/leads/${id}`, undefined);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
      navigate('/leads');
      toast({
        title: 'Lead deleted',
        description: 'Lead has been successfully deleted',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete lead',
      });
    },
  });
  
  // Handle status badge color
  const getStatusBadge = (status: string) => {
    const statusColor = getStatusColor(status);
    return (
      <Badge variant="outline" className={`${statusColor.bg} ${statusColor.text}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" className="mr-4">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <Skeleton className="h-7 w-40 mb-1" />
            <Skeleton className="h-5 w-64" />
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-40" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Lead Not Found</h2>
        <p className="text-gray-600 mb-6">The lead you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/leads')}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Leads
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" className="mr-4" onClick={() => navigate('/leads')}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">{lead.name}</h1>
            <p className="text-gray-600">{lead.company}</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={() => setShowDeleteAlert(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
          <Button size="sm" onClick={() => setShowEditDialog(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="details" className="space-y-6">
        <div className="bg-white p-1 rounded-md shadow-sm">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
        </div>
        
        {/* Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Lead Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <div>{getStatusBadge(lead.status)}</div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Source</p>
                  <p className="text-base font-medium">
                    {lead.source.charAt(0).toUpperCase() + lead.source.slice(1)}
                  </p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Potential Value</p>
                  <p className="text-base font-medium">
                    {lead.value 
                      ? new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                          maximumFractionDigits: 0
                        }).format(lead.value)
                      : 'Not specified'}
                  </p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-base">{lead.email}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p className="text-base">{lead.phone || 'Not specified'}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Created</p>
                  <p className="text-base">{formatDate(lead.createdAt)}</p>
                </div>
              </div>
              
              {lead.notes && (
                <>
                  <Separator />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Notes</p>
                    <p className="text-base whitespace-pre-line">{lead.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          
          {/* Action buttons for converting to tender, etc. */}
          <div className="flex flex-wrap gap-3">
            <Button variant="outline">Convert to Tender</Button>
            <Button variant="outline">Schedule Follow-up</Button>
            <Button variant="outline">Send Email</Button>
          </div>
        </TabsContent>
        
        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Related Documents</h3>
            <Button onClick={() => setShowDocumentModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-0">
              {documentsLoading ? (
                <div className="p-6 space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded" />
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : documents.length > 0 ? (
                <div className="divide-y">
                  {documents.map((doc) => (
                    <div key={doc.id} className="p-4 flex items-start gap-4">
                      <div className="bg-gray-100 p-2 rounded">
                        <FileIcon className="h-6 w-6 text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-base font-medium">{doc.title}</h4>
                        <p className="text-sm text-gray-500">
                          {doc.type} • {formatDate(doc.uploadedAt)}
                        </p>
                        {doc.description && (
                          <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                        )}
                      </div>
                      <Badge variant={doc.status === 'approved' ? 'success' : (doc.status === 'rejected' ? 'destructive' : 'outline')}>
                        {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <FileIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <h4 className="text-base font-medium text-gray-700">No Documents Yet</h4>
                  <p className="text-sm text-gray-500 mb-4">
                    Upload documents related to this lead
                  </p>
                  <Button onClick={() => setShowDocumentModal(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Upload Document
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <h3 className="text-lg font-medium">Activity History</h3>
          
          <Card>
            <CardContent className="p-0">
              {activitiesLoading ? (
                <div className="p-6 space-y-4">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="border-l-2 border-gray-200 pl-4 pb-5 relative">
                      <Skeleton className="h-3 w-3 rounded-full absolute -left-[7px]" />
                      <Skeleton className="h-5 w-3/4 mb-1" />
                      <Skeleton className="h-4 w-1/3" />
                    </div>
                  ))}
                </div>
              ) : activities.length > 0 ? (
                <div className="p-4">
                  {activities.map((activity, index) => (
                    <div 
                      key={activity.id}
                      className={`border-l-2 ${
                        index === 0 ? 'border-primary' : 'border-gray-200'
                      } pl-4 pb-5 relative ${
                        index === activities.length - 1 ? 'pb-0' : ''
                      }`}
                    >
                      <div 
                        className={`absolute w-3 h-3 ${
                          index === 0 ? 'bg-primary' : 'bg-gray-300'
                        } rounded-full -left-[7px]`}
                      ></div>
                      <p className="text-sm font-medium text-gray-800">{activity.title}</p>
                      {activity.description && (
                        <p className="text-sm text-gray-600">{activity.description}</p>
                      )}
                      <p className="text-xs text-gray-500">{formatDate(activity.createdAt)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  No activity recorded for this lead yet.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Edit Lead Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Lead</DialogTitle>
          </DialogHeader>
          
          <LeadForm 
            lead={lead}
            onSubmit={updateLead}
            isLoading={isUpdating}
            buttonText="Save Changes"
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this lead and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteLead()}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Lead"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Document Upload Modal */}
      <DocumentUploadModal
        isOpen={showDocumentModal}
        onClose={() => setShowDocumentModal(false)}
        uploadedById={1} // Default to admin for demo
        relatedOptions={[
          {
            id: lead.id,
            name: `${lead.name} (${lead.company})`,
            type: 'lead'
          }
        ]}
      />
    </div>
  );
}
