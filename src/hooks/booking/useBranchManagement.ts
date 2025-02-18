
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Branch } from "@/types/booking";
import { useLocation } from "react-router-dom";
import { useBookingContext } from "@/contexts/BookingContext";
import { useEffect } from "react";

export const useBranchManagement = () => {
  const location = useLocation();
  const { dispatch } = useBookingContext();
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
      return data as Branch;
    },
    enabled: !!branchId,
    retry: 2,
    retryDelay: 1000,
  });

  useEffect(() => {
    if (branch) {
      console.log('Setting branch in context:', branch);
      dispatch({ type: 'SET_BRANCH', payload: branch });
    }
  }, [branch, dispatch]);

  return {
    branch,
    isLoading,
    error,
    branchId
  };
};
