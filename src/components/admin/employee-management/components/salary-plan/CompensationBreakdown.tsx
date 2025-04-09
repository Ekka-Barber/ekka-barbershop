
import { formatPrice } from "@/utils/formatters";

interface CompensationBreakdownProps {
  baseSalary: number;
  commission: number;
  targetBonus: number;
  deductions: number;
  loans: number;
  totalSalary: number;
  salaryDetails: Array<{ description: string; amount: number }>;
}

export const CompensationBreakdown = ({
  baseSalary,
  commission,
  targetBonus,
  deductions,
  loans,
  totalSalary,
  salaryDetails
}: CompensationBreakdownProps) => {
  return (
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
      
      {/* Individual salary component details if available */}
      {salaryDetails && salaryDetails.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <h4 className="text-sm font-semibold mb-2">Calculation Details:</h4>
          <ul className="space-y-1 text-xs list-disc list-inside text-gray-600">
            {salaryDetails.map((detail, index) => (
              <li key={index}>
                {detail.description}: {formatPrice(detail.amount)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
