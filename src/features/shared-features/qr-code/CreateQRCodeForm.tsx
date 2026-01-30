import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";

import { supabase } from "@shared/lib/supabase/client";
import { insertData } from "@shared/lib/supabase-helpers";
import { Button } from "@shared/ui/components/button";
import { Input } from "@shared/ui/components/input";
import { useToast } from "@shared/ui/components/use-toast";



import { useOwnerAccess } from "./useOwnerAccess";

const CreateQRCodeForm = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newUrl, setNewUrl] = useState("");
  const [newQrId, setNewQrId] = useState("");
  const { setOwnerAccess } = useOwnerAccess();

  const createQrCode = useMutation({
    mutationFn: async ({ id, url }: { id: string; url: string }) => {
      const ownerAccessSet = await setOwnerAccess();
      if (!ownerAccessSet) {
        throw new Error("Failed to set owner access");
      }

      // Use provided ID or generate a random one
      const qrId = id || `qr-${Math.random().toString(36).substring(2, 9)}`;

      const { error } = await supabase
        .from("qr_codes")
        .insert(insertData('qr_codes', [{ 
          id: qrId, 
          url,
          is_active: true
        }]));

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qrCodes"] });
      toast({
        title: "Success",
        description: "New QR code has been created",
      });
      setNewQrId("");
      setNewUrl("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create QR code. The ID might already be in use.",
        variant: "destructive",
      });
    },
  });

  const handleCreateQr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl) return;
    
    createQrCode.mutate({ id: newQrId, url: newUrl });
  };

  return (
    <div className="rounded-lg border p-4 space-y-4">
      <h3 className="font-medium">Create New QR Code</h3>
      <form onSubmit={handleCreateQr} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="qrId" className="block text-sm font-medium mb-2">
              QR Code ID (optional)
            </label>
            <Input
              id="qrId"
              type="text"
              value={newQrId}
              onChange={(e) => setNewQrId(e.target.value)}
              placeholder="e.g., menu-qr, offers-qr"
              className="w-full"
            />
          </div>
          <div>
            <label htmlFor="qrUrl" className="block text-sm font-medium mb-2">
              URL
            </label>
            <Input
              id="qrUrl"
              type="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="Enter URL"
              className="w-full"
              required
            />
          </div>
        </div>
        <Button 
          type="submit" 
          disabled={!newUrl || createQrCode.isPending}
          className="w-full sm:w-auto"
        >
          {createQrCode.isPending ? (
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
      </form>
    </div>
  );
};

export default CreateQRCodeForm;
