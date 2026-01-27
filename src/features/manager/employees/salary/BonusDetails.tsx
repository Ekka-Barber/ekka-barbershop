import React from "react";

import { EmployeeBonus } from "@/features/manager/types/salary";

export function BonusDetails({ bonuses }: { bonuses: Array<EmployeeBonus> }) {
  return (
    <div className="p-3 bg-blue-50/50 rounded-lg text-xs">
      <h4 className="text-xs font-semibold text-blue-700 mb-2">تفاصيل المكافآت للشهر الحالي: {bonuses.length}</h4>
      {bonuses.length > 0 ? (
        <div className="space-y-1.5">
          {bonuses.map((bonus) => (
            <div key={bonus.id || Math.random()} className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                <span className="text-gray-600">{bonus.description || "مكافأة"}</span>
              </div>
              <div className="flex space-x-3 text-xs">
                <span className="text-gray-500 ml-3">
                  {bonus.date ? new Date(bonus.date).toLocaleDateString('en-US', {
                    year: 'numeric', month: '2-digit', day: '2-digit'
                  }) : ""}
                </span>
                <span className="font-semibold text-green-600">
                  {Number(bonus.amount || 0).toLocaleString()} ر.س
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-500 text-center py-2">لا توجد مكافآت</div>
      )}
    </div>
  );
}
