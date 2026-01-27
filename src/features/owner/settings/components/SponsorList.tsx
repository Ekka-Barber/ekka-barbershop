
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { supabase } from '@shared/lib/supabase/client';
import type { Sponsor } from '@shared/types/domains';
import { useToast } from '@shared/ui/components/use-toast';

import { DeleteSponsorDialog } from './DeleteSponsorDialog';
import { SponsorTable } from './SponsorTable';

interface EmployeeSummary {
  id: string;
  name: string;
  name_ar: string | null;
  sponsor_id: string | null;
  start_date?: string | null;
  end_date?: string | null;
  branches?: {
    name: string | null;
    name_ar: string | null;
  } | null;
}

export const SponsorList = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
  const [deletingSponsor, setDeletingSponsor] = useState<Sponsor | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [nameAr, setNameAr] = useState('');
  const [crNumber, setCrNumber] = useState('');
  const [unifiedNumber, setUnifiedNumber] = useState('');
  const [expandedSponsorId, setExpandedSponsorId] = useState<string | null>(null);

  const { data: sponsors, isLoading } = useQuery<Sponsor[], Error>({
    queryKey: ['sponsors'],
    queryFn: async () => {
      const { data, error: queryError } = await supabase
        .from('sponsors')
        .select('*')
        .order('created_at', { ascending: false });

      if (queryError) throw queryError;
      return data || [];
    },
  });

  const { data: employeesData, isLoading: employeesLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('id, name, name_ar, sponsor_id, start_date, end_date, branches(name, name_ar)')
        .eq('is_archived', false)
        .order('name_ar', { ascending: true });
      if (error) throw error;
      const now = new Date();
      const filteredData = (data || []).filter((emp) => {
        const starts = emp.start_date ? new Date(emp.start_date) : null;
        const ends = emp.end_date ? new Date(emp.end_date) : null;
        return (!starts || starts <= now) && (!ends || ends >= now);
      });
      return filteredData as unknown as EmployeeSummary[];
    },
  });

  const { employeesBySponsor, unassignedEmployees } = useMemo(() => {
    const grouped: Record<string, EmployeeSummary[]> = {};
    const unassigned: EmployeeSummary[] = [];
    (employeesData || []).forEach((emp) => {
      if (emp.sponsor_id) {
        if (!grouped[emp.sponsor_id]) grouped[emp.sponsor_id] = [];
        grouped[emp.sponsor_id].push(emp);
      } else {
        unassigned.push(emp);
      }
    });
    return {
      employeesBySponsor: grouped,
      unassignedEmployees: unassigned,
    };
  }, [employeesData]);

  const handleEditSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSponsor) return;

    try {
      const updatePayload = {
        name_ar: nameAr,
        cr_number: crNumber,
        unified_number: unifiedNumber,
      };

      const { error: updateError } = await supabase
        .from('sponsors')
        .update(updatePayload)
        .eq('id', editingSponsor.id);

      if (updateError) throw updateError;

      toast({
        title: 'Success',
        description: 'تم تحديث الكفيل بنجاح',
      });

      queryClient.invalidateQueries({ queryKey: ['sponsors'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setExpandedSponsorId(null);
      setEditingSponsor(null);
    } catch (error: unknown) {
      let message = 'Failed to update sponsor';
      if (error instanceof Error) message = error.message;
      else if (typeof error === 'string') message = error;
      toast({
        variant: 'destructive',
        title: 'Error',
        description: message,
      });
    }
  };

  const handleDeleteSponsor = async () => {
    if (!deletingSponsor) return;
    try {
      const { error: deleteError } = await supabase
        .from('sponsors')
        .delete()
        .eq('id', deletingSponsor.id);

      if (deleteError) throw deleteError;

      toast({
        title: 'Success',
        description: 'تم حذف الكفيل بنجاح',
      });

      queryClient.invalidateQueries({ queryKey: ['sponsors'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setIsDeleteDialogOpen(false);
      setDeletingSponsor(null);
    } catch (error: unknown) {
      let message = 'Failed to delete sponsor';
      if (error instanceof Error) message = error.message;
      else if (typeof error === 'string') message = error;
      toast({
        variant: 'destructive',
        title: 'Error',
        description: message,
      });
    }
  };

  const handleEdit = (sponsor: Sponsor) => {
    setEditingSponsor(sponsor);
    setNameAr(sponsor.name_ar);
    setCrNumber(sponsor.cr_number);
    setUnifiedNumber(sponsor.unified_number);
    setExpandedSponsorId(sponsor.id);
  };

  const handleDelete = (sponsor: Sponsor) => {
    setDeletingSponsor(sponsor);
    setIsDeleteDialogOpen(true);
  };

  const handleAssignEmployee = async (sponsorId: string, employeeId: string) => {
    try {
      setIsAssigning(true);
      const { error } = await supabase
        .from('employees')
        .update({ sponsor_id: sponsorId })
        .eq('id', employeeId);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['sponsors'] });
      toast({ title: 'تم', description: 'تم إسناد الموظف إلى الكفيل.' });
    } catch (error: unknown) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to assign employee',
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleUnassignEmployee = async (employeeId: string) => {
    try {
      setIsAssigning(true);
      const { error } = await supabase
        .from('employees')
        .update({ sponsor_id: null })
        .eq('id', employeeId);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['sponsors'] });
      toast({ title: 'تم', description: 'تم إزالة الموظف من الكفيل.' });
    } catch (error: unknown) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to unassign employee',
      });
    } finally {
      setIsAssigning(false);
    }
  };

  if (isLoading || employeesLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        جارٍ تحميل الكفلاء...
      </div>
    );
  }

  return (
    <>
      <SponsorTable
        sponsors={sponsors || []}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onSubmit={handleEditSponsor}
        onAssignEmployee={handleAssignEmployee}
        onUnassignEmployee={handleUnassignEmployee}
        employeesBySponsor={employeesBySponsor}
        unassignedEmployees={unassignedEmployees}
        isAssigning={isAssigning || employeesLoading}
        nameAr={nameAr}
        setNameAr={setNameAr}
        crNumber={crNumber}
        setCrNumber={setCrNumber}
        unifiedNumber={unifiedNumber}
        setUnifiedNumber={setUnifiedNumber}
        expandedSponsorId={expandedSponsorId}
        setExpandedSponsorId={setExpandedSponsorId}
      />

      <DeleteSponsorDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteSponsor}
      />
    </>
  );
};
