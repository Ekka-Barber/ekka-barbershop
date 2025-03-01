
import React, { useMemo, memo } from "react";
import { Button } from "@/components/ui/button";
import { Timer, ArrowRight, ArrowLeft } from "lucide-react";
import { PriceDisplay } from "@/components/ui/price-display";
import { cn } from "@/lib/utils";

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
}

interface ServicesSummaryProps {
  selectedServices: Service[];
  totalDuration: number;
  totalPrice: number;
  language: string;
  onNextStep: () => void;
  onPrevStep: () => void;
  isFirstStep: boolean;
}

export const ServicesSummary = memo(({
  selectedServices,
  totalDuration,
  totalPrice,
  language,
  onNextStep,
  onPrevStep,
  isFirstStep
}: ServicesSummaryProps) => {
  const hasServices = selectedServices.length > 0;
  
  const buttonText = useMemo(() => 
    language === 'ar' ? 'متابعة' : 'Continue',
    [language]
  );

  const durationText = useMemo(() => 
    language === 'ar' ? `${totalDuration} دقيقة` : `${totalDuration} min`,
    [language, totalDuration]
  );

  const isEmpty = !hasServices;

  if (isEmpty) return null;

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 p-4 bg-white border-t flex flex-col gap-2 z-10 transition-all duration-200 ease-in-out",
      hasServices ? "translate-y-0" : "translate-y-full"
    )}>
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Timer className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-700">{durationText}</span>
        </div>
        <PriceDisplay price={totalPrice} language={language as 'en' | 'ar'} />
      </div>
      
      <div className="flex gap-3">
        {!isFirstStep && (
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={onPrevStep}
          >
            {language === 'ar' ? (
              <>
                السابق <ArrowRight className="h-4 w-4 ml-1" />
              </>
            ) : (
              <>
                <ArrowLeft className="h-4 w-4 mr-1" /> Previous
              </>
            )}
          </Button>
        )}
        
        <Button 
          className={cn(
            "flex-1 bg-[#C4A484] hover:bg-[#B3926F]",
            isFirstStep ? "w-full" : ""
          )}
          onClick={onNextStep}
        >
          {language === 'ar' ? (
            <>
              {buttonText} <ArrowLeft className="h-4 w-4 mr-1" />
            </>
          ) : (
            <>
              {buttonText} <ArrowRight className="h-4 w-4 ml-1" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
});

ServicesSummary.displayName = 'ServicesSummary';
