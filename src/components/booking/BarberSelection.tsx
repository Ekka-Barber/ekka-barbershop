
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

// Map of country codes to emojis
const countryEmojis: { [key: string]: string } = {
  'sa': '🇸🇦',
  'eg': '🇪🇬',
  'jo': '🇯🇴',
  'sy': '🇸🇾',
  'ye': '🇾🇪',
  'pk': '🇵🇰',
  'in': '🇮🇳',
  'bd': '🇧🇩',
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
          <Skeleton key={i} className="h-32 w-full" />
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
          className="h-32 py-4 flex flex-col items-center justify-center space-y-2 relative"
        >
          <Avatar className="h-16 w-16">
            <AvatarImage src={employee.photo_url || undefined} alt={employee.name} />
            <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="text-center">
            <div className="font-medium">
              {language === 'ar' ? employee.name_ar : employee.name}
            </div>
            {employee.nationality && (
              <div className="text-2xl mt-1">
                {countryEmojis[employee.nationality.toLowerCase()] || '🌍'}
              </div>
            )}
          </div>
        </Button>
      ))}
    </div>
  );
};
