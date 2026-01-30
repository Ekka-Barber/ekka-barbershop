import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import { usePDFFetch } from '@shared/hooks/usePDFFetch';
import { LazyPDFViewer } from '@shared/lib/pdf/LazyPDFViewer';
import { Button } from "@shared/ui/components/button";
import { Card } from "@shared/ui/components/card";
import { MarketingErrorBoundary } from '@shared/ui/components/common/MarketingErrorBoundary';
import AppLayout from '@shared/ui/components/layout/AppLayout';

import { useLanguage } from "@/contexts/LanguageContext";


const Menu = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [activeMenuUrl, setActiveMenuUrl] = useState<string | null>(null);
  
  useEffect(() => {
    // Page initialization
  }, []);

  // Use the shared PDF fetch hook
  const { pdfFiles: menuFiles, isLoading } = usePDFFetch('menu', { language });

  const activeMenuFile = menuFiles.find((file) => file.url === activeMenuUrl);

  // Use the first menu file as the active one when data loads
  useEffect(() => {
    if (menuFiles && menuFiles.length > 0) {
      setActiveMenuUrl(menuFiles[0].url);
    }
  }, [menuFiles]);

  return (
    <AppLayout>
      <MarketingErrorBoundary fallbackType="menu">
        <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto">
          <div className="text-center w-full max-w-2xl mx-auto flex-shrink-0 pt-safe">
            <Link to="/customer" className="transition-opacity hover:opacity-80 block">
               <img
                  src="/logo_Header/logo12.svg"
                 alt="Ekka Barbershop Logo"
                 className="h-24 mb-6 object-contain mx-auto w-auto"
                 loading="eager"
                 width="240"
                 height="96"
                 onError={(event) => {
                   event.currentTarget.onerror = null;
                   event.currentTarget.src =
                     '/lovable-uploads/7eb81221-fbf5-4b1d-8327-eb0e707236d8.png';
                 }}
               />
            </Link>
            <h1 className="text-3xl font-bold text-brand-gray-900 mb-2">{t('our.menu')}</h1>
            <div className="h-1 w-24 bg-brand-gold-400 mx-auto mb-6"></div>
            <Button
              onClick={() => {
                navigate('/customer');
              }}
              className="bg-brand-gray-600 hover:bg-brand-gray-700 text-white transition-all duration-300 touch-target"
            >
              {t('back.home')}
            </Button>
          </div>

          <Card className="overflow-hidden bg-white shadow-xl rounded-xl border-brand-gold-400/20 w-full max-w-2xl mt-8 mb-8">
            <div className="p-4 sm:p-6">
              {isLoading ? (
                <div className="text-center py-8 text-brand-gray-900">{t('loading.menu')}</div>
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
                        <LazyPDFViewer pdfUrl={activeMenuUrl} fileName={activeMenuFile?.file_name} />
                      </div>
                    ) : (
                      <img
                        src={activeMenuUrl}
                        alt="Menu"
                        className="w-full max-w-full h-auto rounded-lg"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                    )
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-brand-gray-900">{t('no.menu')}</div>
              )}
            </div>
          </Card>
        </div>
      </MarketingErrorBoundary>
    </AppLayout>
  );
};

export default Menu;
