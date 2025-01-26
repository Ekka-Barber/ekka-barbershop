import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import PDFViewer from '@/components/PDFViewer';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

const Offers = () => {
  const navigate = useNavigate();
  
  const { data: offersFile, isLoading } = useQuery({
    queryKey: ['active-offers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketing_files')
        .select('*')
        .eq('category', 'offers')
        .eq('is_active', true)
        .single();
      
      if (error) throw error;
      
      if (data) {
        const { data: fileUrl } = supabase.storage
          .from('marketing_files')
          .getPublicUrl(data.file_path);
        
        return { ...data, url: fileUrl.publicUrl };
      }
      return null;
    }
  });

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-900">Special Offers</h1>
          <Button 
            variant="outline"
            onClick={() => navigate('/customer')}
          >
            Back
          </Button>
        </div>
        
        {isLoading ? (
          <div className="text-center py-8">Loading offers...</div>
        ) : offersFile ? (
          offersFile.file_type.includes('pdf') ? (
            <PDFViewer pdfUrl={offersFile.url} />
          ) : (
            <img 
              src={offersFile.url} 
              alt="Special Offers"
              className="max-w-full h-auto rounded-lg shadow-lg"
            />
          )
        ) : (
          <div className="text-center py-8">No special offers available at the moment.</div>
        )}
      </div>
    </div>
  );
};

export default Offers;