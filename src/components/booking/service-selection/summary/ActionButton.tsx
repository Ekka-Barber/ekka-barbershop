
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

interface ActionButtonProps {
  onClick: () => void;
  direction: 'prev' | 'next';
  language: 'en' | 'ar';
  isDisabled?: boolean;
  isLoading?: boolean;
}

export const ActionButton = ({
  onClick,
  direction,
  language,
  isDisabled = false,
  isLoading = false
}: ActionButtonProps) => {
  const isArabic = language === 'ar';
  
  // For RTL languages, we need to swap the directions
  const isPrev = direction === 'prev';
  const buttonText = isPrev 
    ? (isArabic ? 'التالي' : 'Previous') 
    : (isArabic ? 'السابق' : 'Next');
  
  // Swap the actual arrow direction for RTL
  const Arrow = isPrev 
    ? (isArabic ? ArrowRight : ArrowLeft) 
    : (isArabic ? ArrowLeft : ArrowRight);

  return (
    <button
      onClick={onClick}
      disabled={isDisabled || isLoading}
      className={`
        flex items-center gap-2 py-2 px-4 rounded-md font-medium text-sm
        ${isPrev 
          ? 'text-gray-600 hover:bg-gray-100' 
          : 'bg-[#C4A484] text-white hover:bg-[#B39476]'}
        ${isDisabled || isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        transition-all duration-200
      `}
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isPrev ? (
        <>
          <Arrow className="h-4 w-4" />
          <span>{buttonText}</span>
        </>
      ) : (
        <>
          <span>{buttonText}</span>
          <Arrow className="h-4 w-4" />
        </>
      )}
    </button>
  );
};
