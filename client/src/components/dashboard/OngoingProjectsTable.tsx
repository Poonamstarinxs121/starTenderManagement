import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Building2, Building, Landmark } from "lucide-react";
import { formatDate, getStatusColor, generateProjectCode } from "@/lib/utils";
import { Project } from '@shared/schema';

interface OngoingProjectsTableProps {
  projects?: Project[];
  isLoading: boolean;
  onAddProject?: () => void;
}

export function OngoingProjectsTable({ 
  projects = [], 
  isLoading, 
  onAddProject 
}: OngoingProjectsTableProps) {
  const [page, setPage] = useState(1);
  const [, navigate] = useLocation();
  const itemsPerPage = 5;
  
  // Calculate pagination
  const totalPages = Math.ceil(projects.length / itemsPerPage);
  const displayedProjects = projects.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );
  
  // Get icon based on project name
  const getProjectIcon = (name: string) => {
    if (name.toLowerCase().includes('office')) return <Building2 className="text-accent" size={16} />;
    if (name.toLowerCase().includes('hotel')) return <Building className="text-teal-600" size={16} />;
    return <Landmark className="text-primary" size={16} />;
  };
  
  return (
    <Card>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Ongoing Projects</h2>
          <Button size="sm" onClick={onAddProject}>
            <Plus className="h-4 w-4 mr-1" />
            Add Project
          </Button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deadline</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 3 }).map((_, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Skeleton className="h-8 w-8 rounded-md" />
                      <div className="ml-4">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24 mt-1" />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-4 w-28" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-2.5 w-full rounded-full" />
                    <Skeleton className="h-3 w-16 mt-1" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-4 w-12" />
                  </td>
                </tr>
              ))
            ) : displayedProjects.length > 0 ? (
              // Project rows
              displayedProjects.map((project) => {
                const statusColor = getStatusColor(project.status);
                
                return (
                  <tr key={project.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-indigo-100 rounded-md flex items-center justify-center">
                          {getProjectIcon(project.name)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{project.name}</div>
                          <div className="text-xs text-gray-500 font-mono">{generateProjectCode(project.id)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{project.client}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor.bg} ${statusColor.text}`}>
                        {project.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className={`${
                            project.progress >= 70 
                              ? 'bg-green-500' 
                              : project.progress >= 40 
                              ? 'bg-blue-500' 
                              : 'bg-amber-500'
                          } h-2.5 rounded-full`}
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 mt-1 inline-block">
                        {project.progress}% Complete
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(project.endDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="link"
                        className="text-primary hover:text-indigo-900"
                        onClick={() => navigate(`/projects/${project.id}`)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                );
              })
            ) : (
              // Empty state
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No ongoing projects found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {!isLoading && projects.length > 0 && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{Math.min(1 + (page - 1) * itemsPerPage, projects.length)}</span> to <span className="font-medium">{Math.min(page * itemsPerPage, projects.length)}</span> of <span className="font-medium">{projects.length}</span> projects
            </div>
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant={page === totalPages ? "outline" : "default"}
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

export default OngoingProjectsTable;
