import { QRCodeSVG } from 'qrcode.react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from '@tanstack/react-query';

const Index = () => {
  const navigate = useNavigate();
  
  // Get the current window location to create the full URL for the QR code
  const baseUrl = window.location.origin;
  const customerUrl = `${baseUrl}/customer`;
  
  const { data: qrCode, isLoading } = useQuery({
    queryKey: ['qrCode'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('qr_codes')
        .select('*')
        .eq('is_active', true)
        .single();
      
      if (error) throw error;
      
      // Update QR code URL if it's different
      if (data && data.url !== customerUrl) {
        const { error: updateError } = await supabase
          .from('qr_codes')
          .update({ url: customerUrl })
          .eq('id', data.id);
        
        if (updateError) throw updateError;
      }
      
      return { url: customerUrl };
    }
  });
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-xl text-[#C4A36F]">Loading QR Code...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-4xl font-bold text-[#222222] mb-8 text-center">QR Code</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex justify-center mb-6">
            <QRCodeSVG value={customerUrl} size={256} />
          </div>
          <p className="text-center text-gray-600 mb-4">
            Scan this QR code to access our customer interface
          </p>
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