
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { supabase } from '@shared/lib/supabase/client';
import type { Branch } from '@shared/types/domains';
import { useToast } from '@shared/ui/components/use-toast';

import { BranchTable } from './BranchTable';
import { DeleteBranchDialog } from './DeleteBranchDialog';

export const BranchList = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [deletingBranch, setDeletingBranch] = useState<Branch | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [isMain, setIsMain] = useState(false);
  const [expandedBranchId, setExpandedBranchId] = useState<string | null>(null);
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');

  const { data: branches, isLoading } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const { data, error: queryError } = await supabase
        .from('branches')
        .select('*')
        .order('created_at', { ascending: false });

      if (queryError) throw queryError;
      return data || [];
    },
  });

  const handleEditBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBranch) return;

    try {
      // photo_url and working_hours are intentionally not part of this update payload
      const updatePayload: Partial<Branch> = {
        name,
        address: address || null,
        is_main: isMain,
        google_maps_url: googleMapsUrl || null,
      };

      const { error: updateError } = await supabase // Renamed to avoid conflict
        .from('branches')
        .update(updatePayload)
        .eq('id', editingBranch.id);

      if (updateError) throw updateError; // Corrected: throw the new error variable

      toast({
        title: 'Success',
        description: 'Branch updated successfully',
      });

      queryClient.invalidateQueries({ queryKey: ['branches'] });
      setExpandedBranchId(null); // Collapse the form
      setEditingBranch(null); // Clear editing state
    } catch (error: unknown) {
      let message = 'Failed to update branch';
      if (error instanceof Error) message = error.message;
      else if (typeof error === 'string') message = error;
      toast({
        variant: 'destructive',
        title: 'Error',
        description: message,
      });
    }
  };

  const handleDeleteBranch = async () => {
    if (!deletingBranch) return;
    try {
      const { error: deleteError } = await supabase // Renamed to avoid conflict
        .from('branches')
        .delete()
        .eq('id', deletingBranch.id);

      if (deleteError) throw deleteError; // Corrected

      toast({
        title: 'Success',
        description: 'Branch deleted successfully',
      });

      queryClient.invalidateQueries({ queryKey: ['branches'] });
      setIsDeleteDialogOpen(false);
      setDeletingBranch(null);
    } catch (error: unknown) {
      let message = 'Failed to delete branch';
      if (error instanceof Error) message = error.message;
      else if (typeof error === 'string') message = error;
      toast({
        variant: 'destructive',
        title: 'Error',
        description: message,
      });
    }
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setName(branch.name);
    setAddress(branch.address ?? '');
    setIsMain(branch.is_main ?? false);
    setGoogleMapsUrl(branch.google_maps_url ?? '');
  };

  const handleDelete = (branch: Branch) => {
    setDeletingBranch(branch);
    setIsDeleteDialogOpen(true);
  };

  if (isLoading) {
    // Ensure this loading state is noticeable and centered if possible
    return (
      <div className="flex justify-center items-center p-8">
        Loading branches...
      </div>
    );
  }

  return (
    <>
      <BranchTable
        branches={branches || []} // Ensure branches is not undefined
        onEdit={handleEdit}
        onDelete={handleDelete}
        onSubmit={handleEditBranch}
        name={name}
        setName={setName}
        address={address}
        setAddress={setAddress}
        isMain={isMain}
        setIsMain={setIsMain}
        expandedBranchId={expandedBranchId}
        setExpandedBranchId={setExpandedBranchId}
        googleMapsUrl={googleMapsUrl}
        setGoogleMapsUrl={setGoogleMapsUrl}
      />

      <DeleteBranchDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteBranch}
      />
    </>
  );
};
