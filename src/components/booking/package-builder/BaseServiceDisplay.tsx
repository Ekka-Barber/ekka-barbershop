
import React from 'react';
import { Service } from '@/types/service';

interface BaseServiceDisplayProps {
  baseService: Service | null;
  language: string;
}

export const BaseServiceDisplay = ({ baseService, language }: BaseServiceDisplayProps) => {
  if (!baseService) return null;
  
  return (
    <div className="bg-muted/30 p-3 rounded-md border">
      <div className="text-sm font-medium mb-1">
        {language === 'ar' ? 'الخدمة الأساسية:' : 'Base Service:'}
      </div>
      <div className="flex justify-between items-center">
        <span>{language === 'ar' ? baseService.name_ar : baseService.name_en}</span>
        <span className="text-sm font-medium">
          {language === 'ar' ? `${baseService.price} ر.س` : `SAR ${baseService.price}`}
        </span>
      </div>
    </div>
  );
};
