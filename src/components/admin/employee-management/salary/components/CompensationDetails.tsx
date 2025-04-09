
import { DollarSign } from 'lucide-react';
import { formatPrice } from "@/utils/formatters";
import { SalaryCalculationResult } from '@/lib/salary/types/salary';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { LoaderCircle } from "lucide-react";

interface CompensationDetailsProps {
  calculationData: SalaryCalculationResult;
  salesAmount: number;
  selectedMonth: string;
  isVisible: boolean;
  onVisibilityChange: (value: boolean) => void;
}

export const CompensationDetails = ({
  calculationData,
  salesAmount,
  selectedMonth,
  isVisible,
  onVisibilityChange
}: CompensationDetailsProps) => {
  const {
    baseSalary = 0,
    commission = 0,
    targetBonus = 0,
    deductions = 0,
    loans = 0,
    totalSalary = 0,
    planName,
    details: salaryDetails,
    isLoading,
    calculationDone,
  } = calculationData;

  return (
    <Accordion 
      type="single" 
      collapsible 
      className="w-full" 
      value={isVisible ? "item-1" : ""}
      onValueChange={(value) => onVisibilityChange(value === "item-1")}
    >
      <AccordionItem value="item-1" className="border-b-0">
        <AccordionTrigger className="text-lg font-semibold hover:no-underline p-3 bg-gray-50 rounded-t-md">
          <div className='flex items-center space-x-2'>
            <DollarSign className="h-5 w-5 text-gray-600" />
            <span>Salary & Compensation</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="p-4 border border-t-0 rounded-b-md">
          {isLoading && !calculationDone ? (
            <div className="flex justify-center items-center h-20">
              <LoaderCircle className="h-6 w-6 animate-spin text-gray-500" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-gray-600 mb-2">
                Plan: {planName || 'N/A'}
              </div>
              
              {/* Positive components - Base salary, commission, bonus */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                <div className="bg-blue-50 p-2 rounded-md">
                  <p className="text-xs text-gray-500">Base Salary</p>
                  <p className="text-lg font-semibold">{formatPrice(baseSalary)}</p>
                </div>
                
                <div className={`${commission > 0 ? 'bg-blue-50' : 'bg-gray-50'} p-2 rounded-md`}>
                  <p className="text-xs text-gray-500">Commission</p>
                  <p className="text-lg font-semibold">{formatPrice(commission)}</p>
                </div>
                
                {targetBonus > 0 && (
                  <div className="bg-green-50 p-2 rounded-md">
                    <p className="text-xs text-gray-500">Target Bonus</p>
                    <p className="text-lg font-semibold text-green-700">{formatPrice(targetBonus)}</p>
                  </div>
                )}
              </div>
              
              {/* Negative components - Deductions and loans with clear visual distinction */}
              {(deductions > 0 || loans > 0) && (
                <div className="mt-3">
                  <h4 className="text-sm text-gray-600 mb-2">Subtractions:</h4>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    {deductions > 0 && (
                      <div className="bg-red-50 p-2 rounded-md">
                        <p className="text-xs text-red-500">Deductions</p>
                        <p className="text-lg font-semibold text-red-600">-{formatPrice(deductions)}</p>
                      </div>
                    )}
                    
                    {loans > 0 && (
                      <div className="bg-red-50 p-2 rounded-md">
                        <p className="text-xs text-red-500">Loans</p>
                        <p className="text-lg font-semibold text-red-600">-{formatPrice(loans)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <SalaryTotal totalSalary={totalSalary} />
              
              <p className="text-xs text-gray-500 text-center mt-2">
                Based on {formatPrice(salesAmount)} SAR in sales for {selectedMonth}
              </p>
              
              <CompensationBreakdown 
                baseSalary={baseSalary}
                commission={commission}
                targetBonus={targetBonus}
                deductions={deductions}
                loans={loans}
                totalSalary={totalSalary}
                details={salaryDetails}
              />
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

interface SalaryTotalProps {
  totalSalary: number;
}

const SalaryTotal = ({ totalSalary }: SalaryTotalProps) => (
  <div className="mt-4 p-3 bg-blue-100 rounded-md text-center">
    <p className="text-xs text-blue-700">Total Salary</p>
    <p className="text-xl font-bold text-blue-800">{formatPrice(totalSalary)}</p>
  </div>
);

interface CompensationBreakdownProps {
  baseSalary: number;
  commission: number;
  targetBonus: number;
  deductions: number;
  loans: number;
  totalSalary: number;
  details?: { description: string; amount: number }[];
}

const CompensationBreakdown = ({
  baseSalary,
  commission,
  targetBonus,
  deductions,
  loans,
  totalSalary,
  details
}: CompensationBreakdownProps) => (
  <>
    {/* Detailed breakdown with all components */}
    <div className="mt-4 pt-4 border-t">
      <h4 className="text-sm font-semibold mb-3">Compensation Breakdown:</h4>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Base Salary</span>
          <span className="font-medium">{formatPrice(baseSalary)}</span>
        </div>
        
        {commission > 0 && (
          <div className="flex justify-between">
            <span>Commission</span>
            <span className="font-medium">{formatPrice(commission)}</span>
          </div>
        )}
        
        {targetBonus > 0 && (
          <div className="flex justify-between">
            <span>Target Bonus</span>
            <span className="font-medium text-green-600">{formatPrice(targetBonus)}</span>
          </div>
        )}
        
        {/* Show deductions and loans even if they're zero */}
        <div className="flex justify-between">
          <span>Deductions</span>
          <span className={deductions > 0 ? "font-medium text-red-600" : "font-medium"}>
            {deductions > 0 ? `-${formatPrice(deductions)}` : formatPrice(0)}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Loans</span>
          <span className={loans > 0 ? "font-medium text-red-600" : "font-medium"}>
            {loans > 0 ? `-${formatPrice(loans)}` : formatPrice(0)}
          </span>
        </div>
        
        <div className="flex justify-between pt-2 border-t font-semibold">
          <span>Total</span>
          <span>{formatPrice(totalSalary)}</span>
        </div>
      </div>
    </div>
    
    {/* Individual salary component details if available */}
    {details && details.length > 0 && (
      <div className="mt-4 pt-4 border-t">
        <h4 className="text-sm font-semibold mb-2">Calculation Details:</h4>
        <ul className="space-y-1 text-xs list-disc list-inside text-gray-600">
          {details.map((detail, index) => (
            <li key={index}>
              {detail.description}: {formatPrice(detail.amount)}
            </li>
          ))}
        </ul>
      </div>
    )}
  </>
);
