
import { useState } from "react";

import { roleColors, roleGradients, roleBorderColors } from "@shared/constants/roles";
import { cn } from "@shared/lib/utils";
import { Button } from "@shared/ui/components/button";
import { Card, CardContent } from "@shared/ui/components/card";

import { DeductionLoanForm } from "./DeductionLoanForm";
import { EmployeeInfo } from "./EmployeeInfo";
import { EmployeeTarget } from "./EmployeeTarget";
import { LeaveBalance } from "./LeaveBalance";
import { LeaveHistory } from "./LeaveHistory";

import { SupabaseEmployee } from "@/features/manager/hooks/useEmployeeData";
import { useEmployeeLeaveBalance } from "@/features/manager/hooks/useEmployeeLeaveBalance";


interface EmployeeCardProps {
  employee: SupabaseEmployee;
  onUpdate: () => void;
}

export const EmployeeCard = ({
  employee,
  onUpdate
}: EmployeeCardProps) => {
  const [openPanel, setOpenPanel] = useState<"deduction" | "loan" | null>(null);
  const { leaveBalance, leaveData, isLoading: isLoadingLeave } = useEmployeeLeaveBalance(employee.id);

  // Helper: close panel after success (passed to form)
  const handleSuccess = () => {
    setOpenPanel(null);
    onUpdate();
  };

  // Ensure role has a default value
  const employeeRole = employee.role || 'employee';

  // Ensure EmployeeTarget always gets sales props—even if missing
  const sales = employee.sales;
  const salesProp = sales
    ? { amount: sales.amount, updated_at: sales.updated_at }
    : {
        amount: 0,
        updated_at: new Date().toISOString(),
      };

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300 group hover:shadow-xl hover:-translate-y-1",
      roleColors[employeeRole],
      "border-2"
    )}>
      <CardContent className="p-0 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className={`absolute top-0 right-0 w-full h-full bg-gradient-to-br ${roleGradients[employeeRole]} opacity-70 pointer-events-none z-0`}></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-tr from-blue-50/30 to-transparent rounded-full opacity-60 blur-xl pointer-events-none"></div>
        
        <div className="relative z-10 p-5">
          <EmployeeInfo 
            name={employee.name}
            name_ar={employee.name_ar || undefined}
            role={employeeRole}
            photo_url={employee.photo_url || undefined}
            nationality={employee.nationality || undefined}
          />

          {/* Add the LeaveBalance component */}
          <LeaveBalance 
            leaveBalance={leaveBalance} 
            isLoading={isLoadingLeave} 
          />
          
          {/* Add the LeaveHistory component */}
          <LeaveHistory 
            leaveData={leaveData} 
            isLoading={isLoadingLeave} 
          />

          {/* Always show EmployeeTarget */}
          <EmployeeTarget sales={salesProp} employee={employee} />

          {/* Actions section */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <div className="flex flex-col gap-2 w-full">
              {/* Buttons horizontal, full width */}
              <div className="flex flex-row gap-2 w-full">
                <Button
                  className={cn(
                    "flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow hover:shadow-md transition-all overflow-hidden group relative",
                    openPanel === "deduction" && "ring-2 ring-red-400"
                  )}
                  onClick={() =>
                    setOpenPanel(openPanel === "deduction" ? null : "deduction")
                  }
                  type="button"
                >
                  <span className="relative z-10">إضافة خصم</span>
                  <span className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                </Button>
                <Button
                  className={cn(
                    "flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow hover:shadow-md transition-all overflow-hidden group relative",
                    openPanel === "loan" && "ring-2 ring-purple-400"
                  )}
                  onClick={() =>
                    setOpenPanel(openPanel === "loan" ? null : "loan")
                  }
                  type="button"
                >
                  <span className="relative z-10">إضافة سلفة</span>
                  <span className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                </Button>
              </div>

              {/* Show the open form, full width under buttons */}
              {openPanel === "deduction" && (
                <div className={cn(
                  "mt-4 rounded-md p-4 border-l-4 w-full animate-expand bg-white",
                  roleBorderColors[employeeRole]
                )}>
                  <DeductionLoanForm 
                    employeeId={employee.id} 
                    employeeName={employee.name} 
                    type="deduction" 
                    onSuccess={handleSuccess}
                  />
                </div>
              )}
              {openPanel === "loan" && (
                <div className={cn(
                  "mt-4 rounded-md p-4 border-l-4 w-full animate-expand bg-white",
                  roleBorderColors[employeeRole]
                )}>
                  <DeductionLoanForm 
                    employeeId={employee.id} 
                    employeeName={employee.name} 
                    type="loan" 
                    onSuccess={handleSuccess} 
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
