
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ReactCountryFlag from "react-country-flag";

interface Employee {
  id: string;
  name: string;
  name_ar: string | null;
  role: string;
  photo_url: string | null;
  nationality: string | null;
}

interface BarberSelectionProps {
  employees: Employee[] | undefined;
  isLoading: boolean;
  selectedBarber: string | undefined;
  onBarberSelect: (barberId: string) => void;
}

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
    employee => employee.role === 'barber' || employee.role === 'manager'
  );

  return (
    <div className="grid grid-cols-2 gap-4">
      {filteredEmployees?.map((employee) => (
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
      ))}
    </div>
  );
};
