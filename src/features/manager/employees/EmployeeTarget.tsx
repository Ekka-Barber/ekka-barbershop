import { Calculator, Loader2, ChevronDown, ChevronUp, TrendingUp } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

import { Button } from "@shared/ui/components/button";
import { Card } from "@shared/ui/components/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@shared/ui/components/collapsible";

import { EmployeeSalaryDetails } from "./EmployeeSalaryDetails";
import { formatSalesDate } from "./employeeUtils";

import type { SupabaseEmployee } from "@/features/manager/hooks/useEmployeeData";
import { useMonthContext } from "@/features/manager/hooks/useMonthContext";
import { useSalaryCalculation } from "@/features/manager/hooks/useSalaryCalculation";

interface EmployeeTargetProps {
  sales: {
    amount: number;
    updated_at: string;
  };
  employee: SupabaseEmployee;
}

export const EmployeeTarget = ({
  sales,
  employee
}: EmployeeTargetProps) => {
  const [expanded, setExpanded] = useState(false);
  const { selectedMonth } = useMonthContext();
  
  const { 
    baseSalary, 
    commission, 
    targetBonus,
    deductions, 
    loans, 
    planType,
    planName,
    isLoading,
    calculate,
    calculationDone,
    bonusList = [],
    deductionsList = [],
    loansList = []
  } = useSalaryCalculation(
    employee.id,
    employee.name,
    selectedMonth,
    sales.amount,
    employee.salary_plan_id,
    employee.start_date ?? null,
    employee.end_date ?? null
  );

  // Trigger calculation when expanded and not done yet
  useEffect(() => {
    if (expanded && !calculationDone && !isLoading) {
      calculate();
    }
  }, [expanded, calculationDone, isLoading, calculate, employee.id, employee.name, selectedMonth, sales.amount]);

  // Reset expanded state when month changes to force fresh calculation
  useEffect(() => {
    setExpanded(false);
  }, [selectedMonth]);

  const handleExpand = useCallback(() => {
    setExpanded(!expanded);
  }, [expanded]);

  const netSalary =
    Number(baseSalary || 0) +
    Number(commission || 0) +
    Number(targetBonus || 0) +
    bonusList.reduce((sum, bonus) => sum + Number(bonus.amount || 0), 0) -
    Number(deductions || 0) -
    Number(loans || 0);

  return (
    <Card className="w-full overflow-hidden border-none shadow-md mb-6 bg-gradient-to-br from-white to-gray-50">
      <div className="bg-gradient-to-r from-[#FF719A] to-[#FF9671] text-white font-bold text-sm px-4 py-2.5 rounded-t-lg flex items-center justify-center gap-2">
        <TrendingUp className="h-4 w-4" />
        <span>Target</span>
      </div>
      <Collapsible open={expanded} onOpenChange={setExpanded}>
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex flex-col space-y-1">
              <span className="text-xs text-gray-500 font-medium">
                {formatSalesDate(sales.updated_at)}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-[#ea384c] font-bold text-xl">
                  {sales.amount.toLocaleString('en-US')}
                </span>
                <span className="font-bold text-gray-600 text-sm">ر.س</span>
              </div>
            </div>
            <CollapsibleTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-xs border-none shadow-sm bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-700 hover:text-blue-800 transition-all duration-200 flex items-center gap-1.5 px-4 py-2 h-auto"
                onClick={handleExpand}
              >
                {isLoading && !calculationDone ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Calculator className="h-3.5 w-3.5" />
                )}
                {expanded ? 'إخفاء الراتب' : 'أحسب الراتب'}
                {expanded ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>
        <CollapsibleContent className="animate-expand border-t-0 bg-white">
          <EmployeeSalaryDetails
            isLoading={isLoading}
            calculationDone={calculationDone}
            planName={planName}
            planType={planType}
            baseSalary={baseSalary}
            commission={commission}
            targetBonus={targetBonus}
            bonusList={bonusList}
            deductions={deductions}
            deductionsList={deductionsList}
            loans={loans}
            loansList={loansList}
            netSalary={netSalary}
            employeeData={{
              id: employee.id,
              name: employee.name,
              name_ar: employee.name_ar || employee.name,
              role: employee.role || 'موظف',
              photo_url: employee.photo_url || '',
              nationality: employee.nationality || '',
              branch: employee.branch || 'الفرع الرئيسي',
            }}
            totalSales={sales.amount}
          />
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
