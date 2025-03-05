
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { PackageSettings } from '@/types/admin';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';

interface PackageInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  packageSettings?: PackageSettings;
}

export const PackageInfoDialog = ({ isOpen, onClose, packageSettings }: PackageInfoDialogProps) => {
  const { language } = useLanguage();
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {language === 'ar' ? 'معلومات الباقة' : 'Package Information'}
          </DialogTitle>
          <DialogDescription>
            {language === 'ar' 
              ? 'احصل على خصومات عند إضافة خدمات إلى حجزك'
              : 'Get discounts when adding services to your booking'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-2">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">
              {language === 'ar' ? 'كيف تعمل الباقات:' : 'How packages work:'}
            </h3>
            <div className="pl-2 space-y-2">
              <div className="flex gap-2 items-center">
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                <p className="text-sm text-gray-600">
                  {language === 'ar' 
                    ? 'اختر خدمة القص مع اللحية كخدمة أساسية'
                    : 'Select Haircut & Beard Trim as your base service'}
                </p>
              </div>
              <div className="flex gap-2 items-center">
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                <p className="text-sm text-gray-600">
                  {language === 'ar' 
                    ? 'أضف خدمات إضافية للحصول على خصم'
                    : 'Add additional services to get a discount'}
                </p>
              </div>
              <div className="flex gap-2 items-center">
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                <p className="text-sm text-gray-600">
                  {language === 'ar' 
                    ? 'يزيد الخصم كلما أضفت المزيد من الخدمات'
                    : 'Discount increases as you add more services'}
                </p>
              </div>
            </div>
          </div>
          
          {packageSettings && (
            <div className="space-y-2 bg-gray-50 p-3 rounded-md">
              <h3 className="text-sm font-medium">
                {language === 'ar' ? 'مستويات الخصم:' : 'Discount Tiers:'}
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col items-center p-2 bg-white rounded border">
                  <Badge variant="outline" className="mb-1">1</Badge>
                  <span className="text-sm font-semibold text-green-600">
                    {packageSettings.discountTiers.oneService}%
                  </span>
                  <span className="text-xs text-gray-500">
                    {language === 'ar' ? 'خدمة إضافية' : 'add-on'}
                  </span>
                </div>
                <div className="flex flex-col items-center p-2 bg-white rounded border">
                  <Badge variant="outline" className="mb-1">2</Badge>
                  <span className="text-sm font-semibold text-green-600">
                    {packageSettings.discountTiers.twoServices}%
                  </span>
                  <span className="text-xs text-gray-500">
                    {language === 'ar' ? 'خدمتان إضافيتان' : 'add-ons'}
                  </span>
                </div>
                <div className="flex flex-col items-center p-2 bg-white rounded border">
                  <Badge variant="outline" className="mb-1">3+</Badge>
                  <span className="text-sm font-semibold text-green-600">
                    {packageSettings.discountTiers.threeOrMore}%
                  </span>
                  <span className="text-xs text-gray-500">
                    {language === 'ar' ? 'خدمات إضافية' : 'add-ons'}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          {packageSettings?.maxServices && (
            <p className="text-sm text-gray-600">
              <span className="font-medium">
                {language === 'ar' ? 'ملاحظة:' : 'Note:'}
              </span>{' '}
              {language === 'ar' 
                ? `الحد الأقصى للخدمات الإضافية هو ${packageSettings.maxServices}`
                : `Maximum ${packageSettings.maxServices} add-on services per package`}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
