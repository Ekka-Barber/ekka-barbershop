import React from "react";

import { EmployeeLoan } from "@/features/manager/types/salary";

export function LoanDetails({ loans }: { loans: Array<EmployeeLoan> }) {
  return (
    <div className="p-3 bg-purple-50/50 rounded-lg text-xs mt-2">
      <h4 className="text-xs font-semibold text-purple-700 mb-2">
        تفاصيل السلف للشهر الحالي: {loans?.length || 0}
      </h4>
      {loans && loans.length > 0 ? (
        <div className="space-y-1.5">
          {loans.map((loan, idx) => (
            <div key={loan.id || idx} className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                <span className="text-gray-600">{loan.description || "سلفة"}</span>
              </div>
              <div className="flex space-x-3 text-xs">
                <span className="text-gray-500 ml-3">
                  {loan.date ? new Date(loan.date).toLocaleDateString('en-US', {
                    year: 'numeric', month: '2-digit', day: '2-digit'
                  }) : ""}
                </span>
                <span className="font-semibold text-purple-600">
                  {Number(loan.amount || 0).toLocaleString()} ر.س
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-500 text-center py-2">
          لا توجد سلف
        </div>
      )}
    </div>
  );
}
