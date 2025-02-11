
import { useLanguage } from "@/contexts/LanguageContext";
import { CustomBadge } from "@/components/ui/custom-badge";

interface AvailabilityBadgeProps {
  isAvailable: boolean;
}

export const AvailabilityBadge = ({ isAvailable }: AvailabilityBadgeProps) => {
  const { language } = useLanguage();
  
  return (
    <CustomBadge variant={isAvailable ? "success" : "destructive"}>
      {isAvailable 
        ? (language === 'ar' ? 'متاح' : 'Available')
        : (language === 'ar' ? 'غير متاح' : 'Unavailable')
      }
    </CustomBadge>
  );
};
