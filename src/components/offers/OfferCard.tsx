
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import PDFViewer from '@/components/PDFViewer';
import CountdownTimer from '@/components/CountdownTimer';
import { useLanguage } from "@/contexts/LanguageContext";
import { trackViewContent } from "@/utils/tiktokTracking";
import { toast } from "sonner";
import { useState } from "react";

interface OfferCardProps {
  file: {
    id: string;
    url: string;
    originalUrl: string;
    optimizedUrl?: string;
    file_type: string;
    file_name?: string;
    branchName?: string | null;
    end_date?: string | null;
    isExpired: boolean;
    isWithinThreeDays: boolean;
  };
}

export const OfferCard = ({ file }: OfferCardProps) => {
  const { t, language } = useLanguage();
  const [showOriginal, setShowOriginal] = useState(false);

  const getBadgeText = (branchName: string | null) => {
    if (!branchName) return '';
    return language === 'ar' ? `فرع ${branchName} فقط` : `On ${branchName} only`;
  };

  const renderExpiredSticker = () => (
    <div className="absolute inset-0 flex items-center justify-center z-10">
      <div className="bg-red-600 text-white px-6 py-3 rounded-lg transform rotate-[-15deg] shadow-xl text-center">
        <div className="text-2xl font-bold mb-1">ENDED</div>
        <div className="text-xl font-bold">انتهى</div>
      </div>
    </div>
  );

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('Image failed to load:', file.url);
    toast.error(t('error.loading.offer'));
    // Set a fallback image
    e.currentTarget.src = '/placeholder.svg';
  };

  const handleImageClick = () => {
    if (!file.file_type.includes('pdf') && !file.isExpired) {
      setShowOriginal(true);
    }
  };

  // Track each offer view
  if (!file.isExpired) {
    trackViewContent('Offer');
  }

  return (
    <Card key={file.id} className="overflow-hidden bg-white shadow-xl rounded-xl border-[#C4A36F]/20">
      <div className="p-6">
        {file.branchName && (
          <div className="mb-4">
            <Badge 
              variant="secondary" 
              className={`
                text-sm font-medium px-4 py-1.5 
                bg-gradient-to-r from-red-600 to-red-400 
                text-white shadow-sm 
                border-none
                transition-all duration-300 
                animate-flash
                hover:opacity-90
                ${language === 'ar' ? 'rtl' : 'ltr'}
              `}
            >
              {getBadgeText(file.branchName)}
            </Badge>
          </div>
        )}
        <div className="relative">
          {file.isExpired && renderExpiredSticker()}
          {file.file_type.includes('pdf') ? (
            <PDFViewer pdfUrl={file.url} />
          ) : (
            <div 
              className={`relative ${file.isExpired ? 'filter grayscale blur-[2px]' : ''}`}
              onClick={handleImageClick}
            >
              <img 
                src={showOriginal ? file.originalUrl : file.url} 
                alt={file.isExpired ? `Expired Offer - ${file.file_name || 'Special Offer'}` : "Special Offer"}
                className="w-full max-w-full h-auto rounded-lg transition-all duration-300 cursor-pointer"
                onError={handleImageError}
                loading="lazy"
              />
              {!file.isExpired && !showOriginal && (
                <div className="absolute bottom-2 right-2">
                  <Badge variant="secondary" className="bg-black/50 text-white text-xs">
                    Click for HD
                  </Badge>
                </div>
              )}
            </div>
          )}
        </div>
        {file.end_date && !file.isExpired && (
          <CountdownTimer endDate={file.end_date} />
        )}
      </div>
    </Card>
  );
};
