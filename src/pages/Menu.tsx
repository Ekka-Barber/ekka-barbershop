import PDFViewer from '@/components/PDFViewer';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

const Menu = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-900">Menu</h1>
          <Button 
            variant="outline"
            onClick={() => navigate('/customer')}
          >
            Back
          </Button>
        </div>
        
        <PDFViewer pdfUrl="/sample-menu.pdf" />
      </div>
    </div>
  );
};

export default Menu;