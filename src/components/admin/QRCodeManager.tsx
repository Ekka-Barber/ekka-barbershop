import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { QRCodeSVG } from 'qrcode.react';

const QRCodeManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newUrl, setNewUrl] = useState("");
  
  // Use a fixed identifier for the QR code
  const staticQrValue = 'ekka-barber-qr-1';
  const edgeFunctionUrl = 'https://jfnjvphxhzxojxgptmtu.supabase.co/functions/v1/qr-redirect?id=' + staticQrValue;

  const { data: qrCode, isLoading } = useQuery({
    queryKey: ["qrCodes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("qr_codes")
        .select("*")
        .eq("id", "ekka-barber-qr-1")
        .single();

      if (error) throw error;
      return data;
    },
  });

  const updateUrl = useMutation({
    mutationFn: async (url: string) => {
      const { error } = await supabase
        .from("qr_codes")
        .update({ url })
        .eq("id", "ekka-barber-qr-1");

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qrCodes"] });
      toast({
        title: "Success",
        description: "QR code URL has been updated",
      });
      setNewUrl("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update QR code URL",
        variant: "destructive",
      });
      console.error("Error updating QR code URL:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl) return;
    updateUrl.mutate(newUrl);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">QR Code URL Management</h2>
        <p className="text-muted-foreground">
          Update the URL that your QR code redirects to. The QR code itself will remain unchanged.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* QR Code Display */}
        <div className="rounded-lg border p-4 space-y-4">
          <h3 className="font-medium">QR Code</h3>
          <div className="flex justify-center p-4 bg-white rounded-lg">
            <QRCodeSVG value={edgeFunctionUrl} size={200} />
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Scan this QR code to access the redirect URL
          </p>
        </div>

        {/* URL Management */}
        <div className="rounded-lg border p-4 space-y-4">
          <div>
            <h3 className="font-medium mb-2">Current URL</h3>
            <p className="text-sm text-muted-foreground break-all">
              {qrCode?.url || "No URL set"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">New URL</h3>
              <Input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="Enter new URL"
                className="w-full"
              />
            </div>
            <Button 
              type="submit" 
              disabled={!newUrl || updateUrl.isPending}
              className="w-full sm:w-auto"
            >
              {updateUrl.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update URL"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QRCodeManager;