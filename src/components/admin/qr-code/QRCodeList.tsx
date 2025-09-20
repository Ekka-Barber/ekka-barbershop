
import { Button } from "@/components/ui/button";
import { QRCode } from "@/types/admin";

interface QRCodeListProps {
  qrCodes: QRCode[];
  selectedQrId: string | null;
  onSelectQrId: (id: string) => void;
}

const QRCodeList = ({ qrCodes, selectedQrId, onSelectQrId }: QRCodeListProps) => {
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

export default QRCodeList;
