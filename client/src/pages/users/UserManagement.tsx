import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { PlusCircle, Search, Filter, Edit, UserPlus, UserCheck, UserX } from 'lucide-react';

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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

import UserForm from '@/components/forms/UserForm';
import { User } from '@shared/schema';
import AuditLogs from '@/components/AuditLogs';

// Add permission display helper
const getPermissionDisplay = (permissions: Record<string, boolean> | null | undefined) => {
  if (!permissions) return 'No permissions';
  
  const activePermissions = Object.entries(permissions)
    .filter(([_, value]) => value)
    .map(([key]) => key.split('.')[0]);
  
  // Get unique values without using Set
  const uniquePermissions = activePermissions.filter((value, index, self) => 
    self.indexOf(value) === index
  );
  
  return uniquePermissions.join(', ') || 'No permissions';
};

export default function UserManagement() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [selectedUserForLogs, setSelectedUserForLogs] = useState<User | null>(null);
  
  // Fetch all users
  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });
  
  // Add audit log mutation
  const { mutate: createAuditLog } = useMutation({
    mutationFn: async (logData: { userId: string; action: string; resourceId: string; description: string }) => {
      const res = await apiRequest('POST', '/api/audit-logs', logData);
      return res.json();
    },
    onError: (error) => {
      console.error('Failed to create audit log:', error);
    },
  });
  
  // Create user mutation
  const { mutate: createUser, isPending: isCreating } = useMutation({
    mutationFn: async (newUser: any) => {
      const res = await apiRequest('POST', '/api/users', newUser);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setShowAddUserDialog(false);
      
      // Log the action
      createAuditLog({
        userId: data.userId,
        action: 'CREATE_USER',
        resourceId: data.id.toString(),
        description: `Created new user: ${data.fullName} (${data.username})`,
      });
      
      toast({
        title: 'User created',
        description: 'New user has been successfully created',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create user',
      });
    },
  });
  
  // Update user mutation
  const { mutate: updateUser, isPending: isUpdating } = useMutation({
    mutationFn: async ({ id, ...userData }: { id: number; [key: string]: any }) => {
      const res = await apiRequest('PATCH', `/api/users/${id}`, userData);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setShowEditDialog(false);
      
      // Log the action
      createAuditLog({
        userId: data.userId,
        action: 'UPDATE_USER',
        resourceId: data.id.toString(),
        description: `Updated user: ${data.fullName} (${data.username})`,
      });
      
      toast({
        title: 'User updated',
        description: 'User has been successfully updated',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update user',
      });
    },
  });
  
  // Toggle active status mutation
  const { mutate: toggleUserStatus } = useMutation({
    mutationFn: async ({ id, active }: { id: number; active: boolean }) => {
      const res = await apiRequest('PATCH', `/api/users/${id}`, { active });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setShowDeactivateDialog(false);
      
      // Log the action
      createAuditLog({
        userId: data.userId,
        action: data.active ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
        resourceId: data.id.toString(),
        description: `${data.active ? 'Activated' : 'Deactivated'} user: ${data.fullName} (${data.username})`,
      });
      
      toast({
        title: `User ${data.active ? 'activated' : 'deactivated'}`,
        description: `User has been successfully ${data.active ? 'activated' : 'deactivated'}`,
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update user status',
      });
    },
  });
  
  // Filter users based on search query, role, and status
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && user.active) || 
      (statusFilter === 'inactive' && !user.active);
    
    return matchesSearch && matchesRole && matchesStatus;
  });
  
  // Unique roles for role filter
  const roles = ['all', ...new Set(users.map(user => user.role))];
  
  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Get role display name
  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'manager':
        return 'Manager';
      case 'user':
        return 'User';
      default:
        return role.charAt(0).toUpperCase() + role.slice(1);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">User Management</h1>
          <p className="text-gray-600">Manage system users and their permissions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAuditLogs(true)}>
            View Audit Logs
          </Button>
          <Button onClick={() => setShowAddUserDialog(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>
      
      {/* Search and filter bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search users..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              <Filter className="mr-2 h-4 w-4" />
              Role: {roleFilter === 'all' ? 'All' : getRoleDisplay(roleFilter)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className={roleFilter === 'all' ? 'bg-muted' : ''}
              onClick={() => setRoleFilter('all')}
            >
              All Roles
            </DropdownMenuItem>
            {roles
              .filter(role => role !== 'all')
              .map(role => (
                <DropdownMenuItem
                  key={role}
                  className={roleFilter === role ? 'bg-muted' : ''}
                  onClick={() => setRoleFilter(role)}
                >
                  {getRoleDisplay(role)}
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
              All Status
            </DropdownMenuItem>
            <DropdownMenuItem
              className={statusFilter === 'active' ? 'bg-muted' : ''}
              onClick={() => setStatusFilter('active')}
            >
              Active
            </DropdownMenuItem>
            <DropdownMenuItem
              className={statusFilter === 'inactive' ? 'bg-muted' : ''}
              onClick={() => setStatusFilter('inactive')}
            >
              Inactive
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Users table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Users</CardTitle>
          <CardDescription>
            {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'} found
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Loading skeletons
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <Skeleton className="h-5 w-32" />
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-36" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  </TableRow>
                ))
              ) : filteredUsers.length > 0 ? (
                // User rows
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.userId}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {getInitials(user.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <p className="font-medium">{user.fullName}</p>
                      </div>
                    </TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleDisplay(user.role)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getPermissionDisplay(user.permissions as Record<string, boolean>)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.active ? 'default' : 'outline'}>
                        {user.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowEditDialog(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          className={user.active ? 'text-red-600' : 'text-green-600'}
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDeactivateDialog(true);
                          }}
                        >
                          {user.active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                // Empty state
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No users found. Try adjusting your search or filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredUsers.length} of {users.length} users
          </p>
        </CardFooter>
      </Card>
      
      {/* Add User Dialog */}
      <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          
          <UserForm 
            onSubmit={createUser}
            isLoading={isCreating}
            buttonText="Create User"
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit User Dialog */}
      {selectedUser && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
            </DialogHeader>
            
            <UserForm 
              user={selectedUser}
              onSubmit={(data) => updateUser({ ...data, id: selectedUser.id })}
              isLoading={isUpdating}
              buttonText="Save Changes"
              isEdit={true}
            />
          </DialogContent>
        </Dialog>
      )}
      
      {/* Activate/Deactivate Confirmation Dialog */}
      {selectedUser && (
        <AlertDialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {selectedUser.active ? 'Deactivate User' : 'Activate User'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {selectedUser.active 
                  ? 'This will prevent the user from logging in. They will not be able to access the system until activated again.'
                  : 'This will allow the user to log in and access the system again.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className={selectedUser.active ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
                onClick={() => toggleUserStatus({ id: selectedUser.id, active: !selectedUser.active })}
              >
                {selectedUser.active ? 'Deactivate' : 'Activate'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Audit Logs Dialog */}
      <Dialog open={showAuditLogs} onOpenChange={setShowAuditLogs}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Audit Logs</DialogTitle>
          </DialogHeader>
          <AuditLogs userId={selectedUserForLogs?.userId} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
