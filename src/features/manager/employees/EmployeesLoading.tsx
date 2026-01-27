
import { Loader2 } from "lucide-react";

export const EmployeesLoading = () => {
  return (
    <div className="flex flex-col justify-center items-center h-screen gap-4">
      <div className="relative">
        <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-ekka-gold via-ekka-gold/50 to-ekka-gold opacity-75 blur animate-pulse"></div>
        <div className="relative bg-white rounded-full p-2">
          <Loader2 className="w-12 h-12 animate-spin text-ekka-gold" />
        </div>
      </div>
      <p className="text-gray-500 animate-pulse">جاري تحميل بيانات الموظفين...</p>
    </div>
  );
};
