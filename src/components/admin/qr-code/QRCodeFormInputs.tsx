
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface QRCodeFormInputsProps {
  qrId: string;
  url: string;
  onQrIdChange: (value: string) => void;
  onUrlChange: (value: string) => void;
}

const QRCodeFormInputs = ({
  qrId,
  url,
  onQrIdChange,
  onUrlChange,
}: QRCodeFormInputsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <Label htmlFor="qrId" className="block mb-2">
          QR Code ID (optional)
        </Label>
        <Input
          id="qrId"
          type="text"
          value={qrId}
          onChange={(e) => onQrIdChange(e.target.value)}
          placeholder="e.g., menu-qr, offers-qr"
          className="w-full"
        />
      </div>
      <div>
        <Label htmlFor="qrUrl" className="block mb-2">
          URL
        </Label>
        <Input
          id="qrUrl"
          type="url"
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="Enter URL"
          className="w-full"
          required
        />
      </div>
    </div>
  );
};

export default QRCodeFormInputs;
