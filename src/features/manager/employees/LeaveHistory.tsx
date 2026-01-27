
import { Calendar, Clock } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@shared/ui/components/card";

import { EmployeeHoliday } from "@/features/manager/types/employeeHolidays";

interface LeaveHistoryProps {
  leaveData: EmployeeHoliday[] | undefined;
  isLoading: boolean;
}

export const LeaveHistory = ({ leaveData, isLoading }: LeaveHistoryProps) => {
  if (isLoading) {
    return (
      <div className="mt-4">
        <div className="animate-pulse bg-gray-200 h-20 rounded-md"></div>
      </div>
    );
  }

  if (!leaveData || leaveData.length === 0) {
    return (
      <div className="mt-4">
        <Card className="bg-gray-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-gray-600">
              <Calendar className="h-4 w-4" />
              سجل الإجازات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">لا توجد إجازات مسجلة</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <Card className="bg-blue-50/50 border-blue-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2 text-blue-700">
            <Calendar className="h-4 w-4" />
            سجل الإجازات ({leaveData.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {leaveData.slice(-3).map((leave) => (
              <div key={leave.id} className="flex items-center justify-between text-xs bg-white rounded-md p-2 shadow-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-blue-500" />
                  <span className="font-medium">{leave.date}</span>
                  {leave.reason && <span className="text-gray-500">- {leave.reason}</span>}
                </div>
                <span className="text-blue-600 font-semibold">
                  {leave.duration_days} {leave.duration_days === 1 ? 'يوم' : 'أيام'}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
