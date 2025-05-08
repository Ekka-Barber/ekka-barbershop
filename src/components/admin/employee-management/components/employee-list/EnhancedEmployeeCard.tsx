import React, { useEffect, useState } from 'react';
import { Employee } from '@/types/employee';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { 
  Building2,
  Mail,
  Phone,
  Flag,
  Calendar,
  UserIcon,
  FileText,
  ChevronDown,
  ChevronUp,
  PencilIcon
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { DocumentList } from './documents/DocumentList';
import { createClient } from '@supabase/supabase-js';

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

interface EnhancedEmployeeCardProps {
  employee: Employee;
  branches?: Branch[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onUpdate?: () => void;
}

export const EnhancedEmployeeCard: React.FC<EnhancedEmployeeCardProps> = ({
  employee,
  branches = [],
  isExpanded,
  onToggleExpand,
  onUpdate
}) => {
  const [salaryPlan, setSalaryPlan] = useState<SalaryPlan | null>(null);
  
  // Find branch name from branch_id
  const branchName = branches.find(b => b.id === employee.branch_id)?.name || 'Unknown Branch';
  
  // Format start date
  const formattedStartDate = employee.start_date 
    ? format(new Date(employee.start_date), 'MMM d, yyyy')
    : 'Not set';
    
  // Fetch salary plan details if salary_plan_id exists
  useEffect(() => {
    const fetchSalaryPlan = async () => {
      if (!employee.salary_plan_id) return;
      
      // Create a Supabase client
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Get salary plan details
      const { data, error } = await supabase
        .from('salary_plans')
        .select('id, name, name_ar, type')
        .eq('id', employee.salary_plan_id)
        .single();
        
      if (!error && data) {
        setSalaryPlan(data);
      }
    };
    
    if (isExpanded && employee.salary_plan_id) {
      fetchSalaryPlan();
    }
  }, [employee.salary_plan_id, isExpanded]);

  return (
    <Card className="overflow-hidden h-full transition-all duration-200">
      <CardHeader className="bg-muted/30 pb-3 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
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
                <div className="w-full h-full flex items-center justify-center bg-primary text-primary-foreground text-sm font-medium">
                  {employee.name.substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h3 className="font-medium text-lg leading-tight">{employee.name}</h3>
              <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <UserIcon className="w-3 h-3" />
                <span>{employee.role}</span>
                {employee.name_ar && (
                  <span className="text-xs opacity-75 mr-1 rtl">
                    ({employee.name_ar})
                  </span>
                )}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleExpand}
            className="rounded-full"
            aria-label={isExpanded ? "Collapse employee card" : "Expand employee card"}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className={`pt-4 ${isExpanded ? 'pb-2' : 'pb-4'}`}>
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div className="flex items-center text-muted-foreground">
            <Building2 className="w-4 h-4 mr-2" />
            <span>{branchName}</span>
          </div>
          
          {employee.email && (
            <div className="flex items-center text-muted-foreground">
              <Mail className="w-4 h-4 mr-2" />
              <span>{employee.email}</span>
            </div>
          )}
          
          {employee.phone && (
            <div className="flex items-center text-muted-foreground">
              <Phone className="w-4 h-4 mr-2" />
              <span>{employee.phone}</span>
            </div>
          )}
          
          {employee.nationality && (
            <div className="flex items-center text-muted-foreground">
              <Flag className="w-4 h-4 mr-2" />
              <span>{employee.nationality}</span>
            </div>
          )}
          
          <div className="flex items-center text-muted-foreground">
            <Calendar className="w-4 h-4 mr-2" />
            <span>Started: {formattedStartDate}</span>
          </div>
        </div>
        
        {isExpanded && (
          <div className="mt-4">
            <Tabs defaultValue="info">
              <TabsList className="w-full">
                <TabsTrigger value="info" className="flex-1">Info</TabsTrigger>
                <TabsTrigger value="documents" className="flex-1">Documents</TabsTrigger>
              </TabsList>
              
              <TabsContent value="info" className="mt-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Additional Information</h4>
                    <div className="text-sm grid grid-cols-1 gap-2">
                      {employee.annual_leave_quota !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Annual Leave:</span>
                          <span>{employee.annual_leave_quota} days</span>
                        </div>
                      )}
                      {salaryPlan ? (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Salary Plan:</span>
                          <span>
                            {salaryPlan.name}
                            {salaryPlan.name_ar && (
                              <span className="text-xs ms-1 opacity-75 rtl">
                                ({salaryPlan.name_ar})
                              </span>
                            )}
                          </span>
                        </div>
                      ) : employee.salary_plan_id && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Salary Plan ID:</span>
                          <span>{employee.salary_plan_id}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="documents" className="mt-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium flex items-center">
                      <FileText className="w-4 h-4 mr-1" />
                      Documents
                    </h4>
                  </div>
                  <DocumentList employeeId={employee.id} />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
      
      {isExpanded && (
        <CardFooter className="pt-0 px-6 pb-4 flex justify-end">
          <Button 
            variant="outline" 
            size="sm"
            className="h-8"
            onClick={onUpdate}
          >
            <PencilIcon className="w-3 h-3 mr-1" />
            Edit Details
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}; 