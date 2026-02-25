import { AlertTriangle } from 'lucide-react';

import type { AccessUser } from '@shared/types/domains';
import { Button } from '@shared/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@shared/ui/components/dialog';

interface DeleteUserDialogProps {
  user: AccessUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

export function DeleteUserDialog({
  user,
  open,
  onOpenChange,
  onConfirm,
  isLoading,
}: DeleteUserDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner':
        return 'Owner';
      case 'manager':
        return 'Manager';
      case 'super_manager':
        return 'Super Manager';
      case 'hr':
        return 'HR User';
      default:
        return role;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete User
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the user account.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <p className="text-sm text-foreground">
              Are you sure you want to delete{' '}
              <strong>{user?.name}</strong>?
            </p>
            <div className="mt-2 text-xs text-muted-foreground">
              <p>Role: {user ? getRoleLabel(user.role) : ''}</p>
              {user?.branch_name && <p>Branch: {user.branch_name}</p>}
            </div>
          </div>

          {user?.role === 'owner' && (
            <p className="mt-3 text-xs text-muted-foreground">
              Note: You cannot delete the last owner account.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
