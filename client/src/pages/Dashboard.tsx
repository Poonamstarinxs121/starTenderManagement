import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ContactIcon, FileTextIcon, ConstructionIcon, TrendingUpIcon } from 'lucide-react';

import StatsCard from '@/components/dashboard/StatsCard';
import BidPerformanceChart from '@/components/dashboard/BidPerformanceChart';
import RecentActivity from '@/components/dashboard/RecentActivity';
import OngoingProjectsTable from '@/components/dashboard/OngoingProjectsTable';
import DocumentUploadModal from '@/components/modals/DocumentUploadModal';

import { Activity, Project } from '@shared/schema';

export default function Dashboard() {
  const [, navigate] = useLocation();
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  
  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/stats/dashboard'],
  });
  
  // Fetch recent activities
  const { data: activities, isLoading: activitiesLoading } = useQuery<Activity[]>({
    queryKey: ['/api/activities', { limit: 5 }],
  });
  
  // Fetch ongoing projects
  const { data: projects, isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });
  
  // Filter only active projects for the dashboard
  const activeProjects = projects?.filter(
    p => p.status !== 'completed' && p.status !== 'cancelled'
  ) || [];
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Overview of your business activities</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statsLoading ? (
          // Loading skeletons
          Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                  <Skeleton className="h-12 w-12 rounded-full" />
                </div>
                <Skeleton className="h-3 w-24 mt-2" />
              </CardContent>
            </Card>
          ))
        ) : (
          // Stats Cards
          <>
            <StatsCard
              title="Active Leads"
              value={stats?.activeLeads || 0}
              changeText={stats?.leadsIncrease || "+0%"}
              changeDirection="up"
              icon={<ContactIcon size={20} />}
              iconBgColor="bg-blue-100"
              iconColor="text-primary"
            />
            
            <StatsCard
              title="Open Tenders"
              value={stats?.openTenders || 0}
              changeText={stats?.tendersChange || "No change"}
              changeDirection="neutral"
              icon={<FileTextIcon size={20} />}
              iconBgColor="bg-indigo-100"
              iconColor="text-accent"
            />
            
            <StatsCard
              title="Active Projects"
              value={stats?.activeProjects || 0}
              changeText={stats?.projectsIncrease || "+0"}
              changeDirection="up"
              icon={<ConstructionIcon size={20} />}
              iconBgColor="bg-teal-100"
              iconColor="text-teal-600"
            />
            
            <StatsCard
              title="Win Rate"
              value={`${stats?.winRate || 0}%`}
              changeText={stats?.winRateDecrease || "-0%"}
              changeDirection="down"
              icon={<TrendingUpIcon size={20} />}
              iconBgColor="bg-amber-100"
              iconColor="text-amber-600"
            />
          </>
        )}
      </div>
      
      {/* Charts and Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <BidPerformanceChart isLoading={statsLoading} />
        </div>
        
        <RecentActivity 
          activities={activities} 
          isLoading={activitiesLoading} 
        />
      </div>
      
      {/* Ongoing Projects Table */}
      <OngoingProjectsTable 
        projects={activeProjects} 
        isLoading={projectsLoading}
        onAddProject={() => navigate('/projects')}
      />
      
      {/* Document Upload Modal */}
      <DocumentUploadModal
        isOpen={showDocumentModal}
        onClose={() => setShowDocumentModal(false)}
        uploadedById={1} // Default to admin for demo
        relatedOptions={activeProjects.map(p => ({
          id: p.id,
          name: p.name,
          type: 'project'
        }))}
      />
    </div>
  );
}
