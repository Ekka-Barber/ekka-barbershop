
import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { format, isBefore, startOfToday, addDays } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";
import { Language } from "@/types/language";
import { Branch } from "@/types/booking";
import { useBookingSettings } from "@/hooks/useBookingSettings";

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
  const { data: bookingSettings, isLoading } = useBookingSettings();
  
  // Use max_advance_days from settings or default to 30 days if not available
  const maxAdvanceDays = bookingSettings?.max_advance_days || 30;
  
  // Maximum date allowed for booking based on settings
  const maxDate = addDays(today, maxAdvanceDays);

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
