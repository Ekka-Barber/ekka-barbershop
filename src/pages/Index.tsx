import { QRCodeSVG } from 'qrcode.react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from '@tanstack/react-query';

const Index = () => {
  const navigate = useNavigate();
  
  const { data: qrCode, isLoading } = useQuery({
    queryKey: ['qrCode'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('qr_codes')
        .select('url')
        .eq('is_active', true)
        .single();
      
      if (error) throw error;
      return data;
    }
  });
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-xl text-blue-900">Loading QR Code...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-4xl font-bold text-blue-900 mb-8 text-center">QR Code</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex justify-center mb-6">
            {qrCode && <QRCodeSVG value={qrCode.url} size={256} />}
          </div>
          <p className="text-center text-gray-600 mb-4">
            Scan this QR code to access our customer interface
          </p>
        </div>

        <div className="text-center">
          <Button
            variant="outline"
            className="mx-2"
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