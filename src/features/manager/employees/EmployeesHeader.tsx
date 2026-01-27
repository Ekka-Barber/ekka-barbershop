import { LogOut } from "lucide-react";

import { Button } from "@shared/ui/components/button";

import { MonthSelector } from "./MonthSelector";

import { useMonthContext } from "@/features/manager/hooks/useMonthContext";

interface EmployeesHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalEmployees: number;
  onLogout: () => void;
  isLoading?: boolean;
}

export const EmployeesHeader = ({
  totalEmployees,
  onLogout,
  isLoading = false
}: EmployeesHeaderProps) => {
  const { selectedMonth, setSelectedMonth } = useMonthContext();

  return (
    <div className="glass-effect rounded-xl mb-8 p-5 mx-4 md:mx-6">
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-ekka-dark">الموظفين</h1>
          <p className="text-gray-600 text-sm mt-1">
            <span className="inline-flex items-center justify-center bg-ekka-gold/10 text-ekka-gold rounded-full px-2.5 py-0.5 text-sm font-medium mr-2">
              {totalEmployees}
            </span>
            موظف
          </p>
        </div>
        <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-4 md:space-x-reverse md:items-center">
          <MonthSelector
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
            isLoading={isLoading}
            className="md:order-1"
          />
          <Button 
            variant="outline" 
            className="border-ekka-gold/50 text-ekka-gold hover:bg-ekka-gold/10 hover:text-ekka-dark transition-all md:order-2" 
            onClick={onLogout}
            disabled={isLoading}
          >
            <LogOut className="ml-2 h-4 w-4" />
            تسجيل الخروج
          </Button>
        </div>
      </div>
    </div>
  );
};
