
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";

interface CreateQRCodeButtonProps {
  isLoading: boolean;
  isDisabled: boolean;
}

const CreateQRCodeButton = ({ isLoading, isDisabled }: CreateQRCodeButtonProps) => {
  return (
    <Button 
      type="submit" 
      disabled={isDisabled || isLoading}
      className="w-full sm:w-auto"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creating...
        </>
      ) : (
        <>
          <Plus className="mr-2 h-4 w-4" />
          Create QR Code
        </>
      )}
    </Button>
  );
};

export default CreateQRCodeButton;
