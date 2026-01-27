
import { Info, Calculator } from "lucide-react";
import React from "react";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@shared/ui/components/tooltip";

export interface SalaryRowProps {
  label: string;
  value: number;
  tooltip?: string;
  positive?: boolean;
  negative?: boolean;
  bold?: boolean;
  lightText?: boolean;
  icon?: 'main' | 'commission' | 'bonus' | 'deduction' | 'loan' | 'total';
}

export const SalaryRow = ({ label, value, tooltip, positive, negative, bold, lightText, icon }: SalaryRowProps) => {
  const formattedValue = value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });

  const displayValue = () => {
    if (negative && value > 0) return `-${formattedValue}`;
    if (positive && value > 0) return `+${formattedValue}`;
    return formattedValue;
  };

  const valueClassName = () => {
    if (lightText) return "font-bold text-white";
    if (negative && value > 0) return "text-red-600";
    if (positive && value > 0) return "text-green-600";
    return bold ? "font-bold text-blue-800" : "";
  };

  const getIcon = () => {
    switch (icon) {
      case 'main':
        return <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
          <Calculator className="h-4 w-4" />
        </div>;
      case 'commission':
        return <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 13H5.24C5.37 13 5.5 13.01 5.63 13.03L7.51 12.97C7.68 12.96 7.85 13.01 7.99 13.12L11.51 15.51C11.67 15.62 11.81 15.72 11.95 15.81C12.26 16.04 12.53 16.06 13.01 16.06H15.43C15.69 16.06 15.89 15.86 15.89 15.6V15.53C15.89 15.33 15.77 15.13 15.57 15.07L13.97 14.55C13.85 14.52 13.77 14.42 13.77 14.29C13.77 14.13 13.9 14 14.06 14H16.59C16.97 14 17.35 14.1 17.69 14.29L20.31 15.9C20.66 16.11 20.83 16.52 20.78 16.94L20.53 18.97C20.52 19.05 20.47 19.11 20.4 19.14C19.38 19.61 17.32 19.56 16.4 19.41C16.08 19.35 15.75 19.19 15.5 18.94L14.11 17.53C14 17.42 13.85 17.36 13.7 17.36H11.88C11.51 17.36 11.45 17.47 11.21 17.71L10.53 18.45C10.35 18.62 10.31 18.9 10.43 19.12C10.66 19.55 11.23 19.85 11.97 19.85H12.95C13.11 19.85 13.26 19.92 13.36 20.03L14.35 21.19C14.44 21.31 14.53 21.42 14.61 21.55" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M8 22C6.35 22 5 20.65 5 19V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M19 8C19.01 5.52 18.54 4.35 17.5 3.32C16.45 2.28 14.98 2 12 2C9.02 2 7.55 2.28 6.5 3.32C5.46 4.35 5 5.52 5 8.01V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M16.5 13H16.51" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>;
      case 'bonus':
        return <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mr-3">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.5 2L9 4.5H7.5C6.5 4.5 5.5 5.5 5.5 6.5C5.5 7.5 6.5 8.5 7.5 8.5H16.5C17.5 8.5 18.5 7.5 18.5 6.5C18.5 5.5 17.5 4.5 16.5 4.5H15L13.5 2H10.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 22V8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M8 12V18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M16 12V18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>;
      case 'deduction':
        return <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center text-red-600 mr-3">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.5 15.5H16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 19.5V11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M7.97 2H16.03C17.11 2 18 2.88 18 3.97V6.99C18 8.07 17.11 8.95 16.03 8.95H7.97C6.89 8.95 6 8.07 6 6.99V3.97C6 2.88 6.89 2 7.97 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M18.77 14.7V18.51C18.77 20.88 17.55 22 15.07 22H8.93C6.45 22 5.23 20.88 5.23 18.51V14.7C5.23 12.33 6.45 11.21 8.93 11.21H15.07C17.55 11.21 18.77 12.33 18.77 14.7Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>;
      case 'loan':
        return <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-3">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 8.5C2 5 4 3.5 7 3.5H17C20 3.5 22 5 22 8.5V15.5C22 19 20 20.5 17 20.5H7C4 20.5 2 19 2 15.5V13.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 12C13.83 12 15.18 10.51 15 8.68L14.34 2H9.67L9 8.68C8.82 10.51 10.17 12 12 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M18.2 12C20.2 12 21.68 10.37 21.48 8.38L21.18 5.5H18.5L17.92 9.61C17.78 10.95 18.77 12 20.11 12H18.2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M5.8 12C3.8 12 2.32 10.37 2.52 8.38L2.82 5.5H5.5L6.08 9.61C6.22 10.95 5.23 12 3.89 12H5.8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 17C13.1046 17 14 16.1046 14 15C14 13.8954 13.1046 13 12 13C10.8954 13 10 13.8954 10 15C10 16.1046 10.8954 17 12 17Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>;
      case 'total':
        return <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white mr-3">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 11.15C13 11.68 12.84 12.19 12.54 12.61C11.84 13.61 10.52 13.99 9.36 13.6C7.98 13.12 7 11.74 7 10.23V7.26C7 6.86 7.08 6.47 7.23 6.11C7.66 5.06 8.72 4.37 9.87 4.37C11.5 4.37 13 5.5 13 7.77V11.15Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M17 7.26V10.23C17 12.29 15.36 14.12 13.22 14.5C13.07 14.53 12.93 14.56 12.77 14.57C12.61 14.59 12.43 14.6 12.26 14.6C11.41 14.6 10.61 14.36 9.91 13.92" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M2 14H22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M5 21.9999L19 21.9999" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M5 22.0001V18.0001C5 17.4478 5.44772 17.0001 6 17.0001H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M14 21.9999V17.9999C14 17.4477 14.4477 16.9999 15 16.9999H18C18.5523 16.9999 19 17.4477 19 17.9999V21.9999" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>;
      default:
        return null;
    }
  };

  return (
    <div className={`flex justify-between items-center ${bold ? 'mt-2' : ''}`}>
      <div className="flex items-center">
        {getIcon()}
        <span className={`${bold ? "font-bold" : ""} ${lightText ? "text-white" : ""}`}>{label}</span>
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className={`inline-block mr-1 ${lightText ? "text-white/70" : "text-gray-400"} cursor-help`}>
                  <Info className="h-3.5 w-3.5 ml-1" />
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-gray-800 text-white">
                <p className="max-w-xs text-xs">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <span className={`${valueClassName()} ${bold ? 'text-lg' : ''}`}>
        {displayValue()} ر.س
      </span>
    </div>
  );
};
