
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import PDFViewer from '@/components/PDFViewer';
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useEffect, useCallback } from 'react';
import { trackViewContent, trackButtonClick } from "@/utils/tiktokTracking";

const Menu = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  
  useEffect(() => {
    // Track page view after component mounts
    trackViewContent('Menu');
  }, []);

  // Separate the fetch function for better type inference
  const fetchMenu = async () => {
    const { data, error } = await supabase
      .from('marketing_files')
      .select('*')
      .eq('category', 'menu')
      .eq('is_active', true)
      .order('display_order')
      .maybeSingle();
    
    if (error) throw error;
    
    if (data) {
      // Get the public URL for the file
      const { data: publicUrlData } = supabase.storage
        .from('marketing_files')
        .getPublicUrl(data.file_path);
      
      console.log('Menu file data:', { ...data, url: publicUrlData.publicUrl });
      
      const menuData = { ...data, url: publicUrlData.publicUrl };
      // Track menu view after successful load
      trackViewContent('Menu File');
      return menuData;
    }
    return null;
  };
  
  const { data: menuFile, isLoading } = useQuery({
    queryKey: ['active-menu'],
    queryFn: fetchMenu
  });

  return (
    <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen flex flex-col">
      <div className="app-header">
        <div className="language-switcher-container">
          <LanguageSwitcher />
        </div>
      </div>

      <div className="app-container">
        <div className="content-area flex flex-col items-center justify-center">
          <div className="text-center w-full max-w-2xl mx-auto">
            <Link to="/customer" className="transition-opacity hover:opacity-80 block">
              <img 
                src="/lovable-uploads/8289fb1d-c6e6-4528-980c-6b52313ca898.png"
                alt="Ekka Barbershop Logo" 
                className="h-24 mb-6 object-contain mx-auto"
              />
            </Link>
            <h1 className="text-3xl font-bold text-[#222222] mb-2">{t('our.menu')}</h1>
            <div className="h-1 w-24 bg-[#C4A36F] mx-auto mb-6"></div>
            <Button 
              onClick={() => {
                trackButtonClick('Back Home');
                navigate('/customer');
              }}
              className="bg-[#4A4A4A] hover:bg-[#3A3A3A] text-white transition-all duration-300 touch-target"
            >
              {t('back.home')}
            </Button>
          </div>
          
          <Card className="overflow-hidden bg-white shadow-xl rounded-xl border-[#C4A36F]/20 w-full max-w-2xl mt-8">
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
                    onError={(e) => {
                      console.error('Failed to load menu image:', menuFile.url);
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                )
              ) : (
                <div className="text-center py-8 text-[#222222]">{t('no.menu')}</div>
              )}
            </div>
          </Card>
        </div>
      </div>

      <footer className="page-footer" />
    </div>
  );
};

export default Menu;
