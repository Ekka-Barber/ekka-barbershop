import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import PDFViewer from '@/components/PDFViewer';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const Menu = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const { data: menuFile, isLoading } = useQuery({
    queryKey: ['active-menu'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketing_files')
        .select('*')
        .eq('category', 'menu')
        .eq('is_active', true)
        .maybeSingle();
      
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <LanguageSwitcher />
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col items-center mb-8">
          <img 
            src="/lovable-uploads/8289fb1d-c6e6-4528-980c-6b52313ca898.png"
            alt="Ekka Barbershop Logo" 
            className="h-24 mb-6 object-contain"
          />
          <h1 className="text-3xl font-bold text-[#222222] mb-2">{t('our.menu')}</h1>
          <div className="h-1 w-24 bg-[#C4A36F] mx-auto mb-6"></div>
          <Button 
            onClick={() => navigate('/customer')}
            className="bg-[#4A4A4A] hover:bg-[#3A3A3A] text-white transition-all duration-300"
          >
            {t('back.home')}
          </Button>
        </div>
        
        <Card className="overflow-hidden bg-white shadow-xl rounded-xl border-[#C4A36F]/20">
          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-8 text-[#222222]">{t('loading.menu')}</div>
            ) : menuFile ? (
              menuFile.file_type.includes('pdf') ? (
                <PDFViewer pdfUrl={menuFile.url} />
              ) : (
                <img 
                  src={menuFile.url} 
                  alt="Menu"
                  className="w-full max-w-full h-auto rounded-lg"
                />
              )
            ) : (
              <div className="text-center py-8 text-[#222222]">{t('no.menu')}</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Menu;