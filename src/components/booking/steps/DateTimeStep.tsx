
import { DateTimeSelection } from "../DateTimeSelection";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/contexts/LanguageContext";

interface DateTimeStepProps {
  selectedDate?: Date;
  setSelectedDate: (date: Date) => void;
  branch: any;
}

const DateTimeStep: React.FC<DateTimeStepProps> = ({
  selectedDate,
  setSelectedDate,
  branch
}) => {
  const { language } = useLanguage();
  
  if (!branch) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-60 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className={`${language === 'ar' ? 'rtl' : 'ltr'}`}>
      <DateTimeSelection
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        branch={branch}
      />
    </div>
  );
};

export default DateTimeStep;
