import { useState } from 'react';
import { Employee } from '@/types/employee';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Info, BarChart, DollarSign, FileText } from 'lucide-react';
import { InfoTabContent, StatsTabContent, FinancialsTabContent } from './EmployeeTabContent';
import { EmployeeDocumentsTab } from './EmployeeDocumentsTab';

// Define Branch interface
interface Branch {
  id: string;
  name: string;
}

interface EmployeeTabsProps {
  employee: Employee;
  salesValue: string;
  onSalesChange: (value: string) => void;
  branches: Branch[];
  refetchEmployees?: () => void;
  selectedMonth?: string;
}

export const EmployeeTabs = ({ 
  employee, 
  salesValue, 
  onSalesChange,
  branches,
  refetchEmployees,
  selectedMonth
}: EmployeeTabsProps) => {
  const [activeTab, setActiveTab] = useState<string>('info');
  
  return (
    <Tabs defaultValue="info" onValueChange={setActiveTab} value={activeTab}>
      <div className="pb-2">
        <TabsList className="flex flex-wrap gap-2 w-full mb-4">
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
          <TabsTrigger value="documents" className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            <span>Documents</span>
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
          selectedMonth={selectedMonth}
        />
      </TabsContent>
      
      <TabsContent value="documents">
        <EmployeeDocumentsTab 
          employee={employee}
          tabValue="documents"
        />
      </TabsContent>
    </Tabs>
  );
};
