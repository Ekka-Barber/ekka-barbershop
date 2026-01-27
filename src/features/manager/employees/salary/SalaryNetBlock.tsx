
import React from "react";

export function SalaryNetBlock({ netSalary, isLoading: _isLoading }: { netSalary: number; isLoading: boolean }) {
  return (
    <div className="bg-gradient-to-br from-[#4F8DFD]/90 to-[#FF719A]/80 p-5 rounded-2xl shadow-lg mt-6 mb-2 border-2 border-blue-100 flex flex-col items-center justify-center">
      <div className="flex items-center gap-3 mb-0.5">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
          className="h-7 w-7 text-white drop-shadow-sm bg-blue-400/90 rounded-full p-1 border border-white/60">
          <path d="M7 22V2M17 22V2M2 10H22M2 14H22"
            stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-white font-bold text-xl drop-shadow-sm">صافي الراتب</span>
      </div>
      <span className="text-3xl font-extrabold text-white tracking-wide mb-0.5 drop-shadow-lg">
        {(isNaN(netSalary) ? 0 : netSalary).toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })} ر.س
      </span>
      <span className="text-white/80 text-xs mt-1">
        (الأساسي + العمولات + البونص + المكافآت - الخصومات - السلف)
      </span>
    </div>
  );
}
