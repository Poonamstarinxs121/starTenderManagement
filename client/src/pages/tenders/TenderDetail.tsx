import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { ChevronLeft, Edit, Trash2, FileIcon, Plus, Calendar, DollarSign, Target } from 'lucide-react';

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
import { Progress } from '@/components/ui/progress';
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
import { formatDate, formatCurrency, getStatusColor } from '@/lib/utils';

import TenderForm from '@/components/forms/TenderForm';
import DocumentUploadModal from '@/components/modals/DocumentUploadModal';
import { Tender, Document, Activity } from '@shared/schema';

interface TenderDetailProps {
  id: number;
}

export default function TenderDetail({ id }: TenderDetailProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  
  // Fetch tender details
  const { data: tender, isLoading } = useQuery<Tender>({
    queryKey: [`/api/tenders/${id}`],
  });
  
  // Fetch tender documents
  const { data: documents = [], isLoading: documentsLoading } = useQuery<Document[]>({
    queryKey: ['/api/documents', { relatedToId: id, relatedToType: 'tender' }],
  });
  
  // Fetch tender activities
  const { data: activities = [], isLoading: activitiesLoading } = useQuery<Activity[]>({
    queryKey: ['/api/activities', { relatedToId: id, relatedToType: 'tender' }],
  });
  
  // Update tender mutation
  const { mutate: updateTender, isPending: isUpdating } = useMutation({
    mutationFn: async (updatedTender: Partial<Tender>) => {
      const res = await apiRequest('PATCH', `/api/tenders/${id}`, updatedTender);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tenders/${id}`] });
      setShowEditDialog(false);
      toast({
        title: 'Tender updated',
        description: 'Tender has been successfully updated',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update tender',
      });
    },
  });
  
  // Delete tender mutation
  const { mutate: deleteTender, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('DELETE', `/api/tenders/${id}`, undefined);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tenders'] });
      navigate('/tenders');
      toast({
        title: 'Tender deleted',
        description: 'Tender has been successfully deleted',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete tender',
      });
    },
  });
  
  // Convert tender to project mutation
  const { mutate: convertToProject, isPending: isConverting } = useMutation({
    mutationFn: async () => {
      // This would create a new project based on the tender
      if (!tender) return null;
      
      const projectData = {
        name: tender.title,
        client: tender.client,
        description: tender.description,
        value: tender.value || 0,
        startDate: new Date().toISOString(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString(),
        status: "planning",
        progress: 0,
        projectManagerId: tender.assignedToId || 1,
        tenderId: tender.id,
        notes: tender.notes
      };
      
      const res = await apiRequest('POST', '/api/projects', projectData);
      return res.json();
    },
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      
      // Update tender status to won
      updateTender({ status: 'won' });
      
      toast({
        title: 'Project created',
        description: 'Tender has been successfully converted to a project',
      });
      
      // Navigate to the new project
      if (newProject && newProject.id) {
        navigate(`/projects/${newProject.id}`);
      }
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to convert tender to project',
      });
    },
  });
  
  // Handle status badge color
  const getStatusBadge = (status: string) => {
    const statusColor = getStatusColor(status);
    return (
      <Badge variant="outline" className={`${statusColor.bg} ${statusColor.text}`}>
        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
      </Badge>
    );
  };
  
  // Calculate remaining days
  const getRemainingDays = (deadline: string | Date) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: 'Overdue', isOverdue: true };
    if (diffDays === 0) return { text: 'Due today', isOverdue: false };
    return { text: `${diffDays} days left`, isOverdue: false };
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
            <Skeleton className="h-7 w-64 mb-1" />
            <Skeleton className="h-5 w-40" />
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
  
  if (!tender) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Tender Not Found</h2>
        <p className="text-gray-600 mb-6">The tender you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/tenders')}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Tenders
        </Button>
      </div>
    );
  }
  
  const deadlineInfo = getRemainingDays(tender.deadline);
  const canConvertToProject = tender.status === 'won' && !tender.submissionDate;
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" className="mr-4" onClick={() => navigate('/tenders')}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">{tender.title}</h1>
            <p className="text-gray-600">{tender.reference} • {tender.client}</p>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Tender Information</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <div>{getStatusBadge(tender.status)}</div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Client</p>
                    <p className="text-base font-medium">{tender.client}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Value</p>
                    <p className="text-base font-medium">
                      {tender.value 
                        ? formatCurrency(tender.value)
                        : 'Not specified'}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Win Probability</p>
                    <div className="flex items-center">
                      <Progress value={tender.probability} className="h-2 mr-2" />
                      <span className="text-sm font-medium">{tender.probability}%</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Deadline</p>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      <div>
                        <p className="text-base">{formatDate(tender.deadline)}</p>
                        <p className={`text-sm ${deadlineInfo.isOverdue ? 'text-red-500 font-semibold' : 'text-gray-500'}`}>
                          {deadlineInfo.text}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Submission Date</p>
                    <p className="text-base">
                      {tender.submissionDate
                        ? formatDate(tender.submissionDate)
                        : 'Not submitted yet'}
                    </p>
                  </div>
                </div>
                
                {tender.description && (
                  <>
                    <Separator />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">Description</p>
                      <p className="text-base whitespace-pre-line">{tender.description}</p>
                    </div>
                  </>
                )}
                
                {tender.notes && (
                  <>
                    <Separator />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">Notes</p>
                      <p className="text-base whitespace-pre-line">{tender.notes}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tender Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Timeline visualization */}
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex flex-col items-center mr-4">
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                          <DollarSign className="h-4 w-4" />
                        </div>
                        <div className="h-full border-l border-gray-200 w-0 my-2"></div>
                      </div>
                      <div>
                        <p className="font-medium">Created</p>
                        <p className="text-sm text-gray-500">{formatDate(tender.createdAt)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex flex-col items-center mr-4">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                          <Target className="h-4 w-4" />
                        </div>
                        <div className="h-full border-l border-gray-200 w-0 my-2"></div>
                      </div>
                      <div>
                        <p className="font-medium">Deadline</p>
                        <p className="text-sm text-gray-500">{formatDate(tender.deadline)}</p>
                        <p className={`text-sm ${deadlineInfo.isOverdue ? 'text-red-500 font-semibold' : 'text-gray-500'}`}>
                          {deadlineInfo.text}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex flex-col items-center mr-4">
                        <div className={`h-8 w-8 rounded-full ${
                          tender.submissionDate 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-gray-100 text-gray-400'
                        } flex items-center justify-center`}>
                          <FileIcon className="h-4 w-4" />
                        </div>
                      </div>
                      <div>
                        <p className="font-medium">Submission</p>
                        <p className="text-sm text-gray-500">
                          {tender.submissionDate
                            ? formatDate(tender.submissionDate)
                            : 'Not submitted yet'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Tender status */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">Current Status</p>
                    <div className="flex justify-between items-center">
                      <div>{getStatusBadge(tender.status)}</div>
                      <p className="text-sm text-gray-500">
                        {tender.updatedAt
                          ? `Updated ${formatDate(tender.updatedAt)}`
                          : ''}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            {tender.status !== 'won' && tender.status !== 'lost' && (
              <>
                <Button 
                  onClick={() => updateTender({ status: 'won' })}
                  disabled={isUpdating}
                >
                  Mark as Won
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => updateTender({ status: 'lost' })}
                  disabled={isUpdating}
                >
                  Mark as Lost
                </Button>
              </>
            )}
            
            <Button 
              variant={tender.status === 'won' ? 'default' : 'outline'}
              onClick={() => convertToProject()}
              disabled={!canConvertToProject || isConverting}
            >
              {isConverting ? 'Converting...' : 'Convert to Project'}
            </Button>
            
            <Button variant="outline" onClick={() => setShowDocumentModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Document
            </Button>
          </div>
        </TabsContent>
        
        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Tender Documents</h3>
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
                    Upload bid documents, proposals, and supporting materials
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
                  No activity recorded for this tender yet.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Edit Tender Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Tender</DialogTitle>
          </DialogHeader>
          
          <TenderForm 
            tender={tender}
            onSubmit={updateTender}
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
              This will permanently delete this tender and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteTender()}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Tender"}
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
            id: tender.id,
            name: `${tender.title} (${tender.reference})`,
            type: 'tender'
          }
        ]}
      />
    </div>
  );
}
