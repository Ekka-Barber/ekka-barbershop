
import { formatPrice } from "@/utils/formatters";

interface SalarySummaryCardsProps {
  baseSalary: number;
  commission: number;
  targetBonus: number;
  deductions: number;
  loans: number;
  totalSalary: number;
}

export const SalarySummaryCards = ({
  baseSalary,
  commission,
  targetBonus,
  deductions,
  loans,
  totalSalary
}: SalarySummaryCardsProps) => {
  return (
    <>
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

      {/* Grand total - This stands out clearly */}
      <div className="mt-4 p-3 bg-blue-100 rounded-md text-center">
        <p className="text-xs text-blue-700">Total Salary</p>
        <p className="text-xl font-bold text-blue-800">{formatPrice(totalSalary)}</p>
      </div>
    </>
  );
};
