import { useState } from 'react';
import { Employee } from '@/types/employee';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CircleDollarSign, Wallet, CreditCard } from 'lucide-react';
import { BonusesTab } from './tabs/BonusesTab';
import { DeductionsTab } from './tabs/DeductionsTab';
import { LoansTab } from './tabs/LoansTab';

interface EmployeeFinancialsProps {
  employee: Employee;
  refetchEmployees?: () => void;
  selectedMonth?: string;
}

export const EmployeeFinancials = ({
  employee,
  refetchEmployees,
  selectedMonth
}: EmployeeFinancialsProps) => {
  const [activeTab, setActiveTab] = useState<string>('bonuses');
  const currentMonth = selectedMonth || format(new Date(), 'yyyy-MM');
  
  return (
    <div className="space-y-4">
      <Tabs defaultValue="bonuses" onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="flex flex-wrap gap-2 w-full">
          <TabsTrigger value="bonuses" className="flex items-center gap-1">
            <CircleDollarSign className="h-4 w-4" />
            <span>Bonuses</span>
          </TabsTrigger>
          <TabsTrigger value="deductions" className="flex items-center gap-1">
            <Wallet className="h-4 w-4" />
            <span>Deductions</span>
          </TabsTrigger>
          <TabsTrigger value="loans" className="flex items-center gap-1">
            <CreditCard className="h-4 w-4" />
            <span>Loans</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="bonuses">
          <BonusesTab 
            employee={employee} 
            currentMonth={currentMonth}
            refetchEmployees={refetchEmployees}
          />
        </TabsContent>
        
        <TabsContent value="deductions">
          <DeductionsTab 
            employee={employee} 
            currentMonth={currentMonth}
            refetchEmployees={refetchEmployees}
          />
        </TabsContent>
        
        <TabsContent value="loans">
          <LoansTab 
            employee={employee} 
            currentMonth={currentMonth}
            refetchEmployees={refetchEmployees}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
