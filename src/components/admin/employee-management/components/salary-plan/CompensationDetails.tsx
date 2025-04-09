
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { DollarSign, LoaderCircle } from "lucide-react";
import { formatPrice } from "@/utils/formatters";
import { SalarySummaryCards } from "./SalarySummaryCards";
import { CompensationBreakdown } from "./CompensationBreakdown";

interface CompensationDetailsProps {
  planName: string | null;
  baseSalary: number;
  commission: number;
  targetBonus: number;
  deductions: number;
  loans: number;
  totalSalary: number;
  salesAmount: number;
  selectedMonth: string;
  isLoading: boolean;
  calculationDone: boolean;
  salaryDetails: Array<{ description: string; amount: number }>;
  isVisible: boolean;
  onVisibilityChange: (isVisible: boolean) => void;
}

export const CompensationDetails = ({
  planName,
  baseSalary,
  commission,
  targetBonus,
  deductions,
  loans,
  totalSalary,
  salesAmount,
  selectedMonth,
  isLoading,
  calculationDone,
  salaryDetails,
  isVisible,
  onVisibilityChange
}: CompensationDetailsProps) => {
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
              
              <SalarySummaryCards 
                baseSalary={baseSalary}
                commission={commission}
                targetBonus={targetBonus}
                deductions={deductions}
                loans={loans}
                totalSalary={totalSalary}
              />

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
                salaryDetails={salaryDetails}
              />
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
