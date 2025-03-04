
import { useCreateQRCode } from "@/hooks/useCreateQRCode";
import QRCodeFormInputs from "./qr-code/QRCodeFormInputs";
import CreateQRCodeButton from "./qr-code/CreateQRCodeButton";

const CreateQRCodeForm = () => {
  const {
    newUrl,
    setNewUrl,
    newQrId,
    setNewQrId,
    handleCreateQr,
    isPending
  } = useCreateQRCode();

  return (
    <div className="rounded-lg border p-4 space-y-4">
      <h3 className="font-medium">Create New QR Code</h3>
      <form onSubmit={handleCreateQr} className="space-y-4">
        <QRCodeFormInputs 
          qrId={newQrId}
          url={newUrl}
          onQrIdChange={setNewQrId}
          onUrlChange={setNewUrl}
        />
        <CreateQRCodeButton 
          isLoading={isPending} 
          isDisabled={!newUrl}
        />
      </form>
    </div>
  );
};

export default CreateQRCodeForm;
