import { useQuery } from '@tanstack/react-query';
import { getSupabaseClient } from '@/services/supabaseService';
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState, lazy, Suspense } from 'react';
import { trackViewContent, trackButtonClick } from "@/utils/tiktokTracking";
import AppLayout from '@/components/layout/AppLayout';

// Lazy load PDFViewer for better bundle optimization
const PDFViewer = lazy(() => import('@/components/PDFViewer'));

// Loading component for PDFViewer
const PDFViewerLoader = () => (
  <div className="flex items-center justify-center py-12 bg-gray-50 rounded-lg">
    <div className="flex flex-col items-center space-y-3">
      <div className="w-12 h-12 border-4 border-[#C4A36F] border-t-transparent rounded-full animate-spin"></div>
      <p className="text-[#222222] font-medium">Loading PDF viewer...</p>
    </div>
  </div>
);

const Menu = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [activeMenuUrl, setActiveMenuUrl] = useState<string | null>(null);
  
  useEffect(() => {
    // Track page view after component mounts
    trackViewContent({
      pageId: 'menu',
      pageName: 'Menu'
    });
  }, []);

  // Separate the fetch function for better type inference
  const fetchMenu = async () => {
    console.log('Fetching active menu files...');
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from('marketing_files')
      .select('*')
      .eq('category', 'menu')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching menu files:', error);
      throw error;
    }

    console.log('Menu files returned:', data?.length || 0, 'files');
    console.log('Menu files data:', data);
    
    if (data && data.length > 0) {
      // Get public URLs for all menu files
      const menuFilesWithUrls = await Promise.all(data.map(async (file) => {
        const { data: publicUrlData } = supabase.storage
          .from('marketing_files')
          .getPublicUrl(file.file_path);
        
        return {
          ...file,
          url: publicUrlData.publicUrl
        };
      }));
      
      console.log('Menu files with URLs:', menuFilesWithUrls);
      
      // Track menu view after successful load
      trackViewContent({
        pageId: 'menu_file',
        pageName: 'Menu File'
      });
      
      return menuFilesWithUrls;
    }
    
    return [];
  };
  
  const { data: menuFiles, isLoading, error } = useQuery({
    queryKey: ['active-menu-files'],
    queryFn: fetchMenu
  });

  // Use the first menu file as the active one when data loads
  useEffect(() => {
    if (menuFiles && menuFiles.length > 0) {
      setActiveMenuUrl(menuFiles[0].url);
    }
  }, [menuFiles]);

  if (error) {
    // Error handling is done through the UI, no need for console.error
  }

  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto">
        <div className="text-center w-full max-w-2xl mx-auto flex-shrink-0 pt-safe">
          <Link to="/customer" className="transition-opacity hover:opacity-80 block">
            <img 
              src="lovable-uploads/7eb81221-fbf5-4b1d-8327-eb0e707236d8.png"
              alt="Ekka Barbershop Logo" 
              className="h-24 mb-6 object-contain mx-auto w-auto"
              loading="eager"
              width="240"
              height="96"
            />
          </Link>
          <h1 className="text-3xl font-bold text-[#222222] mb-2">{t('our.menu')}</h1>
          <div className="h-1 w-24 bg-[#C4A36F] mx-auto mb-6"></div>
          <Button 
            onClick={() => {
              trackButtonClick({
                buttonId: 'back_home',
                buttonName: 'Back Home'
              });
              navigate('/customer');
            }}
            className="bg-[#4A4A4A] hover:bg-[#3A3A3A] text-white transition-all duration-300 touch-target"
          >
            {t('back.home')}
          </Button>
        </div>
        
        <Card className="overflow-hidden bg-white shadow-xl rounded-xl border-[#C4A36F]/20 w-full max-w-2xl mt-8 mb-8">
          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-8 text-[#222222]">{t('loading.menu')}</div>
            ) : menuFiles && menuFiles.length > 0 ? (
              <div className="space-y-4">
                {menuFiles.length > 1 && (
                  <div className="flex gap-2 mb-4 justify-center flex-wrap">
                    {menuFiles.map((file, index) => (
                      <Button 
                        key={file.id}
                        variant={activeMenuUrl === file.url ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveMenuUrl(file.url)}
                      >
                        {t('menu')} {index + 1}
                      </Button>
                    ))}
                  </div>
                )}
                
                {activeMenuUrl && (
                  menuFiles.find(f => f.url === activeMenuUrl)?.file_type.includes('pdf') ? (
                    <Suspense fallback={<PDFViewerLoader />}>
                      <PDFViewer pdfUrl={activeMenuUrl} />
                    </Suspense>
                  ) : (
                    <img 
                      src={activeMenuUrl} 
                      alt="Menu"
                      className="w-full max-w-full h-auto rounded-lg"
                      onError={(e) => {
                        console.error('Failed to load menu image:', activeMenuUrl);
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                  )
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-[#222222]">{t('no.menu')}</div>
            )}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Menu;
