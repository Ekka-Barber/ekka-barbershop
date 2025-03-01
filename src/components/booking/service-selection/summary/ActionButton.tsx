
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ActionButtonProps {
  onNextStep: () => void;
  isDisabled: boolean;
  language: 'en' | 'ar';
}

export const ActionButton = ({
  onNextStep,
  isDisabled,
  language
}: ActionButtonProps) => {
  return (
    <Button 
      className={cn(
        "bg-[#e7bd71] hover:bg-[#d4ad65] transition-all duration-300",
        !isDisabled && "animate-pulse-once"
      )}
      onClick={onNextStep}
      disabled={isDisabled}
    >
      {language === 'ar' ? 'التالي' : 'Next'}
    </Button>
  );
};
