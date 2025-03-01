
import { useLanguage } from "@/contexts/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { Check, CalendarDays, Clock, User, ClipboardList } from "lucide-react";

export type BookingStep = 'services' | 'datetime' | 'barber' | 'details';

interface BookingProgressProps {
  currentStep: BookingStep;
  steps: BookingStep[];
  onStepClick: (step: BookingStep) => void;
  currentStepIndex: number;
}

export const BookingProgress = ({ 
  currentStep, 
  steps, 
  onStepClick, 
  currentStepIndex 
}: BookingProgressProps) => {
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const getStepIcon = (step: BookingStep) => {
    switch(step) {
      case 'services': return <ClipboardList className="h-3.5 w-3.5" />;
      case 'datetime': return <CalendarDays className="h-3.5 w-3.5" />;
      case 'barber': return <User className="h-3.5 w-3.5" />;
      case 'details': return <Clock className="h-3.5 w-3.5" />;
      default: return null;
    }
  };

  return (
    <div className="mb-8">
      <div className="h-2 bg-gray-200 rounded-full mb-4 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-[#D4B895] to-[#C4A484] rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="flex justify-between mt-2 text-sm">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isClickable = index <= currentStepIndex;
          
          return (
            <div
              key={step}
              className={`flex flex-col items-center ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'}`}
              onClick={() => {
                if (isClickable) {
                  onStepClick(step);
                }
              }}
            >
              <div 
                className={`w-7 h-7 flex items-center justify-center rounded-full mb-1.5 transition-all duration-200 ${
                  isCompleted 
                    ? 'bg-[#C4A484] text-white shadow-md' 
                    : isCurrent 
                      ? 'border-2 border-[#C4A484] text-[#C4A484]' 
                      : 'border border-gray-300 text-gray-400'
                }`}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : getStepIcon(step)}
              </div>
              <span className={`text-xs text-center font-medium transition-colors duration-200 ${
                isCompleted ? 'text-[#C4A484]' : 
                isCurrent ? 'text-[#222222]' : 
                'text-gray-400'
              }`}>
                {t(`step.${step}`)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
