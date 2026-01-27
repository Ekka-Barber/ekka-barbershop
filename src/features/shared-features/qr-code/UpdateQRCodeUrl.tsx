
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { supabase } from "@shared/lib/supabase/client";
import { updateData } from "@shared/lib/supabase-helpers";
import { QRCode } from "@shared/types/admin";
import { Button } from "@shared/ui/components/button";
import { useToast } from "@shared/ui/components/use-toast";

import { useOwnerAccess } from "./useOwnerAccess";

interface UpdateQRCodeUrlProps {
  selectedQrCode: QRCode;
}

const UpdateQRCodeUrl = ({ selectedQrCode }: UpdateQRCodeUrlProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newUrl, setNewUrl] = useState("");
  const { setOwnerAccess } = useOwnerAccess();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl || !selectedQrCode) return;
    
    const ownerAccessSet = await setOwnerAccess();
    if (!ownerAccessSet) {
      toast({
        title: "Error",
        description: "Failed to set owner access",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("qr_codes")
      .update(updateData('qr_codes', { url: newUrl }))
      .eq("id", selectedQrCode.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update QR code URL",
        variant: "destructive",
      });
      return;
    }

    queryClient.invalidateQueries({ queryKey: ["qrCodes"] });
    toast({
      title: "Success",
      description: "QR code URL has been updated",
    });
    setNewUrl("");
  };

  return (
    <div className="rounded-lg border p-4 space-y-4">
      <h3 className="font-medium">Current Redirect URL</h3>
      <p className="text-sm bg-muted p-2 rounded break-all">
        {selectedQrCode.url}
      </p>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Update Redirect URL</h4>
            <input
              type="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Update URL
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UpdateQRCodeUrl;
