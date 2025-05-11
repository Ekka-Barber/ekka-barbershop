import React, { useEffect, useState, useMemo } from 'react';
import { Employee } from '@/types/employee';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format, differenceInCalendarMonths } from 'date-fns';
import { 
  Building2,
  Mail,
  Calendar,
  FileText,
  ChevronDown,
  ChevronUp,
  PencilIcon,
  Briefcase,
  InfoIcon,
  Trash2
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { DocumentList } from './documents/DocumentList';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CountryFlag } from '@/components/admin/employee-management/components/ui/CountryFlag';

// DO NOT CHANGE API LOGIC
interface Branch {
  id: string;
  name: string;
}

interface SalaryPlan {
  id: string;
  name: string;
  name_ar?: string;
  type: string;
}

interface LeaveBalanceInfo {
  daysRemaining: number;
  isLoading: boolean;
}

// Helper function based on LeaveManagement.tsx
const calculateAccruedLeave = (startDate: string | Date | undefined, annualQuota: number): number => {
  if (!startDate) return annualQuota; // Or 0 if preferred when no start date
  
  const employeeStart = new Date(startDate);
  const today = new Date();
  
  if (employeeStart > today) return 0;
  
  const monthsWorked = differenceInCalendarMonths(today, employeeStart);
  
  if (monthsWorked < 0) return 0; // Should not happen if start date is in past

  // Monthly accrual rate (annual quota divided by 12)
  const monthlyAccrual = annualQuota / 12;
  const accrued = monthlyAccrual * monthsWorked;
  
  // Round to 2 decimal places then to nearest 0.25
  const roundedAccrued = Math.round(Math.round(accrued * 4) / 4 * 100) / 100;

  // Cap at annual quota if policy is not to exceed it within a year cycle
  // For simplicity here, we return the accrued amount which might exceed annualQuota if many months passed
  // Or, cap it: return Math.min(roundedAccrued, annualQuota);
  return roundedAccrued;
};

interface EnhancedEmployeeCardProps {
  employee: Employee;
  branches?: Branch[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit?: (employeeData: Employee) => void;
  onArchive?: (employee: Employee) => void;
}

export const EnhancedEmployeeCard: React.FC<EnhancedEmployeeCardProps> = ({
  employee,
  branches = [],
  isExpanded,
  onToggleExpand,
  onEdit,
  onArchive
}) => {
  const [salaryPlan, setSalaryPlan] = useState<SalaryPlan | null>(null);
  const [leaveBalanceInfo, setLeaveBalanceInfo] = useState<LeaveBalanceInfo>({ daysRemaining: 0, isLoading: false });

  const supabase: SupabaseClient = useMemo(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
    return createClient(supabaseUrl, supabaseKey);
  }, []);
  
  const branchName = useMemo(() => 
    branches.find(b => b.id === employee.branch_id)?.name || 'Unknown Branch',
    [branches, employee.branch_id]
  );
  
  const formattedStartDate = useMemo(() => 
    employee.start_date 
      ? format(new Date(employee.start_date), 'MMM d, yyyy')
      : 'Not set',
    [employee.start_date]
  );
    
  useEffect(() => {
    const fetchSalaryPlan = async () => {
      if (!employee.salary_plan_id) return;
      const { data, error } = await supabase
        .from('salary_plans')
        .select('id, name, name_ar, type')
        .eq('id', employee.salary_plan_id)
        .single();
        
      if (!error && data) {
        setSalaryPlan(data);
      } else if (error) {
        console.error(`Error fetching salary plan for ${employee.name}:`, error.message);
        setSalaryPlan(null);
      }
    };
    
    if (isExpanded && employee.salary_plan_id && !salaryPlan) {
      fetchSalaryPlan();
    }
  }, [employee.name, employee.salary_plan_id, isExpanded, salaryPlan, supabase]);

  useEffect(() => {
    const fetchLeaveBalance = async () => {
      if (!employee.id || !isExpanded) return;

      setLeaveBalanceInfo({ daysRemaining: 0, isLoading: true });

      try {
        const { data: holidays, error: holidaysError } = await supabase
          .from('employee_holidays')
          .select('duration_days')
          .eq('employee_id', employee.id);

        if (holidaysError) throw holidaysError;

        const daysTaken = (holidays || []).reduce((sum, leave) => sum + (leave.duration_days || 0), 0);
        const defaultQuota = employee.annual_leave_quota || 0;
        const totalAvailable = calculateAccruedLeave(employee.start_date, defaultQuota);
        const daysRemaining = Math.round((totalAvailable - daysTaken) * 100) / 100;
        
        setLeaveBalanceInfo({ daysRemaining, isLoading: false });

      } catch (error) {
        console.error(`Error fetching leave balance for ${employee.name}:`, error instanceof Error ? error.message : String(error));
        setLeaveBalanceInfo({ daysRemaining: 0, isLoading: false });
      }
    };

    if (isExpanded) {
      fetchLeaveBalance();
    } else {
      setLeaveBalanceInfo({ daysRemaining: 0, isLoading: false });
    }
  }, [employee.id, employee.name, employee.start_date, employee.annual_leave_quota, isExpanded, supabase]);

