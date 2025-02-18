
import { Slash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Check, Plus } from "lucide-react";
import { formatPrice } from "@/utils/formatting/price";

interface ServiceCardFooterProps {
  originalPrice: number;
  discountedPrice: number | null;
  language: string;
  isSelected: boolean;
  onToggle: (e: React.MouseEvent) => void;
  hasDiscount: boolean;
}

export const ServiceCardFooter = ({ 
  originalPrice, 
  discountedPrice, 
  language, 
  isSelected,
  onToggle,
  hasDiscount
}: ServiceCardFooterProps) => {
  return (
    <div className="flex items-center justify-between mt-2">
      <div className="flex items-center gap-2">
        {hasDiscount ? (
          <>
            <span className="relative inline-flex items-center text-sm text-gray-500">
              {formatPrice(originalPrice, language)}
              <Slash className="w-4 h-4 text-destructive absolute -translate-y-1/2 top-1/2 left-1/2 -translate-x-1/2" />
            </span>
            <span className="font-medium">
              {formatPrice(Math.floor(discountedPrice || originalPrice), language)}
            </span>
          </>
        ) : (
          <span>{formatPrice(originalPrice, language)}</span>
        )}
      </div>
      
      <Button
        size="sm"
        variant={isSelected ? "default" : "outline"}
        className={`rounded-full p-2 h-8 w-8 ${
          isSelected ? 'bg-[#e7bd71] hover:bg-[#d4ad65]' : ''
        }`}
        onClick={onToggle}
      >
        {isSelected ? (
          <Check className="h-4 w-4" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};
