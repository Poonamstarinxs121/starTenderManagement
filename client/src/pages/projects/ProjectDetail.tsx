import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { ChevronLeft, Edit, Trash2, FileIcon, Plus, Calendar, BarChart2, CheckSquare } from 'lucide-react';

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
import { formatDate, formatCurrency, getStatusColor, generateProjectCode } from '@/lib/utils';

import ProjectForm from '@/components/forms/ProjectForm';
import DocumentUploadModal from '@/components/modals/DocumentUploadModal';
import { Project, Document, Activity, Milestone, User, Tender } from '@shared/schema';

interface ProjectDetailProps {
  id: number;
}

export default function ProjectDetail({ id }: ProjectDetailProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showAddMilestoneDialog, setShowAddMilestoneDialog] = useState(false);
  
  // Fetch project details
  const { data: project, isLoading } = useQuery<Project>({
    queryKey: [`/api/projects/${id}`],
  });
  
  // Fetch project documents
  const { data: documents = [], isLoading: documentsLoading } = useQuery<Document[]>({
    queryKey: ['/api/documents', { relatedToId: id, relatedToType: 'project' }],
  });
  
  // Fetch project activities
  const { data: activities = [], isLoading: activitiesLoading } = useQuery<Activity[]>({
    queryKey: ['/api/activities', { relatedToId: id, relatedToType: 'project' }],
  });
  
  // Fetch project milestones
  const { data: milestones = [], isLoading: milestonesLoading } = useQuery<Milestone[]>({
    queryKey: ['/api/milestones', { projectId: id }],
  });
  
  // Fetch users for project manager assignment
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });
  
  // Fetch tenders (for related tender selection)
  const { data: tenders = [] } = useQuery<Tender[]>({
    queryKey: ['/api/tenders'],
  });
  
  // Update project mutation
  const { mutate: updateProject, isPending: isUpdating } = useMutation({
    mutationFn: async (updatedProject: Partial<Project>) => {
      const res = await apiRequest('PATCH', `/api/projects/${id}`, updatedProject);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}`] });
      setShowEditDialog(false);
      toast({
        title: 'Project updated',
        description: 'Project has been successfully updated',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update project',
      });
    },
  });
  
  // Delete project mutation
  const { mutate: deleteProject, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('DELETE', `/api/projects/${id}`, undefined);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      navigate('/projects');
      toast({
        title: 'Project deleted',
        description: 'Project has been successfully deleted',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete project',
      });
    },
  });
  
  // Create milestone mutation
  const { mutate: createMilestone, isPending: isCreatingMilestone } = useMutation({
    mutationFn: async (newMilestone: { title: string; description?: string; dueDate: string; projectId: number }) => {
      const milestoneData = {
        ...newMilestone,
        dueDate: new Date(newMilestone.dueDate).toISOString(),
        status: 'pending'
      };
      
      const res = await apiRequest('POST', '/api/milestones', milestoneData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/milestones', { projectId: id }] });
      setShowAddMilestoneDialog(false);
      toast({
        title: 'Milestone added',
        description: 'New milestone has been successfully added to the project',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add milestone',
      });
    },
  });
  
  // Update milestone status mutation
  const { mutate: updateMilestone } = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const updatedData = {
        status,
        ...(status === 'completed' ? { completedDate: new Date().toISOString() } : {})
      };
      
      const res = await apiRequest('PATCH', `/api/milestones/${id}`, updatedData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/milestones', { projectId: id }] });
      toast({
        title: 'Milestone updated',
        description: 'Milestone status has been updated',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update milestone',
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
  
  // Find the project manager
  const getProjectManager = () => {
    if (!project) return 'Not assigned';
    const manager = users.find(user => user.id === project.projectManagerId);
    return manager ? manager.fullName : 'Not found';
  };
  
  // Calculate days remaining
  const getDaysRemaining = () => {
    if (!project) return { text: 'N/A', isOverdue: false };
    
    const endDate = new Date(project.endDate);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: 'Overdue', isOverdue: true };
    if (diffDays === 0) return { text: 'Due today', isOverdue: false };
    return { text: `${diffDays} days left`, isOverdue: false };
  };
  
  const remainingDaysInfo = getDaysRemaining();
  
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
  
  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Project Not Found</h2>
        <p className="text-gray-600 mb-6">The project you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/projects')}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Button>
      </div>
    );
  }
  
  const isCompleted = project.status === 'completed';
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" className="mr-4" onClick={() => navigate('/projects')}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">{project.name}</h1>
            <p className="text-gray-600">{generateProjectCode(project.id)} • {project.client}</p>
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
      
      <Tabs defaultValue="overview" className="space-y-6">
        <div className="bg-white p-1 rounded-md shadow-sm">
          <TabsList className="grid grid-cols-4 w-full max-w-md">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
        </div>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Project Information</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <div>{getStatusBadge(project.status)}</div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Client</p>
                    <p className="text-base font-medium">{project.client}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Value</p>
                    <p className="text-base font-medium">{formatCurrency(project.value)}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Project Manager</p>
                    <p className="text-base">{getProjectManager()}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Start Date</p>
                    <p className="text-base">{formatDate(project.startDate)}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">End Date</p>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      <div>
                        <p className="text-base">{formatDate(project.endDate)}</p>
                        <p className={`text-sm ${remainingDaysInfo.isOverdue ? 'text-red-500 font-semibold' : 'text-gray-500'}`}>
                          {remainingDaysInfo.text}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Progress</p>
                  <div className="flex items-center space-x-4">
                    <Progress value={project.progress} className="h-2 flex-1" />
                    <span className="text-sm font-medium">{project.progress}%</span>
                  </div>
                </div>
                
                {project.description && (
                  <>
                    <Separator />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">Description</p>
                      <p className="text-base whitespace-pre-line">{project.description}</p>
                    </div>
                  </>
                )}
                
                {project.notes && (
                  <>
                    <Separator />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">Notes</p>
                      <p className="text-base whitespace-pre-line">{project.notes}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Project Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-gray-500">Created</p>
                    <p className="text-sm">{formatDate(project.createdAt)}</p>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-gray-500">Milestones</p>
                    <p className="text-sm">{milestonesLoading ? '...' : milestones.length}</p>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-gray-500">Documents</p>
                    <p className="text-sm">{documentsLoading ? '...' : documents.length}</p>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <div>{getStatusBadge(project.status)}</div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-gray-500">Upcoming Milestone</p>
                    {milestonesLoading ? (
                      <Skeleton className="h-5 w-24" />
                    ) : (
                      <p className="text-sm">
                        {milestones.filter(m => m.status === 'pending').length > 0 
                          ? formatDate(milestones.filter(m => m.status === 'pending').sort((a, b) => 
                              new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
                            )[0].dueDate)
                          : 'None'}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-gray-500">Days Remaining</p>
                    <p className={`text-sm ${remainingDaysInfo.isOverdue ? 'text-red-500 font-semibold' : ''}`}>
                      {remainingDaysInfo.text}
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <p className="text-sm font-medium text-gray-500">Recent Activity</p>
                  
                  {activitiesLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ) : activities.length > 0 ? (
                    <div className="text-sm space-y-1">
                      {activities.slice(0, 3).map((activity) => (
                        <p key={activity.id} className="text-gray-600">
                          {activity.title} - {formatDate(activity.createdAt)}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No recent activity</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            {!isCompleted && (
              <Button 
                onClick={() => updateProject({ status: 'completed' })}
                disabled={isUpdating}
              >
                <CheckSquare className="mr-2 h-4 w-4" />
                Mark as Completed
              </Button>
            )}
            
            <Button 
              variant={isCompleted ? 'default' : 'outline'}
              onClick={() => setShowAddMilestoneDialog(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Milestone
            </Button>
            
            <Button variant="outline" onClick={() => setShowDocumentModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Document
            </Button>
          </div>
        </TabsContent>
        
        {/* Milestones Tab */}
        <TabsContent value="milestones" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Project Milestones</h3>
            <Button onClick={() => setShowAddMilestoneDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Milestone
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-0">
              {milestonesLoading ? (
                <div className="p-6 space-y-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="border-l-2 border-gray-200 pl-4 pb-5 relative">
                      <Skeleton className="h-3 w-3 rounded-full absolute -left-[7px]" />
                      <Skeleton className="h-5 w-3/4 mb-1" />
                      <Skeleton className="h-4 w-2/3 mb-1" />
                      <Skeleton className="h-4 w-1/3" />
                    </div>
                  ))}
                </div>
              ) : milestones.length > 0 ? (
                <div className="divide-y">
                  {milestones.map((milestone) => {
                    const isCompleted = milestone.status === 'completed';
                    const isDue = new Date(milestone.dueDate) <= new Date() && !isCompleted;
                    
                    return (
                      <div key={milestone.id} className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex items-start">
                            <div className={`mt-1 h-6 w-6 rounded-full flex items-center justify-center ${
                              isCompleted ? 'bg-green-100 text-green-600' : (isDue ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600')
                            }`}>
                              <CheckSquare className="h-4 w-4" />
                            </div>
                            <div className="ml-3">
                              <h4 className="text-base font-medium">{milestone.title}</h4>
                              {milestone.description && (
                                <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                              )}
                              <div className="flex items-center mt-1">
                                <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                                <p className="text-xs text-gray-500">
                                  Due: {formatDate(milestone.dueDate)}
                                  {isCompleted && milestone.completedDate && (
                                    <span className="ml-2 text-green-600">
                                      • Completed: {formatDate(milestone.completedDate)}
                                    </span>
                                  )}
                                  {isDue && (
                                    <span className="ml-2 text-red-600">• Overdue</span>
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center self-end md:self-auto ml-9 md:ml-0">
                            <Badge variant="outline" className={getStatusColor(milestone.status).bg}>
                              {milestone.status.charAt(0).toUpperCase() + milestone.status.slice(1)}
                            </Badge>
                            {!isCompleted && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="ml-2"
                                onClick={() => updateMilestone({ id: milestone.id, status: 'completed' })}
                              >
                                Mark Complete
                              </Button>
                            )}
                            {isCompleted && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="ml-2"
                                onClick={() => updateMilestone({ id: milestone.id, status: 'pending' })}
                              >
                                Reopen
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <CheckSquare className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <h4 className="text-base font-medium text-gray-700">No Milestones Yet</h4>
                  <p className="text-sm text-gray-500 mb-4">
                    Break down your project into milestones to track progress
                  </p>
                  <Button onClick={() => setShowAddMilestoneDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Milestone
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Project Documents</h3>
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
                    Upload project documentation, contracts, and specifications
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
                  No activity recorded for this project yet.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Edit Project Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          
          <ProjectForm 
            project={project}
            onSubmit={updateProject}
            isLoading={isUpdating}
            buttonText="Save Changes"
            users={users}
            tenders={tenders}
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this project and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteProject()}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Project"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Add Milestone Dialog */}
      <Dialog open={showAddMilestoneDialog} onOpenChange={setShowAddMilestoneDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Project Milestone</DialogTitle>
          </DialogHeader>
          
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const title = formData.get('title') as string;
              const description = formData.get('description') as string;
              const dueDate = formData.get('dueDate') as string;
              
              if (!title || !dueDate) return;
              
              createMilestone({
                title,
                description: description || undefined,
                dueDate,
                projectId: id
              });
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">Milestone Title</label>
              <Input id="title" name="title" required />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">Description (Optional)</label>
              <Textarea id="description" name="description" rows={3} />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="dueDate" className="text-sm font-medium">Due Date</label>
              <Input type="date" id="dueDate" name="dueDate" required />
            </div>
            
            <div className="flex justify-end space-x-2 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowAddMilestoneDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreatingMilestone}>
                {isCreatingMilestone ? "Adding..." : "Add Milestone"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Document Upload Modal */}
      <DocumentUploadModal
        isOpen={showDocumentModal}
        onClose={() => setShowDocumentModal(false)}
        uploadedById={1} // Default to admin for demo
        relatedOptions={[
          {
            id: project.id,
            name: `${project.name} (${generateProjectCode(project.id)})`,
            type: 'project'
          }
        ]}
      />
    </div>
  );
}
