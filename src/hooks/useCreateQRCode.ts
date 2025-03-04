
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useCreateQRCode = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newUrl, setNewUrl] = useState("");
  const [newQrId, setNewQrId] = useState("");

  // Set owner access before creating QR code
  const setOwnerAccess = async () => {
    const { error } = await supabase.rpc('set_owner_access', { value: 'owner123' });
    if (error) {
      console.error('Error setting owner access:', error);
      return false;
    }
    return true;
  };

  const createQrCode = useMutation({
    mutationFn: async ({ id, url }: { id: string; url: string }) => {
      const ownerAccessSet = await setOwnerAccess();
      if (!ownerAccessSet) {
        throw new Error("Failed to set owner access");
      }

      // Use provided ID or generate a random one
      const qrId = id || `qr-${Math.random().toString(36).substring(2, 9)}`;

      const { error } = await supabase
        .from("qr_codes")
        .insert([{ 
          id: qrId, 
          url,
          is_active: true
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qrCodes"] });
      toast({
        title: "Success",
        description: "New QR code has been created",
      });
      setNewQrId("");
      setNewUrl("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create QR code. The ID might already be in use.",
        variant: "destructive",
      });
      console.error("Error creating QR code:", error);
    },
  });

  const handleCreateQr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl) return;
    
    createQrCode.mutate({ id: newQrId, url: newUrl });
  };

  return {
    newUrl,
    setNewUrl,
    newQrId,
    setNewQrId,
    handleCreateQr,
    isPending: createQrCode.isPending,
  };
};
