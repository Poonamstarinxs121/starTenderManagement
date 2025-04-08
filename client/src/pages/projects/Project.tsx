import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { PlusCircle, Search, Filter, Download, Calendar, ChartBar, ArrowUpRight, Plus, FileText, Upload, Trash2 } from 'lucide-react';

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
  DialogDescription,
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
import { formatDate, formatCurrency, getStatusColor, generateProjectCode } from '@/lib/utils';

import ProjectForm from '@/components/forms/ProjectForm';
import { InsertProject, User } from '@shared/schema';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Base interfaces
interface Milestone {
  id: number;
  name: string;
  date: Date;
  status: 'pending' | 'completed' | 'in_progress';
}

interface ProjectDocument {
  id: number;
  name: string;
  type: string;
  category: 'contract' | 'specification' | 'report' | 'other';
  uploadDate: Date;
  fileUrl: string;
  description?: string;
}

interface ProjectReport {
  id: number;
  name: string;
  type: string;
  uploadDate: Date;
  fileUrl: string;
  description?: string;
}

interface MaintainedDocument {
  id: number;
  projectId: string;
  projectName: string;
  startDate: Date;
  endDate: Date;
  projectDescription: string;
  clientName: string;
  reportFiles: {
    id: number;
    name: string;
    uploadDate: Date;
    fileUrl: string;
  }[];
}

// Base Project interface
interface BaseProject {
  id: number;
  name: string;
  client: string;
  value: number;
  startDate: Date;
  endDate: Date;
  projectManagerId: number;
  description?: string | null;
  status: string;
  progress?: number | null;
  tenderId?: number | null;
  notes?: string | null;
}

// Complete Project interface with all features
interface ExtendedProject extends BaseProject {
  milestones?: Milestone[];
  documents?: ProjectDocument[];
  reports?: ProjectReport[];
  maintainedDocs?: MaintainedDocument[];
}

