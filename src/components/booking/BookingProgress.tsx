import { useLanguage } from "@/contexts/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";

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

  return (
    <div className="mb-8">
      <div className="h-2 bg-gray-200 rounded-full mb-4">
        <div 
          className="h-full bg-[#C4A36F] rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="flex justify-between mt-2 text-sm">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          
          return (
            <div
              key={step}
              className={`flex flex-col items-center cursor-pointer ${
                isCompleted ? 'text-[#C4A36F]' : 
                isCurrent ? 'text-[#222222] font-medium' : 
                'text-gray-400'
              }`}
              onClick={() => {
                if (index <= currentStepIndex) {
                  onStepClick(step);
                }
              }}
            >
              <span className="w-6 h-6 flex items-center justify-center border rounded-full mb-1">
                {isCompleted ? '✓' : index + 1}
              </span>
              <span className="text-xs text-center">
                {t(`step.${step}`)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};