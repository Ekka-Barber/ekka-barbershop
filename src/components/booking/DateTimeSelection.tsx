
import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { format, isBefore, startOfToday, addDays, isToday, isTomorrow } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";
import { Language } from "@/types/language";
import { Branch } from "@/types/booking";
import { useBookingSettings } from "@/hooks/useBookingSettings";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { convertToArabic } from "@/utils/arabicNumerals";

export interface DateTimeSelectionProps {
  selectedDate: Date | undefined;
  onDateSelect: (date: Date) => void;
  branch: Branch;
}

// QuickDate component for the 3-day selection view
const QuickDateCard: React.FC<{
  date: Date;
  isSelected: boolean;
  onSelect: (date: Date) => void;
  language: Language;
}> = ({ date, isSelected, onSelect, language }) => {
  // Day label (Today, Tomorrow, or day name)
  const getDayLabel = () => {
    if (isToday(date)) return language === 'ar' ? 'اليوم' : 'Today';
    if (isTomorrow(date)) return language === 'ar' ? 'غداً' : 'Tomorrow';
    
    // Format day name
    const dayName = format(date, 'EEEE');
    return language === 'ar' 
      ? {
          'Monday': 'الاثنين',
          'Tuesday': 'الثلاثاء',
          'Wednesday': 'الأربعاء',
          'Thursday': 'الخميس',
          'Friday': 'الجمعة',
          'Saturday': 'السبت',
          'Sunday': 'الأحد'
        }[dayName] || dayName
      : dayName;
  };

  // Format date (Sep 12)
  const formattedDate = language === 'ar'
    ? convertToArabic(format(date, 'd')) + ' ' + 
      {
        'January': 'يناير',
        'February': 'فبراير',
        'March': 'مارس',
        'April': 'أبريل',
        'May': 'مايو',
        'June': 'يونيو',
        'July': 'يوليو',
        'August': 'أغسطس',
        'September': 'سبتمبر',
        'October': 'أكتوبر',
        'November': 'نوفمبر',
        'December': 'ديسمبر'
      }[format(date, 'MMMM')]
    : format(date, 'MMM d');

  return (
    <Card
      className={`cursor-pointer p-4 text-center transition-all ${
        isSelected
          ? 'bg-[#D3E4FD] border-[#8B5CF6] border-2'
          : 'bg-[#F1F1F1] hover:bg-[#E5E5E5]'
      } ${language === 'ar' ? 'rtl' : 'ltr'}`}
      onClick={() => onSelect(date)}
    >
      <div className="font-semibold text-lg">{getDayLabel()}</div>
      <div className="text-[#8E9196]">{formattedDate}</div>
    </Card>
  );
};

export const DateTimeSelection: React.FC<DateTimeSelectionProps> = ({
  selectedDate,
  onDateSelect,
  branch
}) => {
  const { t, language } = useLanguage();
  const today = startOfToday();
  const { data: bookingSettings, isLoading } = useBookingSettings();
  const [showFullCalendar, setShowFullCalendar] = useState(false);
  
  // Use max_advance_days from settings or default to 30 days if not available
  const maxAdvanceDays = bookingSettings?.max_advance_days || 30;
  
  // Maximum date allowed for booking based on settings
  const maxDate = addDays(today, maxAdvanceDays);

  // Generate next 3 available days
  const quickDates = [today, addDays(today, 1), addDays(today, 2)];

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      onDateSelect(date);
    }
  };

  const isDateSelected = (date: Date) => {
    if (!selectedDate) return false;
    return format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
  };

  return (
    <div className="space-y-6 pt-4">
      <h3 className="text-lg font-medium">{t('select.date')}</h3>
      
      {/* Quick 3-day selection */}
      <div className="grid grid-cols-3 gap-3">
        {quickDates.map((date, index) => (
          <QuickDateCard
            key={index}
            date={date}
            isSelected={isDateSelected(date)}
            onSelect={handleDateSelect}
            language={language}
          />
        ))}
      </div>
      
      {/* Show more button */}
      <div className="text-center mt-4">
        <Button
          variant="outline"
          className="bg-[#33C3F0] text-white hover:bg-[#1EAEDB]"
          onClick={() => setShowFullCalendar(!showFullCalendar)}
        >
          {showFullCalendar 
            ? t('show.less') 
            : <>
                {t('show.more')} 
                <ChevronRight className="ml-1 h-4 w-4" />
              </>
          }
        </Button>
      </div>
      
      {/* Full calendar view (conditionally rendered) */}
      {showFullCalendar && (
        <div className="mx-auto p-4 bg-white rounded-lg shadow-sm border border-gray-100 max-w-md">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={(date) => isBefore(date, today) || isBefore(maxDate, date)}
            className={language === 'ar' ? 'rtl' : 'ltr'}
          />
        </div>
      )}
    </div>
  );
};
