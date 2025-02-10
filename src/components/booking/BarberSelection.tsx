
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CustomBadge } from "@/components/ui/custom-badge";
import ReactCountryFlag from "react-country-flag";
import { format } from "date-fns";

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
}

const isBarberAvailableNow = (employee: Employee) => {
  if (!employee.working_hours) return false;
  
  const now = new Date();
  const dayOfWeek = format(now, 'EEEE').toLowerCase();
  const currentTime = format(now, 'HH:mm');
  
  // Check if it's an off day
  if (employee.off_days?.includes(format(now, 'yyyy-MM-dd'))) {
    return false;
  }

  const todayHours = employee.working_hours[dayOfWeek];
  if (!todayHours?.length) return false;

  return todayHours.some(hours => {
    const [start, end] = hours.split('-');
    return currentTime >= start && currentTime <= end;
  });
};

const getAvailabilityStatus = (employee: Employee) => {
  if (isBarberAvailableNow(employee)) {
    return { text: "Available Now", variant: "success" as const };
  }
  
  const now = new Date();
  const dayOfWeek = format(now, 'EEEE').toLowerCase();
  
  if (employee.working_hours?.[dayOfWeek]) {
    return { text: "Available Today", variant: "secondary" as const };
  }
  
  return { text: "Not Available", variant: "destructive" as const };
};

export const BarberSelection = ({
  employees,
  isLoading,
  selectedBarber,
  onBarberSelect
}: BarberSelectionProps) => {
  const { language } = useLanguage();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {Array(4).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-[200px] w-full rounded-lg" />
        ))}
      </div>
    );
  }

  const filteredEmployees = employees?.filter(
    employee => (employee.role === 'barber' || employee.role === 'manager')
  );

  return (
    <div className="grid grid-cols-2 gap-4">
      {filteredEmployees?.map((employee) => {
        const availabilityStatus = getAvailabilityStatus(employee);
        
        return (
          <Button
            key={employee.id}
            variant={selectedBarber === employee.id ? "default" : "outline"}
            onClick={() => onBarberSelect(employee.id)}
            className={`flex flex-col items-center justify-center p-6 h-[200px] space-y-4 rounded-lg transition-all duration-300 ${
              selectedBarber === employee.id 
                ? "bg-[#e7bd71] hover:bg-[#d4ad65] border-[#d4ad65]" 
                : "hover:bg-accent"
            }`}
          >
            <Avatar className="h-24 w-24">
              <AvatarImage 
                src={employee.photo_url || undefined} 
                alt={employee.name}
                className="object-cover"
              />
              <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-center justify-center gap-2">
              <span className="font-medium text-lg text-gray-700">
                {language === 'ar' ? employee.name_ar : employee.name}
              </span>
              <CustomBadge variant={availabilityStatus.variant}>
                {availabilityStatus.text}
              </CustomBadge>
              {employee.nationality && (
                <div className="flex items-center justify-center">
                  <ReactCountryFlag
                    countryCode={employee.nationality}
                    svg
                    style={{
                      width: '2em',
                      height: '2em',
                    }}
                    title={employee.nationality}
                  />
                </div>
              )}
            </div>
          </Button>
        );
      })}
    </div>
  );
};
