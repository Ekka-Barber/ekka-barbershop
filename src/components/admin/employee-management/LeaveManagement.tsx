import React, { useState } from 'react';
import { Employee } from '@/types/employee';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, RotateCcw, Plus } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';

interface LeaveManagementProps {
  employees: Employee[];
}

interface LeaveBalance {
  daysTaken: number;
  daysRemaining: number;
  totalAvailable: number;
}

interface LeaveRecord {
  id: string;
  employee_id: string;
  date: string;
  end_date: string;
  duration_days: number;
  reason: string;
}

interface LeaveDataCache {
  balances: Map<string, LeaveBalance>;
  records: Map<string, LeaveRecord[]>;
}

export const LeaveManagement: React.FC<LeaveManagementProps> = ({ employees }) => {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [leaveRange, setLeaveRange] = useState<DateRange | undefined>();
  const [leaveReason, setLeaveReason] = useState<string>('Annual Leave');
  const [showPastLeaveDialog, setShowPastLeaveDialog] = useState(false);
  const [showEmployeeLeaveDialog, setShowEmployeeLeaveDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Calculate accrued leave based on start date (1.75 days per month)
  const calculateAccruedLeave = (startDate: string | undefined, annualQuota: number): number => {
    if (!startDate) return annualQuota;
    
    const today = new Date();
    const employeeStart = new Date(startDate);
    
    // If start date is in the future, no leave available yet
    if (employeeStart > today) return 0;
    
    // Calculate months elapsed since start date
    const monthsWorked = (today.getFullYear() - employeeStart.getFullYear()) * 12 + 
                         (today.getMonth() - employeeStart.getMonth());
    
    // Monthly accrual rate (annual quota divided by 12)
    const monthlyAccrual = annualQuota / 12;
    
    // Calculate accrued leave without capping at annual quota
    const accrued = monthlyAccrual * monthsWorked;
    
    // Round to 2 decimal places then to nearest 0.25
    return Math.round(Math.round(accrued * 4) / 4 * 100) / 100;
  };

  // Query to fetch leave balances and records for all employees
  const { data: leaveData, refetch } = useQuery<LeaveDataCache>({
    queryKey: ['employee-leaves'],
    queryFn: async () => {
      const { data: leaves, error } = await supabase
        .from('employee_holidays')
        .select('*');
      
      if (error) throw error;

      const balances = new Map<string, LeaveBalance>();
      const records = new Map<string, LeaveRecord[]>();
      
      employees.forEach(employee => {
        const employeeLeaves = leaves?.filter(l => l.employee_id === employee.id) || [];
        const daysTaken = employeeLeaves.reduce((sum, leave) => sum + (leave.duration_days || 0), 0);
        const defaultQuota = employee.annual_leave_quota || 21;
        const totalAvailable = calculateAccruedLeave(employee.start_date, defaultQuota);
        
        balances.set(employee.id, {
          daysTaken,
          totalAvailable,
          daysRemaining: totalAvailable - daysTaken
        });
        
        records.set(employee.id, employeeLeaves);
      });

      return {
        balances,
        records
      };
    },
    staleTime: 0, // Make data immediately stale so it refreshes on focus
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });

  const handleAddLeave = async () => {
    if (!selectedEmployee || !leaveRange?.from || !leaveRange.to) {
      toast({
        title: "Error",
        description: "Please select an employee and leave dates",
        variant: "destructive"
      });
      return;
    }

    // Calculate duration in days
    const startDate = new Date(leaveRange.from);
    const endDate = new Date(leaveRange.to);
    const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    try {
      // Format dates as ISO strings since the database expects strings, not Date objects
      const { data, error } = await supabase
        .from('employee_holidays')
        .insert({
          employee_id: selectedEmployee.id,
          date: leaveRange.from.toISOString().split('T')[0], // Convert to YYYY-MM-DD format
          end_date: leaveRange.to.toISOString().split('T')[0], // Convert to YYYY-MM-DD format
          duration_days: durationDays,
          reason: leaveReason
        })
        .select();

      if (error) throw error;

      // Update the cache with the new leave record
      const newLeaveRecord = data?.[0] as LeaveRecord;
      if (newLeaveRecord) {
        queryClient.setQueryData<LeaveDataCache>(['employee-leaves'], (oldData) => {
          if (!oldData) return oldData;
          
          // Create new copies of the maps to avoid mutation
          const newBalances = new Map(oldData.balances);
          const newRecords = new Map(oldData.records);
          
          // Update the records for this employee
          const employeeRecords = [...(newRecords.get(selectedEmployee.id) || []), newLeaveRecord];
          newRecords.set(selectedEmployee.id, employeeRecords);
          
          // Update the balance
          const oldBalance = newBalances.get(selectedEmployee.id);
          if (oldBalance) {
            const updatedBalance: LeaveBalance = {
              ...oldBalance,
              daysTaken: oldBalance.daysTaken + durationDays,
              daysRemaining: oldBalance.totalAvailable - (oldBalance.daysTaken + durationDays)
            };
            newBalances.set(selectedEmployee.id, updatedBalance);
          }
          
          return {
            balances: newBalances,
            records: newRecords
          };
        });
      }
      
      // Immediate refetch to ensure UI is updated
      await refetch();

      toast({
        title: "Success",
        description: "Leave added successfully"
      });

      // Reset selection and close dialog
      setSelectedEmployee(null);
      setLeaveRange(undefined);
      setLeaveReason('Annual Leave');
      setShowEmployeeLeaveDialog(false);
      setShowPastLeaveDialog(false);
    } catch (error) {
      console.error('Error adding leave:', error);
      toast({
        title: "Error",
        description: "Failed to add leave",
        variant: "destructive"
      });
    }
  };

  const handleOpenLeaveDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowEmployeeLeaveDialog(true);
  };

  const handleDeleteLeave = async (leaveId: string) => {
    try {
      const { error } = await supabase
        .from('employee_holidays')
        .delete()
        .eq('id', leaveId)
        .select();

      if (error) throw error;

      // Update the cache by removing the deleted record
      queryClient.setQueryData<LeaveDataCache>(['employee-leaves'], (oldData) => {
        if (!oldData) return oldData;
        
        // Create new copies of the maps to avoid mutation
        const newBalances = new Map(oldData.balances);
        const newRecords = new Map(oldData.records);
        
        // Find which employee this leave belongs to and update their records
        for (const [employeeId, records] of Array.from(newRecords.entries())) {
          const typedRecords = records as LeaveRecord[];
          const recordIndex = typedRecords.findIndex((r) => r.id === leaveId);
          if (recordIndex !== -1) {
            const deletedRecord = typedRecords[recordIndex];
            const newEmployeeRecords = typedRecords.filter((r) => r.id !== leaveId);
            newRecords.set(employeeId, newEmployeeRecords);
            
            // Update the balance
            const oldBalance = newBalances.get(employeeId);
            if (oldBalance) {
              const updatedBalance: LeaveBalance = {
                ...oldBalance,
                daysTaken: oldBalance.daysTaken - deletedRecord.duration_days,
                daysRemaining: oldBalance.totalAvailable - (oldBalance.daysTaken - deletedRecord.duration_days)
              };
              newBalances.set(employeeId, updatedBalance);
            }
            
            break;
          }
        }
        
        return {
          balances: newBalances,
          records: newRecords
        };
      });
      
      // Immediate refetch to ensure UI is updated
      await refetch();

      toast({
        title: "Success",
        description: "Leave record deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting leave:', error);
      toast({
        title: "Error",
        description: "Failed to delete leave record",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
        <h2 className="text-xl sm:text-2xl font-bold">Employee Leave Management</h2>
        <Button variant="outline" onClick={() => setShowPastLeaveDialog(true)} className="w-full sm:w-auto">
          <RotateCcw className="mr-2 h-4 w-4" /> Record Past Leave
        </Button>
      </div>

      {/* Mobile Leave Summary Cards - With progressive disclosure */}
      <div className="block sm:hidden space-y-4">
        {employees.map(employee => {
          const balance = leaveData?.balances.get(employee.id);
          const leaveRecords = leaveData?.records.get(employee.id) || [];
          const defaultQuota = employee.annual_leave_quota || 21;
          const totalAvailable = balance?.totalAvailable ?? calculateAccruedLeave(employee.start_date, defaultQuota);
          const daysTaken = balance?.daysTaken ?? 0;
          const daysRemaining = balance?.daysRemaining ?? (totalAvailable - daysTaken);
          
          return (
            <div 
              key={employee.id} 
              className="border rounded-lg overflow-hidden shadow-sm"
            >
              <div className="bg-muted/30 p-4 flex justify-between items-center">
                <h3 className="font-semibold">{employee.name}</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleOpenLeaveDialog(employee)}
                  className="h-11 w-11 flex items-center justify-center"
                  aria-label={`Add leave for ${employee.name}`}
                >
                  <Calendar className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="p-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-xs text-green-600">Available</p>
                    <p className="text-lg font-semibold text-green-700">{daysRemaining}</p>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <p className="text-xs text-orange-600">Taken</p>
                    <p className="text-lg font-semibold text-orange-700">{daysTaken}</p>
                  </div>
                </div>
                
                {/* Progressive disclosure pattern using Accordion */}
                {leaveRecords.length > 0 && (
                  <Accordion type="single" collapsible className="mt-4">
                    <AccordionItem value={`leave-history-${employee.id}`} className="border-none">
                      <AccordionTrigger className="py-2 text-sm font-medium">
                        View Leave History ({leaveRecords.length})
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3 pt-2">
                          {leaveRecords.map(leave => (
                            <div key={leave.id} className="border p-3 rounded-lg text-sm relative">
                              <div className="flex justify-between items-start gap-2">
                                <div className="flex-1">
                                  <Badge variant="outline" className="mb-1">{leave.reason}</Badge>
                                  <div className="flex justify-between mt-1">
                                    <p className="text-xs">{leave.date} to {leave.end_date}</p>
                                    <p className="text-xs font-medium">{leave.duration_days} days</p>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-10 w-10 -mt-1 -mr-1"
                                  onClick={() => handleDeleteLeave(leave.id)}
                                  aria-label={`Delete leave record from ${leave.date}`}
                                >
                                  <span className="sr-only">Delete</span>
                                  &times;
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}
                
                {leaveRecords.length === 0 && (
                  <div className="mt-4 py-3 text-center text-sm text-muted-foreground bg-muted/30 rounded-lg">
                    No leave records
                  </div>
                )}
                
                {/* Add leave button for quick access */}
                <Button 
                  variant="outline" 
                  onClick={() => handleOpenLeaveDialog(employee)}
                  className="w-full mt-4 h-12"
                >
                  <Calendar className="mr-2 h-4 w-4" /> Add Leave
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Leave Management Cards */}
      <div className="hidden sm:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.map(employee => {
          const balance = leaveData?.balances.get(employee.id);
          const leaveRecords = leaveData?.records.get(employee.id) || [];
          const defaultQuota = employee.annual_leave_quota || 21;
          const totalAvailable = balance?.totalAvailable ?? calculateAccruedLeave(employee.start_date, defaultQuota);
          const daysTaken = balance?.daysTaken ?? 0;
          const daysRemaining = balance?.daysRemaining ?? (totalAvailable - daysTaken);
          
          return (
            <Card key={employee.id} className="relative">
              <CardHeader>
                <CardTitle>{employee.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p>Start Date: {employee.start_date || 'Not Set'}</p>
                  <p>Annual Leave Quota: {defaultQuota} days</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm font-medium">Leave Balance:</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-green-50 p-2 rounded">
                        <p className="text-sm text-green-600">Days Available</p>
                        <p className="text-lg font-semibold text-green-700">{daysRemaining}</p>
                      </div>
                      <div className="bg-orange-50 p-2 rounded">
                        <p className="text-sm text-orange-600">Days Taken</p>
                        <p className="text-lg font-semibold text-orange-700">{daysTaken}</p>
                      </div>
                    </div>
                  </div>
                  
                  <Accordion type="single" collapsible className="mt-4">
                    <AccordionItem value={`leave-history-${employee.id}`}>
                      <AccordionTrigger className="text-sm">Leave History</AccordionTrigger>
                      <AccordionContent>
                        {leaveRecords.length > 0 ? (
                          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                            {leaveRecords.map(leave => (
                              <div key={leave.id} className="border p-2 rounded-md text-xs relative">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <Badge variant="outline" className="mb-1">{leave.reason}</Badge>
                                    <p>{leave.date} to {leave.end_date}</p>
                                    <p className="font-semibold">{leave.duration_days} days</p>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 absolute top-1 right-1"
                                    onClick={() => handleDeleteLeave(leave.id)}
                                  >
                                    <span className="sr-only">Delete</span>
                                    &times;
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No leave records found</p>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                  
                  <Button 
                    variant="outline" 
                    className="w-full mt-4"
                    onClick={() => handleOpenLeaveDialog(employee)}
                  >
                    <Calendar className="mr-2 h-4 w-4" /> Add Leave
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Mobile-Optimized Employee Leave Dialog */}
      <Dialog open={showEmployeeLeaveDialog} onOpenChange={setShowEmployeeLeaveDialog}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-center">Add Leave for {selectedEmployee?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-2">
            <DateRangePicker
              date={leaveRange || { from: undefined, to: undefined }}
              onDateChange={setLeaveRange}
              className="w-full"
            />
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Leave Type</label>
              <Select 
                value={leaveReason} 
                onValueChange={setLeaveReason}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Annual Leave">Annual Leave</SelectItem>
                  <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                  <SelectItem value="Personal Leave">Personal Leave</SelectItem>
                  <SelectItem value="Unpaid Leave">Unpaid Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              onClick={handleAddLeave} 
              disabled={!leaveRange?.from || !leaveRange.to}
              className="w-full h-11"
            >
              Save Leave
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Record Past Leave Dialog - optimized for mobile */}
      <Dialog open={showPastLeaveDialog} onOpenChange={setShowPastLeaveDialog}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-center">Record Past Leave</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Employee</label>
              <Select onValueChange={(value) => {
                const employee = employees.find(e => e.id === value);
                if (employee) setSelectedEmployee(employee);
              }}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <DateRangePicker
              date={leaveRange || { from: undefined, to: undefined }}
              onDateChange={setLeaveRange}
              className="w-full"
            />
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Leave Type</label>
              <Select 
                value={leaveReason} 
                onValueChange={setLeaveReason}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Annual Leave">Annual Leave</SelectItem>
                  <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                  <SelectItem value="Personal Leave">Personal Leave</SelectItem>
                  <SelectItem value="Unpaid Leave">Unpaid Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              onClick={() => {
                handleAddLeave();
                setShowPastLeaveDialog(false);
              }}
              disabled={!selectedEmployee || !leaveRange?.from || !leaveRange.to}
              className="w-full h-11"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Past Leave
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
