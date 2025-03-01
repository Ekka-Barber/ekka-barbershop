
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ReactCountryFlag from "react-country-flag";
import { cn } from "@/lib/utils";
import { AvailabilityBadge } from "./AvailabilityBadge";
import { useLanguage } from "@/contexts/LanguageContext";

interface BarberCardProps {
  id: string;
  name: string;
  name_ar: string | null;
  photo_url: string | null;
  nationality: string | null;
  isAvailable: boolean;
  isSelected: boolean;
  onSelect: () => void;
}

export const BarberCard = ({
  id,
  name,
  name_ar,
  photo_url,
  nationality,
  isAvailable,
  isSelected,
  onSelect,
}: BarberCardProps) => {
  const { language } = useLanguage();

  return (
    <Button
      variant={isSelected ? "default" : "outline"}
      onClick={onSelect}
      disabled={!isAvailable}
      className={cn(
        "relative flex flex-col items-center justify-start h-auto min-h-[200px] p-4 rounded-lg overflow-hidden w-full",
        "space-y-2 border transition-all duration-200",
        isSelected 
          ? "bg-[#FDF9EF] border-[#e7bd71]" 
          : "",
        !isAvailable && "opacity-50 cursor-not-allowed"
      )}
    >
      <div className="absolute top-2 right-2">
        <AvailabilityBadge isAvailable={isAvailable} />
      </div>
      
      <Avatar className="h-16 w-16 mb-2">
        <AvatarImage 
          src={photo_url || undefined} 
          alt={name}
          className="object-cover"
        />
        <AvatarFallback>{name.charAt(0)}</AvatarFallback>
      </Avatar>
      
      <div className="flex flex-col items-center justify-center gap-2 w-full">
        <span className="font-medium text-base text-gray-700 text-center line-clamp-1 px-2">
          {language === 'ar' ? name_ar : name}
        </span>
        
        {nationality && (
          <div className="flex items-center justify-center mt-1">
            <ReactCountryFlag
              countryCode={nationality}
              svg
              style={{
                width: '1.2em',
                height: '1.2em',
              }}
              title={nationality}
            />
          </div>
        )}
      </div>
    </Button>
  );
};
