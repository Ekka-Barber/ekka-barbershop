
import { Button } from "@/components/ui/button";

interface QRCodeSelectorProps {
  qrCodes: Array<{ id: string }>;
  selectedQrId: string | null;
  onSelectQrId: (id: string) => void;
}

const QRCodeSelector = ({ qrCodes, selectedQrId, onSelectQrId }: QRCodeSelectorProps) => {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {qrCodes.map((qr) => (
        <Button
          key={qr.id}
          variant={selectedQrId === qr.id ? "default" : "outline"}
          onClick={() => onSelectQrId(qr.id)}
          className="whitespace-nowrap"
        >
          {qr.id}
        </Button>
      ))}
    </div>
  );
};

export default QRCodeSelector;
