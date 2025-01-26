import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import PDFViewer from '@/components/PDFViewer';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const Offers = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const { data: offersFiles, isLoading } = useQuery({
    queryKey: ['active-offers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketing_files')
        .select('*')
        .eq('category', 'offer')
        .eq('is_active', true);
      
      if (error) throw error;
      
      if (data) {
        return await Promise.all(data.map(async (file) => {
          const { data: fileUrl } = supabase.storage
            .from('marketing_files')
            .getPublicUrl(file.file_path);
          
          return { ...file, url: fileUrl.publicUrl };
        }));
      }
      return [];
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
      <div className="flex-grow max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 w-full">
        <div className="flex flex-col items-center mb-8">
          <img 
            src="/lovable-uploads/8289fb1d-c6e6-4528-980c-6b52313ca898.png"
            alt="Ekka Barbershop Logo" 
            className="h-24 mb-6 object-contain"
          />
          <h1 className="text-3xl font-bold text-[#222222] mb-2">{t('special.offers.title')}</h1>
          <div className="h-1 w-24 bg-[#C4A36F] mx-auto mb-6"></div>
          <Button 
            onClick={() => navigate('/customer')}
            className="bg-[#4A4A4A] hover:bg-[#3A3A3A] text-white transition-all duration-300"
          >
            {t('back.home')}
          </Button>
        </div>
        
        <div className="space-y-8">
          {isLoading ? (
            <div className="text-center py-8 text-[#222222]">{t('loading.offers')}</div>
          ) : offersFiles && offersFiles.length > 0 ? (
            offersFiles.map((file) => (
              <Card key={file.id} className="overflow-hidden bg-white shadow-xl rounded-xl border-[#C4A36F]/20">
                <div className="p-6">
                  {file.file_type.includes('pdf') ? (
                    <PDFViewer pdfUrl={file.url} />
                  ) : (
                    <img 
                      src={file.url} 
                      alt="Special Offer"
                      className="w-full max-w-full h-auto rounded-lg"
                    />
                  )}
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-[#222222]">{t('no.offers')}</div>
          )}
        </div>
      </div>
      <LanguageSwitcher />
    </div>
  );
};

export default Offers;