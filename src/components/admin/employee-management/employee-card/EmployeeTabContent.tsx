import { Employee } from '@/types/employee';
import { SalesInput } from './SalesInput';
import { BranchSelector } from './BranchSelector';
import { ScheduleDisplay } from '../ScheduleDisplay';
import { transformWorkingHours } from '@/utils/workingHoursUtils';
import { SalesStatistics } from '../components/SalesStatistics';
import { SalaryPlanSection } from '../components/SalaryPlanSection';
import { EmployeeFinancials } from '../components/financials/EmployeeFinancials';

interface InfoTabContentProps {
  employee: Employee;
  salesValue: string;
  onSalesChange: (value: string) => void;
  branches: any[];
  refetchEmployees?: () => void;
}

export const InfoTabContent = ({ 
  employee, 
  salesValue, 
  onSalesChange,
  branches,
  refetchEmployees
}: InfoTabContentProps) => {
  return (
    <div className="space-y-4">
      <SalesInput 
        employeeId={employee.id}
        salesValue={salesValue}
        onSalesChange={onSalesChange}
      />
      
      <BranchSelector 
        employeeId={employee.id}
        employeeName={employee.name}
        initialBranchId={employee.branch_id || null}
        branches={branches}
        refetchEmployees={refetchEmployees}
      />
      
      <div>
        <h3 className="text-sm font-medium mb-1.5 block">
          Weekly Schedule
        </h3>
        <ScheduleDisplay 
          workingHours={transformWorkingHours(employee.working_hours) || {}} 
          offDays={employee.off_days || []}
        />
      </div>
    </div>
  );
};

interface StatsTabContentProps {
  employee: Employee;
  salesAmount: number;
  refetchEmployees?: () => void;
}

export const StatsTabContent = ({ 
  employee,
  salesAmount,
  refetchEmployees
}: StatsTabContentProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-3">Sales Performance</h3>
        <SalesStatistics employee={employee} />
      </div>
      
      <div className="border-t pt-6">
        <h3 className="text-sm font-medium mb-3">Salary & Compensation</h3>
        <SalaryPlanSection 
          employee={employee} 
          salesAmount={salesAmount}
          refetchEmployees={refetchEmployees}
        />
      </div>
    </div>
  );
};

interface FinancialsTabContentProps {
  employee: Employee;
  refetchEmployees?: () => void;
}

export const FinancialsTabContent = ({
  employee,
  refetchEmployees
}: FinancialsTabContentProps) => {
  return (
    <div className="space-y-4">
      <EmployeeFinancials 
        employee={employee}
        refetchEmployees={refetchEmployees}
      />
    </div>
  );
};
