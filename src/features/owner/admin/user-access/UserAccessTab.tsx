import { UserPlus, Pencil, Trash2, Users } from 'lucide-react';
import { useState } from 'react';


import {
  useOwners,
  useManagers,
  useHRUsers,
  useDeleteAccessUser,
  type AccessUser,
} from '@shared/hooks/access-users';
import { Badge } from '@shared/ui/components/badge';
import { Button } from '@shared/ui/components/button';
import { Card, CardContent } from '@shared/ui/components/card';
import { Skeleton } from '@shared/ui/components/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@shared/ui/components/table';

import { DeleteUserDialog } from './DeleteUserDialog';
import { EditUserDialog } from './EditUserDialog';

interface UserAccessTabProps {
  type: 'owners' | 'managers' | 'hr';
  onAddUser: () => void;
}

function UserAccessTable({
  users,
  isLoading,
  type,
  onEdit,
  onDelete,
}: {
  users: AccessUser[];
  isLoading: boolean;
  type: 'owners' | 'managers' | 'hr';
  onEdit: (user: AccessUser) => void;
  onDelete: (user: AccessUser) => void;
}) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed rounded-lg">
        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No users found</h3>
        <p className="text-muted-foreground text-sm">
          Add your first {type === 'owners' ? 'owner' : type === 'managers' ? 'manager' : 'HR user'} to get started.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          {type === 'managers' && <TableHead>Branch</TableHead>}
          <TableHead>Role</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.name}</TableCell>
            {type === 'managers' && (
              <TableCell>
                {user.branch_name || (
                  <span className="text-muted-foreground italic">No branch assigned</span>
                )}
              </TableCell>
            )}
            <TableCell>
              <Badge variant={user.is_super_manager ? 'default' : 'secondary'}>
                {user.is_super_manager ? 'Super Manager' : user.role}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {new Date(user.created_at).toLocaleDateString()}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(user)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(user)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function UserAccessTab({ type, onAddUser }: UserAccessTabProps) {
  const [editingUser, setEditingUser] = useState<AccessUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<AccessUser | null>(null);

  const ownersQuery = useOwners();
  const managersQuery = useManagers();
  const hrQuery = useHRUsers();
  const deleteMutation = useDeleteAccessUser();

  const { data: users = [], isLoading } =
    type === 'owners'
      ? ownersQuery
      : type === 'managers'
        ? managersQuery
        : hrQuery;

  const handleEdit = (user: AccessUser) => {
    setEditingUser(user);
  };

  const handleDelete = (user: AccessUser) => {
    setDeletingUser(user);
  };

  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    
    try {
      await deleteMutation.mutateAsync({
        userId: deletingUser.id,
        role: deletingUser.role,
      });
      setDeletingUser(null);
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {type === 'owners' && 'Owners'}
            {type === 'managers' && 'Managers'}
            {type === 'hr' && 'HR Users'}
          </h2>
          <p className="text-muted-foreground mt-1">
            {type === 'owners' && 'Full system access with all permissions'}
            {type === 'managers' && 'Branch managers and super managers'}
            {type === 'hr' && 'HR personnel with staff management access'}
          </p>
        </div>
        <Button onClick={onAddUser}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add {type === 'owners' ? 'Owner' : type === 'managers' ? 'Manager' : 'HR User'}
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <UserAccessTable
            users={users}
            isLoading={isLoading}
            type={type}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      <EditUserDialog
        user={editingUser}
        open={!!editingUser}
        onOpenChange={(open: boolean) => !open && setEditingUser(null)}
      />

      <DeleteUserDialog
        user={deletingUser}
        open={!!deletingUser}
        onOpenChange={(open: boolean) => !open && setDeletingUser(null)}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
