
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CustomBadge } from "@/components/ui/custom-badge";
import ReactCountryFlag from "react-country-flag";
import { format, parse } from "date-fns";
import { cn } from "@/lib/utils";

interface Employee {
  id: string;
  name: string;
  name_ar: string | null;
  role: string;
  photo_url: string | null;
  nationality: string | null;
  working_hours?: Record<string, string[]>;
  off_days?: string[];
}

interface BarberSelectionProps {
  employees: Employee[] | undefined;
  isLoading: boolean;
  selectedBarber: string | undefined;
  onBarberSelect: (barberId: string) => void;
  selectedDate?: Date;
  selectedTime?: string;
}

const isBarberAvailableForDateTime = (employee: Employee, date: Date | undefined, time: string | undefined) => {
  if (!employee.working_hours || !date || !time) return false;
  
  const dayOfWeek = format(date, 'EEEE').toLowerCase();
  const formattedDate = format(date, 'yyyy-MM-dd');
  
  // Check if it's an off day
  if (employee.off_days?.includes(formattedDate)) {
    return false;
  }

  const todayHours = employee.working_hours[dayOfWeek];
  if (!todayHours?.length) return false;

  return todayHours.some(hours => {
    const [start, end] = hours.split('-');
    return time >= start && time <= end;
  });
};

export const BarberSelection = ({
  employees,
  isLoading,
  selectedBarber,
  onBarberSelect,
  selectedDate,
  selectedTime
}: BarberSelectionProps) => {
  const { language, t } = useLanguage();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {Array(4).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-[200px] w-full rounded-lg" />
        ))}
      </div>
    );
  }

  const filteredEmployees = employees?.filter(
    employee => (employee.role === 'barber' || employee.role === 'manager') &&
    (!selectedDate || !selectedTime || isBarberAvailableForDateTime(employee, selectedDate, selectedTime))
  );

  if (filteredEmployees?.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">{t('no.barbers.available')}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {filteredEmployees?.map((employee) => (
        <Button
          key={employee.id}
          variant={selectedBarber === employee.id ? "default" : "outline"}
          onClick={() => onBarberSelect(employee.id)}
          className={cn(
            "relative flex flex-col items-center justify-start h-auto min-h-[200px] p-4 rounded-lg overflow-hidden",
            "space-y-2 border transition-all duration-200",
            selectedBarber === employee.id ? "bg-[#e7bd71]/10 border-[#e7bd71]" : ""
          )}
        >
          <Avatar className="h-16 w-16 mb-2">
            <AvatarImage 
              src={employee.photo_url || undefined} 
              alt={employee.name}
              className="object-cover"
            />
            <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
          </Avatar>
          
          <div className="flex flex-col items-center justify-center gap-2 w-full">
            <span className="font-medium text-base text-gray-700 text-center line-clamp-1 px-2">
              {language === 'ar' ? employee.name_ar : employee.name}
            </span>
            
            {employee.nationality && (
              <div className="flex items-center justify-center mt-1">
                <ReactCountryFlag
                  countryCode={employee.nationality}
                  svg
                  style={{
                    width: '1.2em',
                    height: '1.2em',
                  }}
                  title={employee.nationality}
                />
              </div>
            )}
          </div>
        </Button>
      ))}
    </div>
  );
};
