import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeTime } from "@/lib/utils";
import { Activity } from '@shared/schema';

interface RecentActivityProps {
  activities?: Activity[];
  isLoading: boolean;
}

export function RecentActivity({ activities = [], isLoading }: RecentActivityProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h2>
        
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="border-l-2 border-gray-200 pl-4 pb-5 relative">
              <div className="absolute w-3 h-3 bg-gray-300 rounded-full -left-[7px]"></div>
              <Skeleton className="h-5 w-3/4 mb-1" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ))
        ) : activities.length > 0 ? (
          // Activity items
          activities.map((activity, index) => (
            <div 
              key={activity.id}
              className={`border-l-2 ${index === 0 ? 'border-primary' : 'border-gray-200'} pl-4 pb-5 relative`}
            >
              <div 
                className={`absolute w-3 h-3 ${index === 0 ? 'bg-primary' : 'bg-gray-300'} rounded-full -left-[7px]`}
              ></div>
              <p className="text-sm font-medium text-gray-800">{activity.title}</p>
              <p className="text-xs text-gray-500">{formatRelativeTime(activity.createdAt)}</p>
            </div>
          ))
        ) : (
          // Empty state
          <div className="text-center py-8">
            <p className="text-gray-500 mb-2">No recent activities</p>
          </div>
        )}
        
        {activities.length > 0 && (
          <div className="mt-4 text-center">
            <Button variant="link" className="text-primary">
              View all activity
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default RecentActivity;
