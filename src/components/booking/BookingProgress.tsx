
import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export type BookingStep = 'services' | 'datetime' | 'barber' | 'customer' | 'summary';

interface BookingProgressProps {
  currentStep: BookingStep;
}

export const BookingProgress: React.FC<BookingProgressProps> = ({ currentStep }) => {
  const { t, language } = useLanguage();
  
  const steps: { key: BookingStep; label: string }[] = [
    { key: 'services', label: language === 'ar' ? 'الخدمات' : 'Services' },
    { key: 'datetime', label: language === 'ar' ? 'التاريخ والوقت' : 'Date & Time' },
    { key: 'barber', label: language === 'ar' ? 'الحلاق' : 'Barber' },
    { key: 'customer', label: language === 'ar' ? 'التفاصيل' : 'Details' },
    { key: 'summary', label: language === 'ar' ? 'الملخص' : 'Summary' }
  ];

  const currentIndex = steps.findIndex(step => step.key === currentStep);

  return (
    <div className="w-full">
      <div className="flex justify-between mb-2">
        {steps.map((step, index) => (
          <div 
            key={step.key} 
            className={`text-xs font-medium ${
              index <= currentIndex ? 'text-[#C4A484]' : 'text-gray-400'
            }`}
          >
            {step.label}
          </div>
        ))}
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-[#C4A484] h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / steps.length) * 100}%` }}
        />
      </div>
    </div>
  );
};
