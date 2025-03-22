
import React from 'react';
import { Service, SelectedService } from '@/types/service';
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Info, Check, CircleDollarSign, Clock, Minus, Plus, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const PackageBuilderHeader = ({ language }: { language: string }) => {
  return (
    <div className="space-y-1.5">
      <h2 className="text-lg font-semibold leading-none tracking-tight">
        {language === 'ar' ? "بناء باقة الخدمة" : "Build Service Package"}
      </h2>
      <p className="text-sm text-muted-foreground">
        {language === 'ar' 
          ? "اختر خدمات إضافية للحصول على خصم" 
          : "Select add-on services to get a discount"}
      </p>
    </div>
  );
};

export const BaseServiceDisplay = ({ 
  baseService,
  language
}: { 
  baseService: Service | null;
  language: string;
}) => {
  if (!baseService) return null;

  return (
    <div className="rounded-md border p-3 bg-muted/30">
      <div className="flex items-start">
        <div className="p-1.5 bg-primary/10 rounded-md mr-3">
          <Info className="h-4 w-4 text-primary" />
        </div>
        <div className="space-y-1 flex-1">
          <div className="font-medium text-sm flex justify-between">
            <span>
              {language === 'ar' 
                ? "الخدمة الأساسية" 
                : "Base Service"}
            </span>
            <span className="text-primary">
              {baseService.price} {language === 'ar' ? "ريال" : "SAR"}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {language === 'ar' ? baseService.name_ar : baseService.name_en}
          </p>
        </div>
      </div>
    </div>
  );
};

export const PackageServiceList = ({
  services,
  selectedServices,
  onToggleService,
  discountPercentage,
  language
}: {
  services: Service[];
  selectedServices: Service[];
  onToggleService: (service: Service) => void;
  discountPercentage: number;
  language: string;
}) => {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">
        {language === 'ar' ? "الخدمات الإضافية" : "Add-on Services"}
      </h3>
      <div className="grid gap-2 max-h-52 overflow-y-auto pr-1">
        {services.map((service) => {
          const isSelected = selectedServices.some((s) => s.id === service.id);
          
          return (
            <button
              key={service.id}
              onClick={() => onToggleService(service)}
              className={cn(
                "flex items-center justify-between p-3 rounded-md border text-left transition-colors",
                isSelected 
                  ? "bg-primary/5 border-primary/30" 
                  : "hover:bg-muted/50"
              )}
            >
              <div className="flex items-center gap-2 flex-1">
                <div className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center",
                  isSelected ? "bg-primary text-primary-foreground" : "border"
                )}>
                  {isSelected && <Check className="h-3 w-3" />}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {language === 'ar' ? service.name_ar : service.name_en}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {service.duration} {language === 'ar' ? "دقيقة" : "min"}
                    </span>
                    <span className="flex items-center">
                      <CircleDollarSign className="h-3 w-3 mr-1" />
                      {isSelected ? (
                        <span className="flex items-center">
                          <span className="line-through mr-1 opacity-70">{service.price}</span>
                          <span className="text-primary">{Math.round(service.price * (1 - discountPercentage / 100))}</span>
                        </span>
                      ) : (
                        service.price
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const PackageBuilderFooter = ({
  language,
  onClose,
  onConfirm,
  isConfirmDisabled
}: {
  language: string;
  onClose: () => void;
  onConfirm: () => void;
  isConfirmDisabled: boolean;
}) => {
  return (
    <div className="flex justify-between gap-2 pt-2">
      <Button variant="outline" onClick={onClose} className="flex-1">
        {language === 'ar' ? "إلغاء" : "Cancel"}
      </Button>
      <Button 
        onClick={onConfirm} 
        disabled={isConfirmDisabled}
        className="flex-1"
      >
        <CheckCircle2 className="h-4 w-4 mr-2" />
        {language === 'ar' ? "تأكيد الباقة" : "Confirm Package"}
      </Button>
    </div>
  );
};
