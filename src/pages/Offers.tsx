import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import PDFViewer from '@/components/PDFViewer';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

const Offers = () => {
  const navigate = useNavigate();
  
  const { data: offersFiles, isLoading } = useQuery({
    queryKey: ['active-offers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketing_files')
        .select('*')
        .eq('category', 'offers')
        .eq('is_active', true);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        return Promise.all(data.map(async (file) => {
          const { data: fileUrl } = supabase.storage
            .from('marketing_files')
            .getPublicUrl(file.file_path);
          
          return { ...file, url: fileUrl.publicUrl };
        }));
      }
      return null;
    }
  });

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-blue-900">Special Offers</h1>
          <Button 
            variant="outline"
            onClick={() => navigate('/customer')}
            className="text-sm sm:text-base"
          >
            Back
          </Button>
        </div>
        
        {isLoading ? (
          <div className="text-center py-8">Loading offers...</div>
        ) : offersFiles && offersFiles.length > 0 ? (
          <div className="space-y-8">
            {offersFiles.map((file) => (
              <div key={file.id} className="w-full">
                {file.file_type.includes('pdf') ? (
                  <PDFViewer pdfUrl={file.url} />
                ) : (
                  <img 
                    src={file.url} 
                    alt="Special Offer"
                    className="w-full max-w-full h-auto rounded-lg shadow-lg"
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">No special offers available at the moment.</div>
        )}
      </div>
    </div>
  );
};

export default Offers;