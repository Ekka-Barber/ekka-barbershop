import { zodResolver } from '@hookform/resolvers/zod';
import { Copy, RefreshCw } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { useBranches } from '@shared/hooks';
import {
  useUpdateAccessUserName,
  useUpdateAccessUserCode,
  useUpdateManagerBranch,
  accessUsersService,
} from '@shared/hooks/access-users';
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@shared/ui/components/form';
import { Input } from '@shared/ui/components/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/ui/components/select';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  branch_id: z.string().uuid().nullable().optional(),
  new_access_code: z.string().optional(),
  confirm_code: z.string().optional(),
}).refine(
  (data) => {
    if (data.new_access_code && data.new_access_code.length > 0) {
      return data.new_access_code === data.confirm_code;
    }
    return true;
  },
  {
    message: 'Access codes do not match',
    path: ['confirm_code'],
  }
);

type FormValues = z.infer<typeof formSchema>;

interface EditUserDialogProps {
  user: AccessUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditUserDialog({
  user,
  open,
  onOpenChange,
}: EditUserDialogProps) {
  const updateNameMutation = useUpdateAccessUserName();
  const updateCodeMutation = useUpdateAccessUserCode();
  const updateBranchMutation = useUpdateManagerBranch();
  const { data: branches = [] } = useBranches();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.name ?? '',
      branch_id: user?.branch_id ?? null,
      new_access_code: '',
      confirm_code: '',
    },
    values: {
      name: user?.name ?? '',
      branch_id: user?.branch_id ?? null,
      new_access_code: '',
      confirm_code: '',
    },
  });

  const isManager = user?.role === 'manager' || user?.role === 'super_manager';
  const needsBranch = user?.role === 'manager';

  const generateCode = () => {
    const code = accessUsersService.generateRandomCode(12);
    form.setValue('new_access_code', code);
    form.setValue('confirm_code', code);
  };

  const copyCode = () => {
    const code = form.getValues('new_access_code');
    if (code) {
      navigator.clipboard.writeText(code);
      toast.success('Access code copied to clipboard');
    }
  };

  const onSubmit = async (values: FormValues) => {
    if (!user) return;

    try {
      if (values.name !== user.name) {
        await updateNameMutation.mutateAsync({
          userId: user.id,
          name: values.name,
          role: user.role,
        });
      }

      if (isManager && values.branch_id !== user.branch_id) {
        await updateBranchMutation.mutateAsync({
          userId: user.id,
          branchId: values.branch_id ?? null,
        });
      }

      if (values.new_access_code && values.new_access_code.length >= 4) {
        await updateCodeMutation.mutateAsync({
          userId: user.id,
          newCode: values.new_access_code,
          role: user.role,
        });
      }

      form.reset({ name: values.name, branch_id: values.branch_id, new_access_code: '', confirm_code: '' });
      onOpenChange(false);
    } catch {
      // Error handled by mutation
    }
  };

  const isPending =
    updateNameMutation.isPending ||
    updateCodeMutation.isPending ||
    updateBranchMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user information. Access codes are stored securely and cannot be viewed.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {needsBranch && (
              <FormField
                control={form.control}
                name="branch_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branch</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ''}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select branch" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">No Branch</SelectItem>
                        {branches.map((branch) => (
                          <SelectItem key={branch.id} value={branch.id}>
                            {branch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {isManager && user?.is_super_manager && (
              <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                This user is a <strong>Super Manager</strong> with access to all branches.
              </div>
            )}

            <div className="border-t pt-4 mt-4">
              <h4 className="text-sm font-medium mb-3">Reset Access Code (Optional)</h4>
              <p className="text-xs text-muted-foreground mb-3">
                Access codes are stored hashed and cannot be retrieved. Enter a new code only if you want to reset it.
              </p>

              <FormField
                control={form.control}
                name="new_access_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Access Code</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Leave empty to keep current"
                          {...field}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={generateCode}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={copyCode}
                        disabled={!field.value}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirm_code"
                render={({ field }) => (
                  <FormItem className="mt-3">
                    <FormLabel>Confirm New Code</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Confirm new access code"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
