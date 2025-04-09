import { Employee } from '@/types/employee';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScheduleDisplay } from './ScheduleDisplay';
import RiyalIcon from '@/components/icons/RiyalIcon';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { LoaderCircle, Building, Info, BarChart } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SalesStatistics } from './components/SalesStatistics';
import { SalaryPlanSection } from './components/SalaryPlanSection';
import { Separator } from '@/components/ui/separator';
import { transformWorkingHours } from '@/utils/workingHoursUtils';

interface EmployeeCardProps {
  employee: Employee;
  salesValue: string;
  onSalesChange: (value: string) => void;
  refetchEmployees?: () => void;
}

export const EmployeeCard = ({ 
  employee, 
  salesValue, 
  onSalesChange,
  refetchEmployees
}: EmployeeCardProps) => {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(employee.branch_id || null);
  const [activeTab, setActiveTab] = useState<string>('info');

  const { data: branches = [] } = useQuery({
    queryKey: ['branches-for-employee-assignment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('branches')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      onSalesChange(value);
    }
  };

  const updateEmployeeBranch = async () => {
    if (!selectedBranchId || selectedBranchId === employee.branch_id) return;

    try {
      setIsUpdating(true);

      const { error } = await supabase
        .from('employees')
        .update({ branch_id: selectedBranchId })
        .eq('id', employee.id);

      if (error) throw error;

      toast({
        title: "Branch updated",
        description: `${employee.name} has been assigned to a new branch.`,
      });

      if (refetchEmployees) {
        refetchEmployees();
      }
    } catch (error) {
      console.error('Error updating employee branch:', error);
      toast({
        title: "Update failed",
        description: "There was an error updating the employee's branch.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

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
        <Tabs defaultValue="info" onValueChange={setActiveTab} value={activeTab}>
          <div className="overflow-x-auto pb-2">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="info" className="flex items-center gap-1">
                <Info className="h-4 w-4" />
                <span>Info</span>
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center gap-1">
                <BarChart className="h-4 w-4" />
                <span>Statistics</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="info" className="space-y-4">
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
                  type="text"
                  placeholder="Enter whole number only"
                  value={salesValue}
                  onChange={handleInputChange}
                  className="pl-9"
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor={`branch-${employee.id}`} className="text-sm font-medium mb-1.5 block flex items-center gap-1">
                <Building className="h-4 w-4" />
                Assigned Branch
              </Label>
              <Select
                value={selectedBranchId || ""}
                onValueChange={setSelectedBranchId}
              >
                <SelectTrigger id={`branch-${employee.id}`} className="w-full">
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map(branch => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedBranchId !== employee.branch_id && (
                <div className="mt-2">
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={updateEmployeeBranch}
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <>
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : "Update Branch"}
                  </Button>
                </div>
              )}
            </div>
            
            <div>
              <Label className="text-sm font-medium mb-1.5 block">
                Weekly Schedule
              </Label>
              <ScheduleDisplay 
                workingHours={transformWorkingHours(employee.working_hours) || {}} 
                offDays={employee.off_days || []}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="stats" className="space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-3">Sales Performance</h3>
              <SalesStatistics employee={employee} />
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-sm font-medium mb-3">Salary & Compensation</h3>
              <SalaryPlanSection 
                employee={employee} 
                salesAmount={parseInt(salesValue) || 0}
                refetchEmployees={refetchEmployees}
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
