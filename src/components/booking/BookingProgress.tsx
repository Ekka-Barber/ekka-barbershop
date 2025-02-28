
import { useLanguage } from "@/contexts/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";

export type BookingStep = 'services' | 'datetime' | 'barber' | 'customer' | 'summary';

interface BookingProgressProps {
  currentStep: BookingStep;
}

export const BookingProgress = ({ currentStep }: BookingProgressProps) => {
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  
  const steps: BookingStep[] = ['services', 'datetime', 'barber', 'customer', 'summary'];
  const currentStepIndex = steps.indexOf(currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  // Step titles based on language
  const getStepTitle = (step: BookingStep) => {
    switch (step) {
      case 'services': return t('step.services');
      case 'datetime': return t('step.datetime');
      case 'barber': return t('step.barber');
      case 'customer': return t('step.customer');
      case 'summary': return t('step.summary');
      default: return '';
    }
  };

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
            >
              <span className="w-6 h-6 flex items-center justify-center border rounded-full mb-1">
                {isCompleted ? '✓' : index + 1}
              </span>
              <span className="text-xs text-center">
                {getStepTitle(step)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
