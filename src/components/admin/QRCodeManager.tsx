
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, PieChart, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import CreateQRCodeForm from "./CreateQRCodeForm";
import QRCodeDisplay from "./QRCodeDisplay";
import QRCodeList from "./qr-code/QRCodeList";
import UpdateQRCodeUrl from "./qr-code/UpdateQRCodeUrl";
import { useOwnerAccess } from "./qr-code/useOwnerAccess";
import { QRCodeAnalytics } from "./qr-code/QRCodeAnalytics";
import { useIsMobile } from "@/hooks/use-mobile";

const QRCodeManager = () => {
  const [selectedQrId, setSelectedQrId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'management' | 'analytics'>('management');
  const { setOwnerAccess } = useOwnerAccess();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  // Debug mobile detection
  useEffect(() => {
    console.log("QRCodeManager - isMobile state:", isMobile);
  }, [isMobile]);

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

  // Set the first QR code as selected when data is loaded
  useEffect(() => {
    if (qrCodes && qrCodes.length > 0 && !selectedQrId) {
      setSelectedQrId(qrCodes[0].id);
    }
  }, [qrCodes, selectedQrId]);

  const selectedQrCode = qrCodes?.find(qr => qr.id === selectedQrId);
  
  // Generate the edge function URL with the correct format
  const edgeFunctionUrl = selectedQrId 
    ? `https://jfnjvphxhzxojxgptmtu.functions.supabase.co/qr-redirect?id=${selectedQrId}`
    : '';

  const handleDownload = () => {
    const canvas = document.createElement("canvas");
    const svg = document.querySelector(".qr-code svg") as SVGElement;
    
    if (!svg) {
      toast({
        title: "Error",
        description: "QR code SVG element not found",
        variant: "destructive"
      });
      return;
    }
    
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
        <div className="text-red-500 mb-4">Error loading QR codes: {(fetchError as Error).message}</div>
        <Button onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'management' | 'analytics')} className="w-full">
        <div className="overflow-x-auto pb-2">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="management" className="flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              QR Management
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="management" className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">QR Code URL Management</h2>
            <p className="text-muted-foreground">
              Update the URL that your QR code redirects to. The QR code itself will remain unchanged.
            </p>
          </div>

          {qrCodes && qrCodes.length > 0 ? (
            <>
              <QRCodeList 
                qrCodes={qrCodes} 
                selectedQrId={selectedQrId} 
                onSelectQrId={setSelectedQrId} 
              />

              <div className="grid gap-6 md:grid-cols-2">
                {selectedQrCode && (
                  <>
                    <QRCodeDisplay 
                      edgeFunctionUrl={edgeFunctionUrl}
                      handleDownload={handleDownload}
                    />
                    <UpdateQRCodeUrl selectedQrCode={selectedQrCode} />
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
        </TabsContent>
        
        <TabsContent value="analytics">
          <QRCodeAnalytics qrCodes={qrCodes || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QRCodeManager;
