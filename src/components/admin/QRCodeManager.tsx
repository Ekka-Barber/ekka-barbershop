import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Download } from "lucide-react";
import { QRCodeSVG } from 'qrcode.react';
import CreateQRCodeForm from "./CreateQRCodeForm";

const QRCodeManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newUrl, setNewUrl] = useState("");
  
  // Use a fixed identifier for the QR code
  const staticQrValue = 'ekka-barber-qr-1';
  const edgeFunctionUrl = 'https://jfnjvphxhzxojxgptmtu.supabase.co/functions/v1/qr-redirect?id=' + staticQrValue;

  // Set owner access before fetching or mutating data
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
      
      console.log("Fetched QR code:", data); // Debug log
      return data;
    },
  });

  const updateUrl = useMutation({
    mutationFn: async (url: string) => {
      console.log("Attempting to update URL to:", url); // Debug log
      
      const ownerAccessSet = await setOwnerAccess();
      if (!ownerAccessSet) {
        throw new Error("Failed to set owner access");
      }

      const { data, error } = await supabase
        .from("qr_codes")
        .update({ url })
        .eq("id", staticQrValue)
        .select();

      if (error) {
        console.error("Error updating QR code URL:", error);
        throw error;
      }
      
      console.log("Update response:", data); // Debug log
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
        {/* QR Code Display */}
        <div className="rounded-lg border p-4 space-y-4">
          <h3 className="font-medium">QR Code</h3>
          <div className="flex justify-center p-4 bg-white rounded-lg qr-code">
            <QRCodeSVG value={edgeFunctionUrl} size={200} />
          </div>
          <div className="flex justify-center">
            <Button
              onClick={handleDownload}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <Download className="mr-2 h-4 w-4" />
              Download QR Code
            </Button>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Scan this QR code to access the redirect URL
          </p>
        </div>

        {/* URL Management */}
        <div className="rounded-lg border p-4 space-y-4">
          <div>
            <h3 className="font-medium mb-2">Current URL</h3>
            <p className="text-sm text-muted-foreground break-all">
              {qrCode?.url || "No URL set"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">New URL</h3>
              <Input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="Enter new URL"
                className="w-full"
              />
            </div>
            <Button 
              type="submit" 
              disabled={!newUrl || updateUrl.isPending}
              className="w-full sm:w-auto"
            >
              {updateUrl.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update URL"
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* Create New QR Code Form */}
      <CreateQRCodeForm />
    </div>
  );
};

export default QRCodeManager;