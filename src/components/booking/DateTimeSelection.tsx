
import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { format, isBefore, startOfToday, addDays } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";
import { Language } from "@/types/language";
import { Branch } from "@/types/booking";

export interface DateTimeSelectionProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  branch: Branch;
}

export const DateTimeSelection: React.FC<DateTimeSelectionProps> = ({
  selectedDate,
  onDateSelect,
  branch
}) => {
  const { t, language } = useLanguage();
  const today = startOfToday();
  
  // Maximum date allowed for booking (e.g., 30 days from today)
  const maxDate = addDays(today, 30);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      onDateSelect(date);
    }
  };

  return (
    <div className="space-y-6 pt-4">
      <h3 className="text-lg font-medium">{t('select.date')}</h3>
      
      <div className="mx-auto p-4 bg-white rounded-lg shadow-sm border border-gray-100 max-w-md">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          disabled={(date) => isBefore(date, today) || isBefore(maxDate, date)}
          className={language === 'ar' ? 'rtl' : 'ltr'}
        />
      </div>
    </div>
  );
};
