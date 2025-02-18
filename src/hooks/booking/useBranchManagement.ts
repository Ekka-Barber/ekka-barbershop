
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Branch } from "@/types/booking";
import { useLocation, useNavigate } from "react-router-dom";
import { useBookingContext } from "@/contexts/BookingContext";
import { useEffect } from "react";
import { useBranchValidation } from "./useBranchValidation";
import { useBranchPersistence } from "./useBranchPersistence";
import { toast } from "sonner";

export const useBranchManagement = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { dispatch } = useBookingContext();
  const { validateBranchAvailability } = useBranchValidation();
  const { storeBranch, clearStoredBranch } = useBranchPersistence();

  const searchParams = new URLSearchParams(location.search);
  const branchId = searchParams.get('branch');

  const { data: branch, isLoading, error } = useQuery({
    queryKey: ['branch', branchId],
    queryFn: async () => {
      if (!branchId) return null;
      
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .eq('id', branchId)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) return null;

      const working_hours = data.working_hours as Record<string, string[]>;
      return {
        ...data,
        working_hours: {
          monday: working_hours.monday || [],
          tuesday: working_hours.tuesday || [],
          wednesday: working_hours.wednesday || [],
          thursday: working_hours.thursday || [],
          friday: working_hours.friday || [],
          saturday: working_hours.saturday || [],
          sunday: working_hours.sunday || [],
        }
      } as Branch;
    },
    enabled: !!branchId,
    retry: 2,
    retryDelay: 1000,
  });

  useEffect(() => {
    if (branch) {
      const { isValid, error: validationError } = validateBranchAvailability(branch);
      
      if (!isValid) {
        toast.error(validationError);
        clearStoredBranch();
        navigate('/customer');
        return;
      }

      console.log('Setting branch in context:', branch);
      dispatch({ type: 'SET_BRANCH', payload: branch });
      storeBranch(branch);
    }
  }, [branch, dispatch, navigate, validateBranchAvailability]);

  useEffect(() => {
    if (error) {
      console.error('Error loading branch:', error);
      toast.error('Failed to load branch information. Please try again.');
      clearStoredBranch();
      navigate('/customer');
    }
  }, [error, navigate]);

  return {
    branch,
    isLoading,
    error,
    branchId
  };
};
