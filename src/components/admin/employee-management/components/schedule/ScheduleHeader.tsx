import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Employee } from '@/types/employee';

interface ScheduleHeaderProps {
  employees: Employee[];
  selectedEmployee: string | null;
  onEmployeeSelect: (employeeId: string) => void;
  selectedBranch: string | null;
}

export const ScheduleHeader = ({
  employees,
  selectedEmployee,
  onEmployeeSelect,
  selectedBranch,
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
    </div>
  );
};
