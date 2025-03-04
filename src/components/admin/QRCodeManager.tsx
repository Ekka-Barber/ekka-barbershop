
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import CreateQRCodeForm from "./CreateQRCodeForm";
import QRCodeDisplay from "./QRCodeDisplay";
import { useQRCodes } from "@/hooks/useQRCodes";
import { downloadQRCode } from "@/utils/qrCodeUtils";
import QRCodeSelector from "./qr-code/QRCodeSelector";
import EmptyQRCodeState from "./qr-code/EmptyQRCodeState";
import QRCodeURLManager from "./qr-code/QRCodeURLManager";

const QRCodeManager = () => {
  const {
    qrCodes,
    isLoading,
    fetchError,
    selectedQrId,
    setSelectedQrId,
    selectedQrCode,
    edgeFunctionUrl,
    updateQRCodeUrl,
    queryClient
  } = useQRCodes();

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
          <QRCodeSelector 
            qrCodes={qrCodes} 
            selectedQrId={selectedQrId} 
            onSelectQrId={setSelectedQrId} 
          />

          <div className="grid gap-6 md:grid-cols-2">
            {selectedQrCode && (
              <>
                <QRCodeDisplay 
                  edgeFunctionUrl={edgeFunctionUrl}
                  handleDownload={downloadQRCode}
                />
                <QRCodeURLManager 
                  currentUrl={selectedQrCode.url}
                  onUpdateUrl={updateQRCodeUrl}
                />
              </>
            )}
          </div>
        </>
      ) : (
        <EmptyQRCodeState />
      )}

      <CreateQRCodeForm />
    </div>
  );
};

export default QRCodeManager;
