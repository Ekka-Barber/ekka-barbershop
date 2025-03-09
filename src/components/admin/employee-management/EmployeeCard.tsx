
import { Employee } from '@/types/employee';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScheduleDisplay } from './ScheduleDisplay';
import { RiyalIcon } from '@/components/icons/RiyalIcon';

interface EmployeeCardProps {
  employee: Employee;
  salesValue: string;
  onSalesChange: (value: string) => void;
}

export const EmployeeCard = ({ employee, salesValue, onSalesChange }: EmployeeCardProps) => {
  return (
    <Card className="overflow-hidden h-full">
      <CardHeader className="bg-muted/30 pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          {employee.photo_url && (
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
              <img 
                src={employee.photo_url} 
                alt={employee.name} 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <span>{employee.name}</span>
          {employee.name_ar && (
            <span className="text-sm text-muted-foreground font-normal">
              ({employee.name_ar})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          <div>
            <Label htmlFor={`sales-${employee.id}`} className="text-sm font-medium mb-1.5 block">
              Monthly Sales Amount
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <RiyalIcon className="h-4 w-4 text-muted-foreground" />
              </div>
              <Input
                id={`sales-${employee.id}`}
                type="number"
                placeholder="Enter sales amount"
                value={salesValue}
                onChange={(e) => onSalesChange(e.target.value)}
                className="pl-9"
                min="0"
                step="0.01"
              />
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium mb-1.5 block">
              Weekly Schedule
            </Label>
            <ScheduleDisplay 
              workingHours={employee.working_hours || {}} 
              offDays={employee.off_days || []}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
