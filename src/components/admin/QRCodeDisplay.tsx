
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeDisplayProps {
  edgeFunctionUrl: string;
  handleDownload: () => void;
}

const QRCodeDisplay = ({ edgeFunctionUrl, handleDownload }: QRCodeDisplayProps) => {
  return (
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
      
      <div className="mt-4">
        <p className="text-xs text-muted-foreground break-all">
          <span className="font-semibold">QR URL:</span> {edgeFunctionUrl}
        </p>
      </div>
    </div>
  );
};

export default QRCodeDisplay;
