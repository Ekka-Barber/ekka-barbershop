import { QRCodeSVG } from 'qrcode.react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const currentUrl = window.location.href;
  const previewUrl = currentUrl.replace(/\/$/, '') + '/preview';
  
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-4xl font-bold text-blue-900 mb-8 text-center">QR Code Generator</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex justify-center mb-6">
            <QRCodeSVG value={previewUrl} size={256} />
          </div>
          <p className="text-center text-gray-600 mb-4">
            Scan this QR code to view the customer interface
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