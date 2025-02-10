
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
  onTimeSelect: (time: string) => void;
}

const generateTimeSlots = (workingHoursRanges: string[] = []) => {
  const slots: string[] = [];
  
  workingHoursRanges.forEach(range => {
    const [start, end] = range.split('-');
    const startTime = parse(start, 'HH:mm', new Date());
    let endTime = parse(end, 'HH:mm', new Date());
    
    if (end === "00:00" || end === "01:00") {
      endTime = new Date(endTime.getTime() + 24 * 60 * 60 * 1000);
    }
    
    let currentSlot = startTime;
    while (currentSlot < endTime) {
      slots.push(format(currentSlot, 'HH:mm'));
      currentSlot = new Date(currentSlot.getTime() + 30 * 60000);
    }
  });

  return slots.sort();
};

export const BarberSelection = ({
  employees,
  isLoading,
  selectedBarber,
  onBarberSelect,
  selectedDate,
  selectedTime,
  onTimeSelect
}: BarberSelectionProps) => {
  const { language, t } = useLanguage();

  const getAvailableTimeSlots = (employee: Employee) => {
    if (!selectedDate || !employee.working_hours) return [];
    
    const dayName = format(selectedDate, 'EEEE').toLowerCase();
    const workingHours = employee.working_hours[dayName] || [];
    
    // Check if it's an off day
    if (employee.off_days?.includes(format(selectedDate, 'yyyy-MM-dd'))) {
      return [];
    }
    
    return generateTimeSlots(workingHours);
  };

  const isEmployeeAvailable = (employee: Employee): boolean => {
    if (!selectedDate || !employee.working_hours) return false;
    
    const dayName = format(selectedDate, 'EEEE').toLowerCase();
    const workingHours = employee.working_hours[dayName] || [];
    
    // Check if it's an off day
    if (employee.off_days?.includes(format(selectedDate, 'yyyy-MM-dd'))) {
      return false;
    }
    
    return workingHours.length > 0;
  };

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
    employee => employee.role === 'barber' || employee.role === 'manager'
  );

  if (filteredEmployees?.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">{t('no.barbers.available')}</p>
      </div>
    );
  }

  const selectedEmployeeTimeSlots = selectedBarber 
    ? getAvailableTimeSlots(filteredEmployees?.find(emp => emp.id === selectedBarber)!)
    : [];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEmployees?.map((employee) => {
          const isAvailable = isEmployeeAvailable(employee);
          const isSelected = selectedBarber === employee.id;
          return (
            <Button
              key={employee.id}
              variant={isSelected ? "default" : "outline"}
              onClick={() => {
                onBarberSelect(employee.id);
                onTimeSelect(''); // Reset time when changing barber
              }}
              className={cn(
                "relative flex flex-col items-center justify-start h-auto min-h-[200px] p-4 rounded-lg overflow-hidden",
                "space-y-2 border transition-all duration-200",
                isSelected 
                  ? "bg-[#e7bd71]/10 border-[#e7bd71] hover:bg-[#e7bd71]/10" 
                  : "hover:bg-accent"
              )}
            >
              <div className="absolute top-2 right-2">
                <CustomBadge
                  variant={isAvailable ? "success" : "destructive"}
                >
                  {isAvailable 
                    ? (language === 'ar' ? 'متاح اليوم' : 'Available Today')
                    : (language === 'ar' ? 'غير متاح' : 'Off Today')
                  }
                </CustomBadge>
              </div>
              
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
          );
        })}
      </div>

      {selectedBarber && selectedEmployeeTimeSlots.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-center">
            {language === 'ar' ? 'اختر الوقت المناسب' : 'Select Available Time'}
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {selectedEmployeeTimeSlots.map((time) => (
              <Button
                key={time}
                variant={selectedTime === time ? "default" : "outline"}
                onClick={() => onTimeSelect(time)}
                className="text-sm"
              >
                {time}
              </Button>
            ))}
          </div>
        </div>
      )}

      {selectedBarber && selectedEmployeeTimeSlots.length === 0 && (
        <div className="text-center text-gray-500">
          {language === 'ar' 
            ? 'لا توجد مواعيد متاحة في هذا اليوم' 
            : 'No available time slots for this day'}
        </div>
      )}
    </div>
  );
};
