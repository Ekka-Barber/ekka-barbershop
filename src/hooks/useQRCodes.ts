
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { QRCode } from "@/types/admin";

export const useQRCodes = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedQrId, setSelectedQrId] = useState<string | null>(null);

  const setOwnerAccess = async () => {
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

  const { data: qrCodes, isLoading, error: fetchError } = useQuery({
    queryKey: ["qrCodes"],
    queryFn: async () => {
      const ownerAccessSet = await setOwnerAccess();
      if (!ownerAccessSet) {
        throw new Error("Failed to set owner access");
      }

      const { data, error } = await supabase
        .from("qr_codes")
        .select("*")
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching QR codes:", error);
        throw error;
      }
      
      return data as QRCode[];
    },
  });

  // Set the first QR code as selected when data is loaded
  if (qrCodes && qrCodes.length > 0 && !selectedQrId) {
    setSelectedQrId(qrCodes[0].id);
  }

  const selectedQrCode = qrCodes?.find(qr => qr.id === selectedQrId);
  
  // Generate a URL that includes the anon key so it can work without authentication
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impmbmp2cGh4aHp4b2p4Z3B0bXR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3MjgyMDksImV4cCI6MjA1MjMwNDIwOX0.D7fqEZPOOvqVnrtLPwAJ4tqGyTPY8uXjBejgU8Vshd4";
  
  const edgeFunctionUrl = selectedQrId 
    ? `https://jfnjvphxhzxojxgptmtu.supabase.co/functions/v1/qr-redirect?id=${selectedQrId}`
    : '';

  const updateQRCodeUrl = async (newUrl: string) => {
    if (!newUrl || !selectedQrId) return false;
    
    const ownerAccessSet = await setOwnerAccess();
    if (!ownerAccessSet) {
      toast({
        title: "Error",
        description: "Failed to set owner access",
        variant: "destructive",
      });
      return false;
    }

    const { error } = await supabase
      .from("qr_codes")
      .update({ url: newUrl })
      .eq("id", selectedQrId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update QR code URL",
        variant: "destructive",
      });
      return false;
    }

    queryClient.invalidateQueries({ queryKey: ["qrCodes"] });
    toast({
      title: "Success",
      description: "QR code URL has been updated",
    });
    return true;
  };

  return {
    qrCodes,
    isLoading,
    fetchError,
    selectedQrId,
    setSelectedQrId,
    selectedQrCode,
    edgeFunctionUrl,
    updateQRCodeUrl,
    queryClient
  };
};
