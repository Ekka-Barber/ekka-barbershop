import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Plus } from "lucide-react";

const CreateQRCodeForm = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newUrl, setNewUrl] = useState("");
  const [newQrId, setNewQrId] = useState("");

  // Set owner access before creating QR code
  const setOwnerAccess = async () => {
    const { error } = await supabase.rpc('set_owner_access', { value: 'owner123' });
    if (error) {
      console.error('Error setting owner access:', error);
      return false;
    }
    return true;
  };

  const createQrCode = useMutation({
    mutationFn: async ({ id, url }: { id: string; url: string }) => {
      const ownerAccessSet = await setOwnerAccess();
      if (!ownerAccessSet) {
        throw new Error("Failed to set owner access");
      }

      const { error } = await supabase
        .from("qr_codes")
        .insert([{ id, url }]);

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
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create QR code",
        variant: "destructive",
      });
      console.error("Error creating QR code:", error);
    },
  });

  const handleCreateQr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQrId || !newUrl) return;
    createQrCode.mutate({ id: newQrId, url: newUrl });
  };

  return (
    <div className="rounded-lg border p-4 space-y-4">
      <h3 className="font-medium">Create New QR Code</h3>
      <form onSubmit={handleCreateQr} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="qrId" className="block text-sm font-medium mb-2">
              QR Code ID
            </label>
            <Input
              id="qrId"
              type="text"
              value={newQrId}
              onChange={(e) => setNewQrId(e.target.value)}
              placeholder="Enter unique QR code ID"
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
            />
          </div>
        </div>
        <Button 
          type="submit" 
          disabled={!newQrId || !newUrl || createQrCode.isPending}
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