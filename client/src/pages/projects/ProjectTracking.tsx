import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { PlusCircle, Search, Filter, Download, Calendar } from 'lucide-react';

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
import { formatDate, formatCurrency, getStatusColor, generateProjectCode } from '@/lib/utils';

import ProjectForm from '@/components/forms/ProjectForm';
import { Project, InsertProject, User } from '@shared/schema';

export default function ProjectTracking() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddProjectDialog, setShowAddProjectDialog] = useState(false);
  
  // Fetch all projects
  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });
  
  // Fetch users for project manager assignment
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });
  
  // Create project mutation
  const { mutate: createProject, isPending: isCreating } = useMutation({
    mutationFn: async (newProject: InsertProject) => {
      const res = await apiRequest('POST', '/api/projects', newProject);
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
  
  // Filter projects based on search query and status filter
  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.client.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Unique statuses for filter
  const statuses = ['all', ...new Set(projects.map(project => project.status))];
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Project Tracking</h1>
          <p className="text-gray-600">Manage and track ongoing projects</p>
        </div>
        <Button onClick={() => setShowAddProjectDialog(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Project
        </Button>
      </div>
      
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
                        <Badge variant="outline" className={`${statusColor.bg} ${statusColor.text}`}>
                          {project.status.charAt(0).toUpperCase() + project.status.slice(1).replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`${
                              project.progress >= 70 
                                ? 'bg-green-500' 
                                : project.progress >= 40 
                                ? 'bg-blue-500' 
                                : 'bg-amber-500'
                            } h-2 rounded-full`}
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500 mt-1 inline-block">
                          {project.progress}% Complete
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
      
      {/* Add Project Dialog */}
      <Dialog open={showAddProjectDialog} onOpenChange={setShowAddProjectDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Project</DialogTitle>
            <p className="text-sm text-gray-500 mt-1">Fill out the form below to create a new project</p>
          </DialogHeader>
          
          <ProjectForm 
            onSubmit={createProject}
            isLoading={isCreating}
            buttonText="Create Project"
            users={users}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
