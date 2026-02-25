import React from "react";

import { EmployeeDeduction } from "@/features/manager/types/salary";

export function DeductionDetails({ deductions }: { deductions: Array<EmployeeDeduction> }) {
  return (
    <div className="p-3 bg-red-50/50 rounded-lg text-xs mt-2">
      <h4 className="text-xs font-semibold text-red-700 mb-2">
        تفاصيل الخصومات للشهر الحالي: {deductions?.length || 0}
      </h4>
      {deductions && deductions.length > 0 ? (
        <div className="space-y-1.5">
          {deductions.map((deduction) => (
            <div key={deduction.id || Math.random()} className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                <span className="text-gray-600">{deduction.description || "خصم"}</span>
              </div>
              <div className="flex space-x-3 text-xs">
                <span className="text-gray-500 ml-3">
                  {deduction.date ? new Date(deduction.date).toLocaleDateString('en-US', {
                    year: 'numeric', month: '2-digit', day: '2-digit'
                  }) : ""}
                </span>
                <span className="font-semibold text-red-600">
                  {Number(deduction.amount || 0).toLocaleString('en-US')} ر.س
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-500 text-center py-2">لا توجد خصومات</div>
      )}
    </div>
  );
}
