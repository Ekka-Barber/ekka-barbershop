
import { Info } from "lucide-react";
import React from "react";

import { SalaryPlanType } from "@/features/manager/types/salary";

interface SalaryExplanationProps {
  type: SalaryPlanType;
}

export const SalaryExplanation = ({ type }: SalaryExplanationProps) => {
  let explanationText = "";
  
  switch (type) {
    case "dynamic_basic":
      explanationText = "الراتب الأساسي مع مكافآت إضافية عند تحقيق أهداف المبيعات، ونسبة عمولة على المبيعات التي تتجاوز الحد الأدنى.";
      break;
    case "fixed":
      explanationText = "راتب شهري ثابت بغض النظر عن المبيعات.";
      break;
    default:
      return null;
  }
  
  return (
    <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-600 flex items-start p-4 rounded-lg bg-gradient-to-r from-blue-50 to-transparent">
      <Info className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5 text-blue-500" />
      <p className="leading-relaxed">{explanationText}</p>
    </div>
  );
};
