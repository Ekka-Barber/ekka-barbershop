import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface Employee {
  id: string;
  name: string;
  name_ar: string | null;
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
      <div className="space-y-4">
        {Array(3).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {employees?.map((employee) => (
        <Button
          key={employee.id}
          variant={selectedBarber === employee.id ? "default" : "outline"}
          onClick={() => onBarberSelect(employee.id)}
          className="h-auto py-4 justify-start"
        >
          <div className="text-left rtl:text-right">
            <div className="font-medium">
              {language === 'ar' ? employee.name_ar : employee.name}
            </div>
          </div>
        </Button>
      ))}
    </div>
  );
};