  const handleEditClick = () => {
    if (onEdit) {
      onEdit(employee);
    }
  };

  const handleArchiveClick = () => {
    if (onArchive) {
      onArchive(employee);
    }
  };

  return (
    <Card className="overflow-hidden h-full transition-all duration-200 flex flex-col">
      <CardHeader className="bg-muted/30 pb-3 pt-4">
        <div className="flex items-start sm:items-center justify-between gap-2">
          <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-muted">
              {employee.photo_url ? (
                <img 
                  src={employee.photo_url} 
                  alt={employee.name} 
                  className="w-full h-full object-cover"
                  loading="lazy"
                  width={48}
                  height={48}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary text-primary-foreground text-lg font-medium">
                  {employee.name.charAt(0).toUpperCase()}{employee.name.split(' ').length > 1 ? employee.name.split(' ')[1].charAt(0).toUpperCase() : ''}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg leading-tight truncate" title={employee.name}>{employee.name}</h3>
              {employee.name_ar && (
                <p className="text-xs text-muted-foreground opacity-80 rtl truncate" dir="rtl">{employee.name_ar}</p>
              )}
              <div className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                <Briefcase className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{employee.role}</span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleExpand}
            className="rounded-full flex-shrink-0"
            aria-label={isExpanded ? "Collapse employee card" : "Expand employee card"}
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onToggleExpand()}
          >
            {isExpanded ? (
              <ChevronUp className="h-4.5 w-4.5" />
            ) : (
              <ChevronDown className="h-4.5 w-4.5" />
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className={`pt-3 flex-grow ${isExpanded ? 'pb-2' : 'pb-4'}`}>
        <div className="grid grid-cols-1 gap-y-1.5 gap-x-3 text-sm">
          <div className="flex items-center text-muted-foreground">
            <Building2 className="w-3.5 h-3.5 mr-2 flex-shrink-0" />
            <span className="truncate">{branchName}</span>
          </div>
          
          {employee.email && (
            <div className="flex items-center text-muted-foreground">
              <Mail className="w-3.5 h-3.5 mr-2 flex-shrink-0" />
              <a href={`mailto:${employee.email}`} className="truncate hover:underline">{employee.email}</a>
            </div>
          )}
          
          {employee.nationality && (
            <CountryFlag country={employee.nationality} size="sm" showName className="text-muted-foreground" />
          )}
          
          <div className="flex items-center text-muted-foreground">
            <Calendar className="w-3.5 h-3.5 mr-2 flex-shrink-0" />
            <span className="truncate">Started: {formattedStartDate}</span>
          </div>
        </div>
        
        {isExpanded && (
          <div className="mt-4">
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-auto mb-1">
                <TabsTrigger value="general" className="text-xs px-2 py-1.5 sm:text-sm sm:py-2.5"><InfoIcon className="w-3.5 h-3.5 mr-1 sm:hidden"/>General</TabsTrigger>
                <TabsTrigger value="documents" className="text-xs px-2 py-1.5 sm:text-sm sm:py-2.5"><FileText className="w-3.5 h-3.5 mr-1 sm:hidden"/>Documents</TabsTrigger>
              </TabsList>
              
              <TabsContent value="general" className="mt-3">
                <div className="space-y-3">
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-1.5">Additional Information</h4>
                    <div className="text-sm space-y-1.5">
                      {salaryPlan ? (
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Salary Plan:</span>
                          <span className="font-medium text-right">
                            {salaryPlan.name}
                            {salaryPlan.name_ar && (
                              <span className="text-xs ms-1 opacity-75 rtl block sm:inline">
                                ({salaryPlan.name_ar})
                              </span>
                            )}
                          </span>
                        </div>
                      ) : employee.salary_plan_id && (
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Salary Plan ID:</span>
                          <span className="font-medium">{employee.salary_plan_id}</span>
                        </div>
                      )}

                      {/* Available Leave Balance Display */}
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Available Leave:</span>
                        {leaveBalanceInfo.isLoading ? (
                          <span className="italic text-muted-foreground">Loading...</span>
                        ) : (
                          <span className="font-medium">{leaveBalanceInfo.daysRemaining} days</span>
                        )}
                      </div>

                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="documents" className="mt-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="text-xs font-medium text-muted-foreground flex items-center">
                      Uploaded Documents
                    </h4>
                  </div>
                  <DocumentList employeeId={employee.id} />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
      
      {isExpanded && (
        <CardFooter className="border-t pt-3 pb-3 bg-muted/20 flex items-center justify-end gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleEditClick}
            aria-label={`Edit details for ${employee.name}`}
          >
            <PencilIcon className="h-3.5 w-3.5 mr-1.5" />
            Edit Details
          </Button>
          <Button 
            variant={employee.is_archived ? "secondary" : "destructive"} 
            size="sm" 
            onClick={handleArchiveClick}
            aria-label={employee.is_archived ? `Restore employee ${employee.name}` : `Archive employee ${employee.name}`}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            {employee.is_archived ? "Restore" : "Archive"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}; 