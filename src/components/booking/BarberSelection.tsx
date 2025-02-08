
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

// Map of country codes to full names
const countryNames: { [key: string]: { en: string; ar: string } } = {
  'sa': { en: 'Saudi Arabia', ar: 'السعودية' },
  'eg': { en: 'Egypt', ar: 'مصر' },
  'jo': { en: 'Jordan', ar: 'الأردن' },
  'sy': { en: 'Syria', ar: 'سوريا' },
  'ye': { en: 'Yemen', ar: 'اليمن' },
  'pk': { en: 'Pakistan', ar: 'باكستان' },
  'in': { en: 'India', ar: 'الهند' },
  'bd': { en: 'Bangladesh', ar: 'بنغلاديش' },
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
              ? "bg-[#FDE1D3] hover:bg-[#FEC6A1] border-[#FEC6A1]" 
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
            <span className="font-medium text-lg">
              {language === 'ar' ? employee.name_ar : employee.name}
            </span>
            {employee.nationality && (
              <span className="text-sm text-muted-foreground">
                {countryNames[employee.nationality.toLowerCase()]?.[language] || 
                 (language === 'ar' ? 'دولي' : 'International')}
              </span>
            )}
          </div>
        </Button>
      ))}
    </div>
  );
};
