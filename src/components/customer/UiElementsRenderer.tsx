
import { Button } from "@/components/ui/button";
import * as Icons from "lucide-react";
import type { LucideIcon } from 'lucide-react';
import freshaLogo from "@/assets/fresha-logo.svg";
import boonusLogo from "@/assets/boonus-logo.svg";
import GoogleReviews from "@/components/customer/GoogleReviews";
import { trackButtonClick } from "@/utils/tiktokTracking";

const renderIcon = (iconName: string | null) => {
  if (!iconName) return null;
  const Icon = Icons[iconName as keyof typeof Icons] as LucideIcon;
  return Icon ? <Icon className="mr-2 h-5 w-5" /> : null;
};

interface UiElementsRendererProps {
  isLoadingUiElements: boolean;
  visibleElements: any[];
  language: string;
  onButtonClick: (element: any) => void;
  branches: any[] | undefined;
  setEidBookingsDialogOpen: (open: boolean) => void;
}

export const UiElementsRenderer = ({
  isLoadingUiElements,
  visibleElements,
  language,
  onButtonClick,
  branches,
  setEidBookingsDialogOpen
}: UiElementsRendererProps) => {
  if (isLoadingUiElements) {
    return <div>Loading UI...</div>;
  }

  return (
    <>
      {visibleElements.map((element) => {
        console.log(`[Customer Page] Mapping Element - ID: ${element.id}, Name: ${element.name}, Type: ${element.type}, Visible: ${element.is_visible}`);
        
        if (element.type === 'button') {
          return (
            <Button 
              key={element.id}
              className={`w-full h-auto min-h-[56px] text-lg font-medium flex items-center justify-center px-4 py-3 ${
                element.name === 'view_menu' || element.name === 'book_now'
                  ? 'bg-[#C4A36F] hover:bg-[#B39260]'
                  : 'bg-[#4A4A4A] hover:bg-[#3A3A3A]'
              } text-white transition-all duration-300 shadow-lg hover:shadow-xl touch-target`}
              onClick={() => onButtonClick(element)}
            >
              {renderIcon(element.icon)} 
              <div className="flex flex-col text-center">
                 <span className="text-lg font-medium">
                   {language === 'ar' ? element.display_name_ar : element.display_name}
                 </span>
                 {element.description && (
                   <span className="text-xs font-normal text-gray-200 mt-1">
                     {language === 'ar' ? element.description_ar : element.description}
                   </span>
                 )}
              </div>
            </Button>
          );
        } else if (element.type === 'section' && element.name === 'eid_bookings') {
          console.log("[Customer Page] Rendering Fresha/Eid Bookings Section for element:", element);
          return (
            <div 
              key={element.id} 
              className="mt-3 bg-white rounded-lg shadow-md border border-gray-200 p-4 cursor-pointer hover:shadow-lg transition-shadow duration-200"
              onClick={() => {
                trackButtonClick({
                  buttonId: 'eid_bookings', 
                  buttonName: language === 'ar' ? element.display_name_ar : element.display_name
                });
                setEidBookingsDialogOpen(true);
              }}
              role="button"
              tabIndex={0}
              aria-label={language === 'ar' ? element.display_name_ar : element.display_name}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setEidBookingsDialogOpen(true); }}
            >
              <div className="flex items-center justify-between">
                <div className={`flex-1 ${language === 'ar' ? 'ml-3' : 'mr-3'}`}>
                  <h2 className={`text-lg font-bold text-[#222222] mb-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                    {language === 'ar' ? element.display_name_ar : element.display_name}
                  </h2>
                  {element.description && (
                    <p className={`text-gray-600 text-xs ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                      {language === 'ar' ? element.description_ar : element.description}
                    </p>
                  )}
                </div>
                <div className="h-10 w-px bg-gray-200 mx-3"></div>
                <div className="flex-shrink-0">
                  <img src={freshaLogo} alt="Fresha Logo" className="h-8 w-auto" />
                </div>
              </div>
            </div>
          );
        } else if (element.type === 'section' && element.name === 'loyalty_program') {
          console.log("[Customer Page] Rendering Loyalty Program Section for element:", element);
          return (
            <div 
              key={element.id} 
              className="mt-3 bg-white rounded-lg shadow-md border border-gray-200 p-4 cursor-pointer hover:shadow-lg transition-shadow duration-200"
              onClick={() => {
                trackButtonClick({
                  buttonId: 'loyalty_program',
                  buttonName: language === 'ar' ? element.display_name_ar : element.display_name
                });
                window.open('https://enroll.boonus.app/64b7c34953090f001de0fb6c/wallet/64b7efed53090f001de815b4', '_blank');
              }}
              role="button"
              tabIndex={0}
              aria-label={language === 'ar' ? element.display_name_ar : element.display_name}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') window.open('https://enroll.boonus.app/64b7c34953090f001de0fb6c/wallet/64b7efed53090f001de815b4', '_blank'); }}
            >
              <div className="flex items-center justify-between">
                 <div className={`flex-1 ${language === 'ar' ? 'ml-3' : 'mr-3'}`}>
                  <h2 className={`text-lg font-bold text-[#222222] ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                    {language === 'ar' ? element.display_name_ar : element.display_name}
                  </h2>
                  {element.description && (
                    <p className={`text-gray-600 text-xs mt-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                      {language === 'ar' ? element.description_ar : element.description}
                    </p>
                  )}
                </div>
                <div className="h-10 w-px bg-gray-200 mx-3"></div>
                <div className="flex-shrink-0 flex flex-col items-center justify-center">
                  <img src={boonusLogo} alt="Boonus Logo" className="h-8 w-auto" />
                </div>
              </div>
            </div>
          );
        } else if (element.type === 'section' && element.name === 'google_reviews') {
          console.log("[Customer Page] Rendering Google Reviews Section for element:", element);
          return <GoogleReviews key={element.id} />;
        }
        return null;
      })}
    </>
  );
};
