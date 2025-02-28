
import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin } from "lucide-react";

export interface BookingHeaderProps {
  branchName?: string;
  branchAddress?: string;
  isLoading: boolean;
}

export const BookingHeader: React.FC<BookingHeaderProps> = ({
  branchName,
  branchAddress,
  isLoading
}) => {
  const { language } = useLanguage();

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-center mb-2">
        {language === "ar" ? "احجز موعدًا" : "Book an Appointment"}
      </h1>
      
      {isLoading ? (
        <div className="flex flex-col items-center">
          <Skeleton className="h-6 w-40 mb-1" />
          <Skeleton className="h-5 w-60" />
        </div>
      ) : (
        branchName && (
          <div className="text-center">
            <h2 className="text-xl font-medium">{branchName}</h2>
            {branchAddress && (
              <p className="text-gray-600 flex items-center justify-center mt-1">
                <MapPin className="h-4 w-4 mr-1" />
                {branchAddress}
              </p>
            )}
          </div>
        )
      )}
    </div>
  );
};