// Rename the component to Project
function Project() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddProjectDialog, setShowAddProjectDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ExtendedProject | null>(null);
  const [showProgressDialog, setShowProgressDialog] = useState(false);
  const [showAddMilestoneDialog, setShowAddMilestoneDialog] = useState(false);
  const [selectedMilestoneProject, setSelectedMilestoneProject] = useState<ExtendedProject | null>(null);
  const [newMilestone, setNewMilestone] = useState<{
    name: string;
    date: string;
    status: 'pending' | 'completed' | 'in_progress';
  }>({
    name: '',
    date: '',
    status: 'pending'
  });
  const [showAddDocumentDialog, setShowAddDocumentDialog] = useState(false);
  const [selectedDocumentProject, setSelectedDocumentProject] = useState<ExtendedProject | null>(null);
  const [newDocument, setNewDocument] = useState<{
    name: string;
    type: string;
    category: 'contract' | 'specification' | 'report' | 'other';
    description: string;
    file: File | null;
  }>({
    name: '',
    type: '',
    category: 'other',
    description: '',
    file: null
  });
  const [showAddReportDialog, setShowAddReportDialog] = useState(false);
  const [selectedReportProject, setSelectedReportProject] = useState<ExtendedProject | null>(null);
  const [newReport, setNewReport] = useState<{
    name: string;
    type: string;
    description: string;
    file: File | null;
  }>({
    name: '',
    type: '',
    description: '',
    file: null
  });
  const [showMaintainDocDialog, setShowMaintainDocDialog] = useState(false);
  const [selectedMaintainProject, setSelectedMaintainProject] = useState<ExtendedProject | null>(null);
  const [newMaintainedDoc, setNewMaintainedDoc] = useState<{
    projectId: string;
    projectName: string;
    startDate: string;
    endDate: string;
    projectDescription: string;
    clientName: string;
    reportFile: File | null;
  }>({
    projectId: '',
    projectName: '',
    startDate: '',
    endDate: '',
    projectDescription: '',
    clientName: '',
    reportFile: null
  });
  
  // Add projects query
  const { data: projects = [], isLoading } = useQuery<ExtendedProject[]>({
    queryKey: ['/api/projects'],
  });
  
  // Fetch users for project manager assignment
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });
  
  // Update the project creation mutation
  const { mutate: createProject, isPending: isCreating } = useMutation({
    mutationFn: async (data: InsertProject) => {
      const formattedProject = {
        ...data,
        startDate: data.startDate.toISOString(),
        endDate: data.endDate.toISOString(),
        progress: data.progress ?? 0,
        value: Number(data.value),
        projectManagerId: Number(data.projectManagerId)
      };
      const res = await apiRequest('POST', '/api/projects', formattedProject);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      setShowAddProjectDialog(false);
      toast({
        title: 'Project created',
        description: 'New project has been successfully created',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create project',
      });
    },
  });
  
  // Add active tab state
  const [activeTab, setActiveTab] = useState('all-projects');
  
  // Unique statuses for filter - convert Set to Array to fix iteration error
  const statuses = ['all', ...Array.from(new Set(projects.map(project => project.status)))];
  
  // Filter projects based on search query and status filter
  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.client.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Update the status color handling to return a single string
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Helper function to handle progress display
  const getProgressDisplay = (progress: number | null | undefined) => {
    const value = progress ?? 0;
    return {
      width: `${value}%`,
      className: value >= 70 
        ? 'bg-green-500' 
        : value >= 40 
        ? 'bg-blue-500' 
        : 'bg-amber-500'
    };
  };
  
  // Update the progress color handling
  const getProgressColor = (progress: number | null | undefined) => {
    const value = progress ?? 0;
    if (value >= 75) return 'bg-green-600';
    if (value >= 50) return 'bg-blue-600';
    if (value >= 25) return 'bg-yellow-600';
    return 'bg-red-600';
  };
  
  // Helper function to safely get progress value
  const getProgressValue = (progress: number | null | undefined): number => {
    return progress ?? 0;
  };
  
  // Helper function to format dates for display
  const formatDateString = (date: Date | string): string => {
    return new Date(date).toISOString();
  };
  
  // Add milestone mutation
  const { mutate: addMilestone } = useMutation({
    mutationFn: async (data: { projectId: number; milestone: Omit<Milestone, 'id'> }) => {
      const res = await apiRequest('POST', `/api/projects/${data.projectId}/milestones`, data.milestone);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      setShowAddMilestoneDialog(false);
      setNewMilestone({ name: '', date: '', status: 'pending' });
      toast({
        title: 'Milestone added',
        description: 'Project milestone has been successfully added',
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
  
  // Update the document mutation
  const { mutate: addDocument } = useMutation({
    mutationFn: async (data: { projectId: number; document: Omit<ProjectDocument, 'id' | 'uploadDate' | 'fileUrl'> & { file: File } }) => {
      const formData = new FormData();
      if (data.document.file) {
        formData.append('file', data.document.file);
        formData.append('name', data.document.name);
        formData.append('type', data.document.file.type);
        formData.append('category', data.document.category);
        if (data.document.description) {
          formData.append('description', data.document.description);
        }
      }

      await apiRequest('POST', `/api/projects/${data.projectId}/documents`, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      setShowAddDocumentDialog(false);
      setNewDocument({
        name: '',
        type: '',
        category: 'other',
        description: '',
        file: null
      });
      toast({
        title: 'Document added',
        description: 'Project document has been successfully added',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add document',
      });
    },
  });
  
  // Update the report mutation
  const { mutate: addReport } = useMutation({
    mutationFn: async (data: { projectId: number; report: Omit<ProjectReport, 'id' | 'uploadDate' | 'fileUrl'> & { file: File } }) => {
      const formData = new FormData();
      if (data.report.file) {
        formData.append('file', data.report.file);
        formData.append('name', data.report.name);
        formData.append('type', data.report.file.type);
        if (data.report.description) {
          formData.append('description', data.report.description);
        }
      }

      await apiRequest('POST', `/api/projects/${data.projectId}/reports`, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      setShowAddReportDialog(false);
      setNewReport({
        name: '',
        type: '',
        description: '',
        file: null
      });
      toast({
        title: 'Report added',
        description: 'Project report has been successfully added',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add report',
      });
    },
  });
  
  // Update the maintained document mutation
  const { mutate: addMaintainedDoc } = useMutation({
    mutationFn: async (data: { projectId: number; document: Omit<MaintainedDocument, 'id' | 'reportFiles'> & { reportFile: File } }) => {
      const formData = new FormData();
      if (data.document.reportFile) {
        formData.append('file', data.document.reportFile);
        formData.append('projectId', data.document.projectId);
        formData.append('projectName', data.document.projectName);
        formData.append('startDate', data.document.startDate.toISOString());
        formData.append('endDate', data.document.endDate.toISOString());
        formData.append('projectDescription', data.document.projectDescription);
        formData.append('clientName', data.document.clientName);
      }

      await apiRequest('POST', `/api/projects/${data.projectId}/maintain-docs`, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      setShowMaintainDocDialog(false);
      setNewMaintainedDoc({
        projectId: '',
        projectName: '',
        startDate: '',
        endDate: '',
        projectDescription: '',
        clientName: '',
        reportFile: null
      });
      toast({
        title: 'Document maintained',
        description: 'Project document has been successfully maintained',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to maintain document',
      });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Project</h1>
          <p className="text-gray-600">Manage and track ongoing projects</p>
        </div>
        <Button onClick={() => setShowAddProjectDialog(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Project
        </Button>
      </div>

      <Tabs defaultValue="all-projects" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all-projects">All Projects</TabsTrigger>
          <TabsTrigger value="progress-monitor">Monitor Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="all-projects">
          {/* Search and filter bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search projects..."
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
          
          {/* Projects table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Projects</CardTitle>
              <CardDescription>
                {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'} found
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>End Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    // Loading skeletons
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Skeleton className="h-8 w-8 rounded-md" />
                            <div>
                              <Skeleton className="h-5 w-[140px]" />
                              <Skeleton className="h-4 w-[100px] mt-1" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell><Skeleton className="h-5 w-[140px]" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-[80px]" /></TableCell>
                        <TableCell>
                          <Skeleton className="h-2 w-full rounded-full" />
                          <Skeleton className="h-4 w-[60px] mt-1" />
                        </TableCell>
                        <TableCell><Skeleton className="h-5 w-[80px]" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-[100px]" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredProjects.length > 0 ? (
                    // Project rows
                    filteredProjects.map((project) => {
                      const statusColor = getStatusColor(project.status);
                      
                      return (
                        <TableRow 
                          key={project.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => navigate(`/projects/${project.id}`)}
                        >
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="h-8 w-8 bg-indigo-100 rounded-md flex items-center justify-center">
                                <span className="material-icons text-accent text-sm">business</span>
                              </div>
                              <div>
                                <p className="font-medium">{project.name}</p>
                                <p className="text-xs text-gray-500 font-mono">{generateProjectCode(project.id)}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{project.client}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusColor}>
                              {project.status.charAt(0).toUpperCase() + project.status.slice(1).replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`${getProgressDisplay(getProgressValue(project.progress)).className} h-2 rounded-full`}
                                style={{ width: `${getProgressValue(project.progress)}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500 mt-1 inline-block">
                              {getProgressValue(project.progress)}% Complete
                            </span>
                          </TableCell>
                          <TableCell>{formatCurrency(project.value)}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                              <span>{formatDate(project.endDate)}</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    // Empty state
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No projects found. Try adjusting your search or filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {filteredProjects.length} of {projects.length} projects
              </p>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="progress-monitor">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Monitor Project Progress</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search project or client..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {isLoading ? (
                  // Loading skeletons
                  Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="space-y-2">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-2 w-full" />
                      <Skeleton className="h-4 w-[100px]" />
                    </div>
                  ))
                ) : filteredProjects.length > 0 ? (
                  filteredProjects.map((project) => (
                    <div 
                      key={project.id}
                      className="space-y-2 p-4 rounded-lg border hover:bg-muted/50"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{project.name}</h3>
                          <p className="text-sm text-muted-foreground">{project.client}</p>
                        </div>
                        <Badge variant="outline" className={getStatusColor(project.status)}>
                          {project.status.charAt(0).toUpperCase() + project.status.slice(1).replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span className="font-medium">{getProgressValue(project.progress)}%</span>
                        </div>
                        <Progress 
                          value={getProgressValue(project.progress)} 
                          className={getProgressColor(getProgressValue(project.progress))}
                        />
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Due: {formatDate(project.endDate)}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProject(project);
                              setShowProgressDialog(true);
                            }}
                          >
                            <ArrowUpRight className="h-4 w-4 mr-1" />
                            View Progress
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/projects/${project.id}`);
                            }}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No projects found. Try adjusting your search.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Project Dialog */}
      <Dialog open={showAddProjectDialog} onOpenChange={setShowAddProjectDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Project</DialogTitle>
            <DialogDescription>Fill out the form below to create a new project</DialogDescription>
          </DialogHeader>
          
          <ProjectForm 
            onSubmit={createProject}
            isLoading={isCreating}
            buttonText="Create Project"
            users={users}
          />
        </DialogContent>
      </Dialog>

      {/* Progress Details Dialog */}
      <Dialog open={showProgressDialog} onOpenChange={setShowProgressDialog}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Project Details</DialogTitle>
          </DialogHeader>
          
          {selectedProject && (
            <div className="space-y-8">
              {/* Project Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Project Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Project ID</p>
                    <p className="text-sm text-muted-foreground">{generateProjectCode(selectedProject.id)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Project Name</p>
                    <p className="text-sm text-muted-foreground">{selectedProject.name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Client Name</p>
                    <p className="text-sm text-muted-foreground">{selectedProject.client}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Status</p>
                    <Badge variant="outline" className={getStatusColor(selectedProject.status)}>
                      {selectedProject.status.charAt(0).toUpperCase() + selectedProject.status.slice(1).replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Start Date</p>
                    <p className="text-sm text-muted-foreground">{formatDate(selectedProject.startDate)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">End Date</p>
                    <p className="text-sm text-muted-foreground">{formatDate(selectedProject.endDate)}</p>
                  </div>
                </div>
                {selectedProject.description && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Project Description</p>
                    <p className="text-sm text-muted-foreground">{selectedProject.description}</p>
                  </div>
                )}
              </div>

              {/* Project Reports Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold">Project Reports</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedReportProject(selectedProject);
                      setShowAddReportDialog(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Upload Report
                  </Button>
                </div>

                <div className="space-y-3">
                  {selectedProject.reports?.map((report) => (
                    <div 
                      key={report.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-green-100 rounded-md flex items-center justify-center">
                          <FileText className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">{report.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Uploaded: {formatDate(report.uploadDate)}
                          </p>
                          {report.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {report.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(report.fileUrl, '_blank')}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => {
                            // Add delete report functionality
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {(!selectedProject.reports || selectedProject.reports.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No reports uploaded yet
                    </p>
                  )}
                </div>
              </div>

              {/* Project Milestones Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold">Project Milestones</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedMilestoneProject(selectedProject);
                      setShowAddMilestoneDialog(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Milestone
                  </Button>
                </div>

                <div className="space-y-3">
                  {selectedProject.milestones?.map((milestone) => (
                    <div 
                      key={milestone.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{milestone.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Due: {formatDate(milestone.date)}
                        </p>
                      </div>
                      <Badge variant="outline" className={getStatusColor(milestone.status)}>
                        {milestone.status.charAt(0).toUpperCase() + milestone.status.slice(1).replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}

                  {(!selectedProject.milestones || selectedProject.milestones.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No milestones added yet
                    </p>
                  )}
                </div>
              </div>

              {/* Project Documents Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold">Project Documents</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedDocumentProject(selectedProject);
                      setShowAddDocumentDialog(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Document
                  </Button>
                </div>

                <div className="space-y-3">
                  {selectedProject.documents?.map((document) => (
                    <div 
                      key={document.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-blue-100 rounded-md flex items-center justify-center">
                          <FileText className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{document.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {document.category.charAt(0).toUpperCase() + document.category.slice(1)} • 
                            {formatDate(document.uploadDate)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(document.fileUrl, '_blank')}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => {
                            // Add delete document functionality
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {(!selectedProject.documents || selectedProject.documents.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No documents added yet
                    </p>
                  )}
                </div>
              </div>

              {/* Maintain Document Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold">Maintain Document</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedMaintainProject(selectedProject);
                      setShowMaintainDocDialog(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Document
                  </Button>
                </div>

                <div className="space-y-3">
                  {selectedProject.maintainedDocs?.map((doc) => (
                    <div 
                      key={doc.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="space-y-2 w-full">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">Project ID: {doc.projectId}</h4>
                            <p className="text-sm text-muted-foreground">Project Name: {doc.projectName}</p>
                          </div>
                          <div className="text-sm text-right">
                            <p>Start Date: {formatDate(doc.startDate)}</p>
                            <p>End Date: {formatDate(doc.endDate)}</p>
                          </div>
                        </div>
                        <div className="text-sm">
                          <p><span className="font-medium">Client:</span> {doc.clientName}</p>
                          <p className="mt-1"><span className="font-medium">Description:</span> {doc.projectDescription}</p>
                        </div>
                        {doc.reportFiles.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <p className="text-sm font-medium">Uploaded Reports:</p>
                            <div className="space-y-2">
                              {doc.reportFiles.map((file) => (
                                <div key={file.id} className="flex items-center justify-between bg-muted p-2 rounded">
                                  <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm">{file.name}</span>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => window.open(file.fileUrl, '_blank')}
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {(!selectedProject.maintainedDocs || selectedProject.maintainedDocs.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No maintained documents yet
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Milestone Dialog */}
      <Dialog open={showAddMilestoneDialog} onOpenChange={setShowAddMilestoneDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Project Milestone</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              <Select
                value={selectedMilestoneProject?.id.toString()}
                onValueChange={(value) => {
                  const project = projects.find(p => p.id.toString() === value);
                  setSelectedMilestoneProject(project || null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id.toString()}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Milestone Name</Label>
              <Input
                id="name"
                value={newMilestone.name}
                onChange={(e) => setNewMilestone({ ...newMilestone, name: e.target.value })}
                placeholder="Enter milestone name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Due Date</Label>
              <Input
                id="date"
                type="date"
                value={newMilestone.date}
                onChange={(e) => setNewMilestone({ ...newMilestone, date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={newMilestone.status}
                onValueChange={(value: 'pending' | 'completed' | 'in_progress') => 
                  setNewMilestone({ ...newMilestone, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowAddMilestoneDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (!selectedMilestoneProject) return;
                  addMilestone({
                    projectId: selectedMilestoneProject.id,
                    milestone: {
                      name: newMilestone.name,
                      date: new Date(newMilestone.date),
                      status: newMilestone.status
                    }
                  });
                }}
                disabled={!selectedMilestoneProject || !newMilestone.name || !newMilestone.date}
              >
                Add Milestone
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Document Dialog */}
      <Dialog open={showAddDocumentDialog} onOpenChange={setShowAddDocumentDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Project Document</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="document">Document File</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="document"
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setNewDocument({ ...newDocument, file });
                    }
                  }}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const input = document.getElementById('document') as HTMLInputElement;
                    input?.click();
                  }}
                >
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Document Name</Label>
              <Input
                id="name"
                value={newDocument.name}
                onChange={(e) => setNewDocument({ ...newDocument, name: e.target.value })}
                placeholder="Enter document name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={newDocument.category}
                onValueChange={(value: 'contract' | 'specification' | 'report' | 'other') => 
                  setNewDocument({ ...newDocument, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="specification">Specification</SelectItem>
                  <SelectItem value="report">Report</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newDocument.description}
                onChange={(e) => setNewDocument({ ...newDocument, description: e.target.value })}
                placeholder="Enter document description"
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowAddDocumentDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (!selectedDocumentProject || !newDocument.file) return;
                  addDocument({
                    projectId: selectedDocumentProject.id,
                    document: {
                      name: newDocument.name,
                      type: newDocument.file.type,
                      category: newDocument.category,
                      description: newDocument.description,
                      file: newDocument.file
                    }
                  });
                }}
                disabled={!selectedDocumentProject || !newDocument.file || !newDocument.name}
              >
                Add Document
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Report Dialog */}
      <Dialog open={showAddReportDialog} onOpenChange={setShowAddReportDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Upload Project Report</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="report">Report File</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="report"
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setNewReport({ ...newReport, file });
                    }
                  }}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const input = document.getElementById('report') as HTMLInputElement;
                    input?.click();
                  }}
                >
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reportName">Report Name</Label>
              <Input
                id="reportName"
                value={newReport.name}
                onChange={(e) => setNewReport({ ...newReport, name: e.target.value })}
                placeholder="Enter report name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reportDescription">Description</Label>
              <Textarea
                id="reportDescription"
                value={newReport.description}
                onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                placeholder="Enter report description"
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowAddReportDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (!selectedReportProject || !newReport.file) return;
                  addReport({
                    projectId: selectedReportProject.id,
                    report: {
                      name: newReport.name,
                      type: newReport.file.type,
                      description: newReport.description,
                      file: newReport.file
                    }
                  });
                }}
                disabled={!selectedReportProject || !newReport.file || !newReport.name}
              >
                Upload Report
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Maintain Document Dialog */}
      <Dialog open={showMaintainDocDialog} onOpenChange={setShowMaintainDocDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Maintain Project Document</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="projectId">Project ID</Label>
                <Input
                  id="projectId"
                  value={newMaintainedDoc.projectId}
                  onChange={(e) => setNewMaintainedDoc({ ...newMaintainedDoc, projectId: e.target.value })}
                  placeholder="Enter project ID"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectName">Project Name</Label>
                <Input
                  id="projectName"
                  value={newMaintainedDoc.projectName}
                  onChange={(e) => setNewMaintainedDoc({ ...newMaintainedDoc, projectName: e.target.value })}
                  placeholder="Enter project name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={newMaintainedDoc.startDate}
                  onChange={(e) => setNewMaintainedDoc({ ...newMaintainedDoc, startDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={newMaintainedDoc.endDate}
                  onChange={(e) => setNewMaintainedDoc({ ...newMaintainedDoc, endDate: e.target.value })}
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="clientName">Client Name</Label>
                <Input
                  id="clientName"
                  value={newMaintainedDoc.clientName}
                  onChange={(e) => setNewMaintainedDoc({ ...newMaintainedDoc, clientName: e.target.value })}
                  placeholder="Enter client name"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="projectDescription">Project Description</Label>
                <Textarea
                  id="projectDescription"
                  value={newMaintainedDoc.projectDescription}
                  onChange={(e) => setNewMaintainedDoc({ ...newMaintainedDoc, projectDescription: e.target.value })}
                  placeholder="Enter project description"
                  rows={3}
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="reportFile">Upload Report</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="reportFile"
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setNewMaintainedDoc({ ...newMaintainedDoc, reportFile: file });
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const input = document.getElementById('reportFile') as HTMLInputElement;
                      input?.click();
                    }}
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowMaintainDocDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (!selectedMaintainProject || !newMaintainedDoc.reportFile) return;
                  addMaintainedDoc({
                    projectId: selectedMaintainProject.id,
                    document: {
                      projectId: newMaintainedDoc.projectId,
                      projectName: newMaintainedDoc.projectName,
                      startDate: new Date(newMaintainedDoc.startDate),
                      endDate: new Date(newMaintainedDoc.endDate),
                      projectDescription: newMaintainedDoc.projectDescription,
                      clientName: newMaintainedDoc.clientName,
                      reportFile: newMaintainedDoc.reportFile
                    }
                  });
                }}
                disabled={
                  !selectedMaintainProject ||
                  !newMaintainedDoc.projectId ||
                  !newMaintainedDoc.projectName ||
                  !newMaintainedDoc.startDate ||
                  !newMaintainedDoc.endDate ||
                  !newMaintainedDoc.clientName ||
                  !newMaintainedDoc.reportFile
                }
              >
                Save Document
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Export the component
export default Project;
