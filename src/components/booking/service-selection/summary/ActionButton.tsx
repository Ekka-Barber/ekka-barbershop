
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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
  const isArabic = language === 'ar';
  
  return (
    <Button 
      className={cn(
        "bg-[#e7bd71] hover:bg-[#d4ad65] transition-all duration-300 px-4 py-1 h-9 group",
        !isDisabled && "animate-pulse-once"
      )}
      onClick={onNextStep}
      disabled={isDisabled}
    >
      <span className="mr-1">
        {isArabic ? 'متابعة' : 'Continue'}
      </span>
      
      <motion.span
        whileHover={{ x: isArabic ? -2 : 2 }}
        className="relative"
      >
        {isArabic ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
      </motion.span>
    </Button>
  );
};
