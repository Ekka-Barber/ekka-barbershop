
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ActionButtonProps {
  onClick: () => void;
  isDisabled?: boolean;
  direction: 'next' | 'prev';
  language: 'en' | 'ar';
}

export const ActionButton = ({
  onClick,
  isDisabled = false,
  direction,
  language
}: ActionButtonProps) => {
  const isArabic = language === 'ar';
  const isNext = direction === 'next';
  
  // Determine which icon to show based on direction and language
  const icon = () => {
    if (isArabic) {
      return isNext ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />;
    }
    return isNext ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />;
  };
  
  return (
    <Button 
      className={cn(
        "rounded-full w-9 h-9 p-0 flex items-center justify-center",
        "bg-[#e7bd71] hover:bg-[#d4ad65]", // Same golden color for both buttons
        isDisabled ? "opacity-50 cursor-not-allowed" : "transition-all duration-300 group"
      )}
      onClick={onClick}
      disabled={isDisabled}
    >
      <motion.span
        whileHover={{ x: isNext ? (isArabic ? -2 : 2) : (isArabic ? 2 : -2) }}
        className="relative flex items-center justify-center"
      >
        {icon()}
      </motion.span>
    </Button>
  );
};
