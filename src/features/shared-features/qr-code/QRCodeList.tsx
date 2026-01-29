
import { QRCode } from "@shared/types/admin";
import { Button } from "@shared/ui/components/button";

interface QRCodeListProps {
  qrCodes: QRCode[];
  selectedQrId: string | null;
  onSelectQrId: (id: string) => void;
}

const QRCodeList = ({ qrCodes, selectedQrId, onSelectQrId }: QRCodeListProps) => {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar momentum-scroll touch-action-pan-x" style={{ WebkitOverflowScrolling: 'touch' }}>
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
