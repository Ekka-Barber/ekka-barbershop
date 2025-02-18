import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import CreateQRCodeForm from "./CreateQRCodeForm";
import QRCodeDisplay from "./QRCodeDisplay";
import URLManager from "./URLManager";

const QRCodeManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedQrId, setSelectedQrId] = useState<string | null>(null);
  const [newUrl, setNewUrl] = useState("");

  const setOwnerAccess = async () => {
    const { error } = await supabase.rpc('set_owner_access', { value: 'owner123' });
    if (error) {
      console.error('Error setting owner access:', error);
      toast({
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
      
      return data;
    },
  });

  if (qrCodes && qrCodes.length > 0 && !selectedQrId) {
    setSelectedQrId(qrCodes[0].id);
  }

  const selectedQrCode = qrCodes?.find(qr => qr.id === selectedQrId);
  const edgeFunctionUrl = selectedQrId 
    ? `https://jfnjvphxhzxojxgptmtu.supabase.co/functions/v1/qr-redirect?id=${selectedQrId}`
    : '';

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

  const handleUpdateUrl = async () => {
    if (!newUrl || !selectedQrId) return;
    
    const ownerAccessSet = await setOwnerAccess();
    if (!ownerAccessSet) {
      toast({
        description: "Failed to set owner access",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("qr_codes")
      .update({ url: newUrl })
      .eq("id", selectedQrId);

    if (error) {
      toast({
        description: "Failed to update QR code URL",
        variant: "destructive",
      });
      return;
    }

    queryClient.invalidateQueries({ queryKey: ["qrCodes"] });
    toast({
      description: "QR code URL has been updated",
    });
    setNewUrl("");
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
        <div className="text-red-500 mb-4">Error loading QR codes: {(fetchError as Error).message}</div>
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

      {qrCodes && qrCodes.length > 0 ? (
        <>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {qrCodes.map((qr) => (
              <Button
                key={qr.id}
                variant={selectedQrId === qr.id ? "default" : "outline"}
                onClick={() => setSelectedQrId(qr.id)}
                className="whitespace-nowrap"
              >
                {qr.id}
              </Button>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {selectedQrCode && (
              <>
                <QRCodeDisplay 
                  edgeFunctionUrl={edgeFunctionUrl}
                  handleDownload={handleDownload}
                />
                <URLManager
                  currentUrl={selectedQrCode.url}
                  newUrl={newUrl}
                  setNewUrl={setNewUrl}
                  handleSubmit={handleUpdateUrl}
                  isUpdating={false}
                />
              </>
            )}
          </div>
        </>
      ) : (
        <div className="text-center p-8 text-muted-foreground">
          No QR codes found. Create one below.
        </div>
      )}

      <CreateQRCodeForm />
    </div>
  );
};

export default QRCodeManager;
