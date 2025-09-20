
import { getSupabaseClient } from '@/services/supabaseService';
import { useToast } from "@/components/ui/use-toast";

export const useOwnerAccess = () => {
  const { toast } = useToast();

  const setOwnerAccess = async () => {
    const supabase = await getSupabaseClient();

    const { error } = await supabase.rpc('set_owner_access', { value: 'owner123' });
    if (error) {
      console.error('Error setting owner access:', error);
      toast({
        title: "Error",
        description: "Failed to set owner access. Please try again.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  return { setOwnerAccess };
};
