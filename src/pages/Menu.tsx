import { Button } from "@/components/ui/button";
import { useNavigate, Link } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { LazyPDFViewer } from '@/components/LazyPDFViewer';
import { MarketingErrorBoundary } from '@/components/common/MarketingErrorBoundary';
import { usePDFFetch } from '@/hooks/usePDFFetch';

const Menu = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [activeMenuUrl, setActiveMenuUrl] = useState<string | null>(null);
  
  useEffect(() => {
    // Page initialization
  }, []);

  // Use the shared PDF fetch hook
  const { pdfFiles: menuFiles, isLoading, error } = usePDFFetch('menu');

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
      <MarketingErrorBoundary fallbackType="menu">
        <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto">
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
                          className="min-h-[44px] px-4 py-2 touch-target"
                          onClick={() => setActiveMenuUrl(file.url)}
                        >
                          {t('menu')} {index + 1}
                        </Button>
                      ))}
                    </div>
                  )}

                  {activeMenuUrl && (
                    menuFiles.find(f => f.url === activeMenuUrl)?.file_type.includes('pdf') ? (
                      <div key={`pdf-menu-${activeMenuUrl}`}>
                        <LazyPDFViewer pdfUrl={activeMenuUrl} />
                      </div>
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
      </MarketingErrorBoundary>
    </AppLayout>
  );
};

export default Menu;
