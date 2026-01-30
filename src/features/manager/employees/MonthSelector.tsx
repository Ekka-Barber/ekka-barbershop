import { Calendar } from "lucide-react";
import React from 'react';

import { cn } from "@shared/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/ui/components/select";
import { getMonthOptions, formatMonthForDisplay } from "@shared/utils/date/dateUtils";

interface MonthSelectorProps {
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  isLoading?: boolean;
  className?: string;
}

const MonthSelector: React.FC<MonthSelectorProps> = React.memo(({
  selectedMonth,
  onMonthChange,
  isLoading = false,
  className
}) => {
  const monthOptions = React.useMemo(() => getMonthOptions(), []);

  return (
    <div className={cn("flex items-center space-x-2 space-x-reverse", className)}>
      <Calendar 
        className="h-4 w-4 text-ekka-gold" 
        aria-hidden="true"
      />
      <Select 
        value={selectedMonth}
        onValueChange={onMonthChange}
        disabled={isLoading}
      >
        <SelectTrigger 
          className={cn(
            "w-48 bg-white border-gray-200 text-gray-900 text-right",
            "focus:ring-2 focus:ring-ekka-gold focus:border-ekka-gold",
            "hover:border-ekka-gold/50 transition-all duration-200",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "md:w-56",
            isLoading && "opacity-50"
          )}
          aria-label="اختيار الشهر"
          aria-describedby="month-selector-description"
        >
          <SelectValue 
            placeholder="اختر الشهر"
            className="text-right"
            aria-label={selectedMonth ? `الشهر المحدد: ${formatMonthForDisplay(selectedMonth)}` : "اختر الشهر"}
          >
            {selectedMonth ? formatMonthForDisplay(selectedMonth) : "اختر الشهر"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent 
          className="max-h-80"
          aria-label="قائمة الشهور المتاحة"
        >
          {monthOptions.map((option) => (
            <SelectItem 
              key={option.value} 
              value={option.value}
              className={cn(
                "text-right cursor-pointer",
                "hover:bg-ekka-gold/10 focus:bg-ekka-gold/10",
                "data-[state=checked]:bg-ekka-gold/20 data-[state=checked]:text-ekka-dark"
              )}
              aria-label={`اختيار شهر ${option.label}`}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span id="month-selector-description" className="sr-only">
        استخدم هذا الخيار لتصفية البيانات حسب الشهر المطلوب
      </span>
    </div>
  );
});

MonthSelector.displayName = 'MonthSelector';

export { MonthSelector };
