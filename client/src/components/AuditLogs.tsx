import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { apiRequest } from '@/lib/queryClient';
import { AuditLog } from '@shared/schema';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface AuditLogsProps {
  userId?: string;
}

export default function AuditLogs({ userId }: AuditLogsProps) {
  const { data: logs = [], isLoading } = useQuery<AuditLog[]>({
    queryKey: userId ? ['/api/audit-logs/user', userId] : ['/api/audit-logs'],
  });

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE_USER':
        return 'bg-green-100 text-green-800';
      case 'UPDATE_USER':
        return 'bg-blue-100 text-blue-800';
      case 'ACTIVATE_USER':
        return 'bg-green-100 text-green-800';
      case 'DEACTIVATE_USER':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Audit Logs</h2>
        <Badge variant="outline" className="text-sm">
          {logs.length} {logs.length === 1 ? 'log' : 'logs'} found
        </Badge>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Log ID</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Resource ID</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                </TableRow>
              ))
            ) : logs.length > 0 ? (
              logs.map((log) => (
                <TableRow key={log.logId}>
                  <TableCell className="font-mono text-sm">
                    {log.logId}
                  </TableCell>
                  <TableCell>
                    {format(new Date(log.timestamp), 'MMM d, yyyy HH:mm:ss')}
                  </TableCell>
                  <TableCell>{log.userId}</TableCell>
                  <TableCell>
                    <Badge className={getActionColor(log.action)}>
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell>{log.resourceId}</TableCell>
                  <TableCell>{log.description}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                  No audit logs found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 