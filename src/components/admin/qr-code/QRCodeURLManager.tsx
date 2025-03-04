
import { useState } from "react";
import URLManager from "../URLManager";

interface QRCodeURLManagerProps {
  currentUrl: string | undefined;
  onUpdateUrl: (newUrl: string) => Promise<boolean>;
}

const QRCodeURLManager = ({ currentUrl, onUpdateUrl }: QRCodeURLManagerProps) => {
  const [newUrl, setNewUrl] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl) return;
    
    setIsUpdating(true);
    const success = await onUpdateUrl(newUrl);
    setIsUpdating(false);
    
    if (success) {
      setNewUrl("");
    }
  };

  return (
    <URLManager
      currentUrl={currentUrl}
      newUrl={newUrl}
      setNewUrl={setNewUrl}
      handleSubmit={handleSubmit}
      isUpdating={isUpdating}
    />
  );
};

export default QRCodeURLManager;
