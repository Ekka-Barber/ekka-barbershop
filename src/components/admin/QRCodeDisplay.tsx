
import { Button } from "@/components/ui/button";
import { Download, Copy, CheckCircle } from "lucide-react";
import { QRCodeSVG } from 'qrcode.react';
import { useState } from "react";

interface QRCodeDisplayProps {
  edgeFunctionUrl: string;
  handleDownload: () => void;
}

const QRCodeDisplay = ({ edgeFunctionUrl, handleDownload }: QRCodeDisplayProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = () => {
    if (edgeFunctionUrl) {
      navigator.clipboard.writeText(edgeFunctionUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="rounded-lg border p-4 space-y-4">
      <h3 className="font-medium">QR Code</h3>
      <div className="flex justify-center p-4 bg-white rounded-lg qr-code">
        <QRCodeSVG value={edgeFunctionUrl} size={200} />
      </div>
      <div className="flex flex-col sm:flex-row gap-2 justify-center">
        <Button
          onClick={handleDownload}
          variant="outline"
          className="w-full sm:w-auto"
        >
          <Download className="mr-2 h-4 w-4" />
          Download QR Code
        </Button>
        <Button
          onClick={handleCopyUrl}
          variant="secondary"
          className="w-full sm:w-auto"
          disabled={!edgeFunctionUrl}
        >
          {copied ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" />
              Copy URL
            </>
          )}
        </Button>
      </div>
      <p className="text-sm text-muted-foreground text-center">
        Scan this QR code to access the redirect URL
      </p>
      
      <div className="mt-4 space-y-2">
        <p className="text-xs text-muted-foreground break-all">
          <span className="font-semibold">QR URL:</span> {edgeFunctionUrl}
        </p>
        <div className="text-xs text-muted-foreground rounded-md bg-slate-50 p-2">
          <p className="font-semibold mb-1">How it works:</p>
          <p>This QR code sends users to a secure edge function that redirects to your destination URL. You can update the destination URL anytime without changing the QR code.</p>
        </div>
      </div>
    </div>
  );
};

export default QRCodeDisplay;
