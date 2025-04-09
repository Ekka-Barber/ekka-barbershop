
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Employee } from '@/types/employee';

interface ScheduleHeaderProps {
  employees: Employee[];
  selectedEmployee: string | null;
  viewMode: 'day' | 'week';
  onEmployeeSelect: (employeeId: string) => void;
  onViewModeChange: (mode: 'day' | 'week') => void;
  selectedBranch: string | null;
}

export const ScheduleHeader = ({
  employees,
  selectedEmployee,
  viewMode,
  onEmployeeSelect,
  onViewModeChange,
  selectedBranch
}: ScheduleHeaderProps) => {
  // Filter employees by selected branch
  const filteredEmployees = employees.filter(employee => 
    !selectedBranch || employee.branch_id === selectedBranch
  );

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="w-full sm:w-1/3">
        <Label htmlFor="employee-select">Select Employee</Label>
        <Select
          value={selectedEmployee || ""}
          onValueChange={onEmployeeSelect}
        >
          <SelectTrigger id="employee-select" className="w-full">
            <SelectValue placeholder="Select employee" />
          </SelectTrigger>
          <SelectContent>
            {filteredEmployees.map(employee => (
              <SelectItem key={employee.id} value={employee.id}>
                {employee.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="w-full sm:w-1/3">
        <Label htmlFor="view-mode">View Mode</Label>
        <Select
          value={viewMode}
          onValueChange={(value: 'day' | 'week') => onViewModeChange(value)}
        >
          <SelectTrigger id="view-mode" className="w-full">
            <SelectValue placeholder="Select view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Day View</SelectItem>
            <SelectItem value="week">Week View</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
