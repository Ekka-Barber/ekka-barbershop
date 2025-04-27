import { useState } from 'react';
import { Employee } from '@/types/employee';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Info, BarChart, DollarSign } from 'lucide-react';
import { InfoTabContent, StatsTabContent, FinancialsTabContent } from './EmployeeTabContent';

interface EmployeeTabsProps {
  employee: Employee;
  salesValue: string;
  onSalesChange: (value: string) => void;
  branches: any[];
  refetchEmployees?: () => void;
}

export const EmployeeTabs = ({ 
  employee, 
  salesValue, 
  onSalesChange,
  branches,
  refetchEmployees
}: EmployeeTabsProps) => {
  const [activeTab, setActiveTab] = useState<string>('info');
  
  return (
    <Tabs defaultValue="info" onValueChange={setActiveTab} value={activeTab}>
      <div className="overflow-x-auto pb-2">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="info" className="flex items-center gap-1">
            <Info className="h-4 w-4" />
            <span>Info</span>
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-1">
            <BarChart className="h-4 w-4" />
            <span>Statistics</span>
          </TabsTrigger>
          <TabsTrigger value="financials" className="flex items-center gap-1">
            <DollarSign className="h-4 w-4" />
            <span>Financials</span>
          </TabsTrigger>
        </TabsList>
      </div>
      
      <TabsContent value="info">
        <InfoTabContent 
          employee={employee}
          salesValue={salesValue}
          onSalesChange={onSalesChange}
          branches={branches}
          refetchEmployees={refetchEmployees}
        />
      </TabsContent>
      
      <TabsContent value="stats">
        <StatsTabContent 
          employee={employee}
          salesAmount={parseInt(salesValue) || 0}
          refetchEmployees={refetchEmployees}
        />
      </TabsContent>
      
      <TabsContent value="financials">
        <FinancialsTabContent 
          employee={employee}
          refetchEmployees={refetchEmployees}
        />
      </TabsContent>
    </Tabs>
  );
};
