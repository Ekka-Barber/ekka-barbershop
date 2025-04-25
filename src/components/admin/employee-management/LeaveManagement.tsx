
import React, { useState, useEffect } from 'react';
import { Employee } from '@/types/employee';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface LeaveManagementProps {
  employees: Employee[];
}

export const LeaveManagement: React.FC<LeaveManagementProps> = ({ employees }) => {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [leaveRange, setLeaveRange] = useState<DateRange | undefined>();
  const { toast } = useToast();

  const handleAddLeave = async () => {
    if (!selectedEmployee || !leaveRange?.from || !leaveRange.to) {
      toast({
        title: "Error",
        description: "Please select an employee and leave dates",
        variant: "destructive"
      });
      return;
    }

    try {
      // Format dates as ISO strings since the database expects strings, not Date objects
      const { error } = await supabase
        .from('employee_holidays')
        .insert([{
          employee_id: selectedEmployee.id,
          date: leaveRange.from.toISOString().split('T')[0], // Convert to YYYY-MM-DD format
          end_date: leaveRange.to.toISOString().split('T')[0], // Convert to YYYY-MM-DD format
          reason: 'Annual Leave'
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Leave added successfully"
      });

      // Reset selection
      setSelectedEmployee(null);
      setLeaveRange(undefined);
    } catch (error) {
      console.error('Error adding leave:', error);
      toast({
        title: "Error",
        description: "Failed to add leave",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {employees.map(employee => (
        <Card key={employee.id} className="relative">
          <CardHeader>
            <CardTitle>{employee.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>Start Date: {employee.start_date || 'Not Set'}</p>
              <p>Annual Leave Quota: {employee.annual_leave_quota || 21} days</p>
              <Dialog 
                open={selectedEmployee?.id === employee.id} 
                onOpenChange={() => setSelectedEmployee(null)}
              >
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setSelectedEmployee(employee)}
                  >
                    <Calendar className="mr-2 h-4 w-4" /> Add Leave
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Leave for {employee.name}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <DateRangePicker
                      date={leaveRange || { from: undefined, to: undefined }}
                      onDateChange={setLeaveRange}
                    />
                    <Button 
                      onClick={handleAddLeave} 
                      disabled={!leaveRange?.from || !leaveRange.to}
                      className="w-full"
                    >
                      Save Leave
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
