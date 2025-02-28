
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useBookingData = (branchId: string | null) => {
  // Fetch branch information
  const { data: branch, isLoading: branchLoading } = useQuery({
    queryKey: ["branch", branchId],
    queryFn: async () => {
      if (!branchId) return null;
      
      const { data, error } = await supabase
        .from("branches")
        .select("*")
        .eq("id", branchId)
        .single();
        
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!branchId,
  });

  return {
    branch,
    branchLoading
  };
};
