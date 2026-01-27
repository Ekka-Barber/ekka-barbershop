
import { ensureOwnerSession } from '@shared/lib/access-code/auth';
import { accessCodeStorage } from '@shared/lib/access-code/storage';
import { useToast } from "@shared/ui/components/use-toast";

export const useOwnerAccess = () => {
  const { toast } = useToast();

  const setOwnerAccess = async () => {
    const storedCode = accessCodeStorage.getOwnerAccessCode();
    if (!storedCode) {
      toast({
        title: "Owner access required",
        description: "Please sign in with your owner access code.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const hasSession = await ensureOwnerSession();
      if (!hasSession) {
        toast({
          title: "Owner access invalid",
          description: "Please sign in again to continue.",
          variant: "destructive",
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error setting owner access:', error);
      toast({
        title: "Error",
        description: "Failed to set owner access. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  return { setOwnerAccess };
};
