import { useState } from 'react';
import { getSupabaseClient } from '@/services/supabaseService';

interface Branch {
  id: string;
  name: string;
}

interface ServiceAssignmentOptions {
  categoryResult: { id: string; name_en: string; name_ar: string } | null;
  selectedBranchIds: string[];
  branches: Branch[];
  categoryNameEn?: string;
  categoryNameAr?: string;
}

export const useServiceAssignment = () => {
  const [isAssigningServices, setIsAssigningServices] = useState(false);

  const assignServicesToBranches = async ({
    categoryResult,
    selectedBranchIds,
    branches
  }: Omit<ServiceAssignmentOptions, 'categoryNameEn' | 'categoryNameAr'>) => {
    if (!categoryResult) return;

    setIsAssigningServices(true);
    try {
      const supabase = await getSupabaseClient();

      // Get all services under this category
      const { data: services, error: servicesError } = await supabase
        .from('services')
        .select('id, name_en, name_ar')
        .eq('category_id', categoryResult.id);

      if (servicesError) throw servicesError;

      if (services && services.length > 0) {
        for (const branchId of selectedBranchIds) {
          const serviceAssignments = services.map(service => ({
            branch_id: branchId,
            service_id: service.id,
            branch_name: branches.find(b => b.id === branchId)?.name,
            service_name_en: service.name_en,
            service_name_ar: service.name_ar
          }));

          const { error: bulkInsertError } = await supabase
            .from('branch_services')
            .upsert(serviceAssignments, { onConflict: 'branch_id,service_id' });

          if (bulkInsertError) throw bulkInsertError;
        }
      }
    } catch (error) {
      console.error('Error assigning services to branches:', error);
      throw error;
    } finally {
      setIsAssigningServices(false);
    }
  };

  return {
    assignServicesToBranches,
    isAssigningServices
  };
};
