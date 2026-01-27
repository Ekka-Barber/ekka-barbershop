import { Loader2 } from "lucide-react";

import { CardContent } from "@shared/ui/components/card";

import PayslipButton from "./payslip/PayslipButton";
import { BonusDetails } from "./salary/BonusDetails";
import { DeductionDetails } from "./salary/DeductionDetails";
import { LoanDetails } from "./salary/LoanDetails";
import { SalaryExplanation } from "./salary/SalaryExplanation";
import { SalaryNetBlock } from "./salary/SalaryNetBlock";
import { SalaryRow } from "./salary/SalaryRow";

import { SalaryPlanType, EmployeeBonus, EmployeeDeduction, EmployeeLoan } from "@/features/manager/types/salary";


export function EmployeeSalaryDetails({
  isLoading,
  calculationDone,
  planName,
  planType,
  baseSalary,
  commission,
  targetBonus,
  bonusList = [],
  deductions,
  deductionsList = [],
  loans,
  loansList = [],
  netSalary,
  employeeData,
  totalSales
}: {
  isLoading: boolean,
  calculationDone: boolean,
  planName: string | null,
  planType: string | null,
  baseSalary: number,
  commission: number,
  targetBonus: number,
  bonusList: Array<EmployeeBonus>,
  deductions: number,
  deductionsList: Array<EmployeeDeduction>,
  loans: number,
  loansList: Array<EmployeeLoan>,
  netSalary: number,
  employeeData: {
    id: string;
    name: string;
    name_ar?: string;
    role: string;
    photo_url?: string;
    nationality?: string;
    branch?: string;
  },
  totalSales?: number,
}) {
  return (
    <CardContent className="p-5">
      <div className="relative">
        <div className="absolute -top-14 -right-10 w-32 h-32 bg-blue-50 rounded-full opacity-20 blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-pink-50 rounded-full opacity-20 blur-2xl pointer-events-none"></div>
        <div className="relative">
          <h3 className="font-bold text-center text-blue-800 mb-5 flex flex-col items-center">
            <span className="text-lg">تفاصيل الراتب</span>
            {planName && <span className="block text-xs text-blue-600 font-normal mt-1 bg-blue-50 px-3 py-1 rounded-full">
              {planName}
            </span>}
          </h3>
           <div className="space-y-4 relative z-10">
             {isLoading || !calculationDone ? (
               <div className="flex flex-col justify-center items-center py-12">
                 <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-3" />
                 <p className="text-sm text-blue-600">جاري حساب الراتب...</p>
               </div>
             ) : (
              <>
                <div className="bg-gradient-to-br from-blue-50/80 to-white p-4 rounded-xl shadow-sm mb-4">
                  <SalaryRow 
                    label="الراتب الأساسي" 
                    value={baseSalary} 
                    tooltip="المبلغ الأساسي للراتب قبل العمولات والخصومات"
                    icon="main"
                  />
                </div>
                {planType === "dynamic_basic" && commission > 0 && (
                  <div className="bg-gradient-to-br from-green-50/80 to-white p-4 rounded-xl shadow-sm">
                    <SalaryRow 
                      label="العمولة" 
                      value={commission} 
                      tooltip="العمولة المحسوبة على أساس المبيعات الشهرية"
                      positive
                      icon="commission"
                    />
                  </div>
                )}
                {targetBonus > 0 && (
                  <div className="bg-gradient-to-br from-amber-50/80 to-white p-4 rounded-xl shadow-sm">
                    <SalaryRow 
                      label="بونص الأهداف" 
                      value={targetBonus} 
                      tooltip="المكافأة المستحقة عند تحقيق أهداف المبيعات"
                      positive
                      icon="bonus"
                    />
                  </div>
                )}
                <div className="bg-gradient-to-br from-amber-50/80 to-white p-4 rounded-xl shadow-sm">
                  <SalaryRow 
                    label="المكافآت" 
                    value={bonusList.reduce((sum, bonus) => sum + Number(bonus.amount || 0), 0)} 
                    tooltip="المكافآت الإضافية للشهر الحالي فقط"
                    positive
                    icon="bonus"
                  />
                  <BonusDetails bonuses={bonusList} />
                </div>
                {deductions > 0 && (
                  <div className="bg-gradient-to-br from-red-50/80 to-white p-4 rounded-xl shadow-sm">
                    <SalaryRow 
                      label="إجمالي الخصومات" 
                      value={deductions} 
                      tooltip="مجموع الخصومات المسجلة لهذا الشهر"
                      negative
                      icon="deduction"
                    />
                    <DeductionDetails deductions={deductionsList} />
                  </div>
                )}
                {loans > 0 && (
                  <div className="bg-gradient-to-br from-purple-50/80 to-white p-4 rounded-xl shadow-sm">
                    <SalaryRow 
                      label="إجمالي السلف" 
                      value={loans} 
                      tooltip="مجموع السلف المسجلة لهذا الشهر"
                      negative
                      icon="loan"
                    />
                    <LoanDetails loans={loansList} />
                  </div>
                )}
                <SalaryNetBlock netSalary={netSalary} isLoading={isLoading} />
                
                {/* Add Payslip Button */}
                <div className="mt-5">
                  <PayslipButton 
                    employeeData={employeeData}
                    salaryData={{
                      planName,
                      planType: planType as SalaryPlanType,
                      baseSalary,
                      commission,
                      targetBonus,
                      bonusList,
                      deductionsList,
                      loansList,
                      deductions,
                      loans,
                      netSalary,
                      totalSales,
                    }}
                  />
                </div>
                
                {/* SalaryExplanation with correct planType handling */}
                {planType && isSalaryPlanType(planType) && (
                  <div className="mt-3">
                    <SalaryExplanation type={planType} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </CardContent>
  );
}

// Utility function to confirm planType is a SalaryPlanType (not generic string)
function isSalaryPlanType(type: string): type is SalaryPlanType {
  return ["fixed", "dynamic_basic"].includes(type);
}
