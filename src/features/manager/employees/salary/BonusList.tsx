import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { PlusCircle } from "lucide-react";
import React from "react";

import { EmployeeBonus } from "@/features/manager/types/salary";

interface BonusListProps {
  bonuses: EmployeeBonus[];
}

export const BonusList = ({ bonuses }: BonusListProps) => {
  if (!bonuses || bonuses.length === 0) {
    return null;
  }

  // Debug log to check bonuses data
  console.log("Rendering BonusList with:", bonuses);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "d MMM yyyy", { locale: ar });
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString;
    }
  };

  return (
    <div className="mt-3 space-y-2">
      <h4 className="text-xs font-semibold text-blue-700 flex items-center">
        <PlusCircle className="h-3 w-3 mr-1" />
        <span>تفاصيل المكافآت ({bonuses.length})</span>
      </h4>
      <div className="text-xs space-y-1.5 bg-blue-50/50 p-3 rounded-lg max-h-32 overflow-auto">
        {bonuses.map((bonus) => (
          <div key={bonus.id || Math.random()} className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              <span className="text-gray-600">{bonus.description || "مكافأة"}</span>
            </div>
            <div className="flex space-x-3 text-xs">
              <span className="text-gray-500 ml-3">{bonus.date ? formatDate(bonus.date) : ""}</span>
              <span className="font-semibold text-green-600">{Number(bonus.amount || 0).toLocaleString()} ر.س</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
