
import { BookingHeader } from "@/components/booking/BookingHeader";
import { BookingSteps } from "@/components/booking/BookingSteps";
import { Card } from "@/components/ui/card";
import { Branch } from "@/types/booking";
import { useLanguage } from "@/contexts/LanguageContext";

interface BookingContentProps {
  branch: Branch;
  isLoading: boolean;
}

export const BookingContent = ({ branch, isLoading }: BookingContentProps) => {
  const { language } = useLanguage();

  return (
    <div className="text-center w-full max-w-2xl mx-auto">
      <BookingHeader
        branchName={language === 'ar' ? branch?.name_ar : branch?.name}
        branchAddress={language === 'ar' ? branch?.address_ar : branch?.address}
        isLoading={isLoading}
      />
      
      <Card className="overflow-hidden bg-white shadow-xl rounded-xl border-[#C4A36F]/20 w-full mt-8">
        <div className="p-6">
          <BookingSteps branch={branch} />
        </div>
      </Card>
    </div>
  );
};
