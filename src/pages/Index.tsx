import { QRCodeSVG } from 'qrcode.react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from '@tanstack/react-query';
import { Alert, AlertDescription } from "@/components/ui/alert";

const Index = () => {
  const navigate = useNavigate();
  
  // Use a fixed identifier for the QR code
  const staticQrValue = '550e8400-e29b-41d4-a716-446655440000';
  const edgeFunctionUrl = 'https://jfnjvphxhzxojxgptmtu.supabase.co/functions/v1/qr-redirect?id=' + staticQrValue;
  
  const { data: qrCode, isLoading, error } = useQuery({
    queryKey: ['qrCode'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('qr_codes')
        .select('*')
        .eq('is_active', true)
        .maybeSingle();
      
      if (error) throw error;
      
      return data;
    }
  });
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-xl text-[#C4A36F]">Loading QR Code...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white p-6">
        <Alert variant="destructive">
          <AlertDescription>
            Error loading QR code. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-4xl font-bold text-[#222222] mb-8 text-center">QR Code</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex justify-center mb-6">
            <QRCodeSVG value={edgeFunctionUrl} size={256} />
          </div>
          <p className="text-center text-gray-600 mb-4">
            Scan this QR code to access our customer interface
          </p>
          {qrCode ? (
            <p className="text-center text-sm text-gray-500">
              Current redirect URL: {qrCode.url}
            </p>
          ) : (
            <p className="text-center text-sm text-red-500">
              No active QR code found. Please contact support.
            </p>
          )}
        </div>

        <div className="text-center">
          <Button
            className="mx-2 bg-[#C4A36F] hover:bg-[#B39260] text-white"
            onClick={() => navigate('/preview')}
          >
            Preview Customer View
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;