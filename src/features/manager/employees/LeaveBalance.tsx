import { Calendar } from "lucide-react";

import { LeaveBalance as LeaveBalanceType } from "@/features/manager/types/employeeHolidays";

interface LeaveBalanceProps {
  leaveBalance: LeaveBalanceType | null;
  isLoading: boolean;
}

export const LeaveBalance = ({ leaveBalance, isLoading }: LeaveBalanceProps) => {
  if (isLoading) {
    return (
      <div className="my-4 p-3 bg-gray-50 rounded-lg animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
      </div>
    );
  }

  if (!leaveBalance) {
    return null;
  }

  const { totalDaysTaken, entitledDays, daysRemaining, isNegative } = leaveBalance;

  return (
    <div className="my-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
      <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
        <Calendar className="w-4 h-4 mr-1" />
        <span>رصيد الإجازة</span>
      </h4>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="text-sm text-gray-500">الرصيد</div>
          <div className="text-lg font-semibold text-blue-600">{entitledDays}</div>
          <p className="text-xs text-gray-400 mt-0.5 leading-tight">١.٧٥ يوم تُضاف شهرياً</p>
        </div>
        <div className="w-px h-16 bg-gray-200 mx-2"></div>
        <div className="flex-1">
          <div className="text-sm text-gray-500">أيام مأخوذة</div>
          <div className="text-lg font-semibold">{totalDaysTaken}</div>
          <p className="text-xs text-gray-400 mt-0.5 leading-tight">إجازات مسجلة في النظام</p>
        </div>
        <div className="w-px h-16 bg-gray-200 mx-2"></div>
        <div className="flex-1">
          <div className="text-sm text-gray-500">أيام متبقية</div>
          <div className={`text-lg font-semibold ${isNegative ? 'text-red-600' : 'text-emerald-600'}`}>
            {daysRemaining}
          </div>
          <p className="text-xs text-gray-400 mt-0.5 leading-tight">رصيد متاح للإجازات</p>
        </div>
      </div>
    </div>
  );
}; 
