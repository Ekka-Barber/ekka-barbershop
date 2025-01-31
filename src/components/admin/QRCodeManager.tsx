import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import CreateQRCodeForm from "./CreateQRCodeForm";
import QRCodeDisplay from "./QRCodeDisplay";
import URLManager from "./URLManager";

const QRCodeManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newUrl, setNewUrl] = useState("");
  
  // Use a fixed UUID for the QR code
  const staticQrValue = '550e8400-e29b-41d4-a716-446655440000';
  const edgeFunctionUrl = 'https://jfnjvphxhzxojxgptmtu.supabase.co/functions/v1/qr-redirect?id=' + staticQrValue;

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

  const { data: qrCode, isLoading, error: fetchError } = useQuery({
    queryKey: ["qrCodes", staticQrValue],
    queryFn: async () => {
      const ownerAccessSet = await setOwnerAccess();
      if (!ownerAccessSet) {
        throw new Error("Failed to set owner access");
      }

      const { data, error } = await supabase
        .from("qr_codes")
        .select("*")
        .eq("id", staticQrValue)
        .single();

      if (error) {
        console.error("Error fetching QR code:", error);
        throw error;
      }
      
      return data;
    },
  });

  const updateUrl = useMutation({
    mutationFn: async (url: string) => {
      const ownerAccessSet = await setOwnerAccess();
      if (!ownerAccessSet) {
        throw new Error("Failed to set owner access");
      }

      const { data, error } = await supabase
        .from("qr_codes")
        .update({ url })
        .eq("id", staticQrValue)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qrCodes"] });
      toast({
        title: "Success",
        description: "QR code URL has been updated",
      });
      setNewUrl("");
    },
    onError: (error) => {
      console.error("Detailed error:", error);
      toast({
        title: "Error",
        description: "Failed to update QR code URL. Please check console for details.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl) return;
    updateUrl.mutate(newUrl);
  };

  const handleDownload = () => {
    const canvas = document.createElement("canvas");
    const svg = document.querySelector(".qr-code svg") as SVGElement;
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = "qr-code.png";
        downloadLink.href = pngFile;
        downloadLink.click();
      }
    };
    
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 mb-4">Error loading QR code: {(fetchError as Error).message}</div>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["qrCodes"] })}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">QR Code URL Management</h2>
        <p className="text-muted-foreground">
          Update the URL that your QR code redirects to. The QR code itself will remain unchanged.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <QRCodeDisplay 
          edgeFunctionUrl={edgeFunctionUrl}
          handleDownload={handleDownload}
        />
        <URLManager
          currentUrl={qrCode?.url}
          newUrl={newUrl}
          setNewUrl={setNewUrl}
          handleSubmit={handleSubmit}
          isUpdating={updateUrl.isPending}
        />
      </div>

      <CreateQRCodeForm />
    </div>
  );
};

export default QRCodeManager;