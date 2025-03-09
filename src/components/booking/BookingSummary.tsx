
import { useLanguage } from "@/contexts/LanguageContext";
import { format } from "date-fns";
import { Slash, Timer, Calendar, User, Package, Percent } from "lucide-react";
import { SelectedService, Service } from "@/types/service";
import { motion } from "framer-motion";
import { getBookingDisplayDate } from "@/utils/dateAdjustment";
import { PackageSavingsDrawer } from "./service-selection/summary/PackageSavingsDrawer";
import { usePackageDiscount } from "@/hooks/usePackageDiscount";
import { useToast } from "@/hooks/use-toast";
import { SummaryServicesList } from "./summary/SummaryServicesList";
import { SummaryDetailItem } from "./summary/SummaryDetailItem";
import { SummaryTotalSection } from "./summary/SummaryTotalSection";

interface BookingSummaryProps {
  selectedServices: SelectedService[];
  totalPrice: number;
  selectedDate?: Date;
  selectedTime?: string;
  selectedBarberName?: string;
  onRemoveService?: (serviceId: string) => void;
  availableServices?: Service[];
  onAddService?: (service: Service) => void;
  isDetailsStep?: boolean;
}

const BASE_SERVICE_ID = 'a3dbfd63-be5d-4465-af99-f25c21d578a0';

export const BookingSummary = ({
  selectedServices,
  totalPrice,
  selectedDate,
  selectedTime,
  selectedBarberName,
  onRemoveService,
  availableServices = [],
  onAddService,
  isDetailsStep = false
}: BookingSummaryProps) => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  
  const { 
    packageEnabled, 
    packageSettings, 
    calculatePackageSavings,
    enabledPackageServices,
    hasBaseService
  } = usePackageDiscount(selectedServices);
  
  const totalDuration = selectedServices.reduce((total, service) => total + (service.duration || 0), 0);
  
  const totalOriginalPrice = selectedServices.reduce((sum, service) => 
    sum + (service.originalPrice || service.price), 0);
  
  const totalDiscount = totalOriginalPrice - totalPrice;

  const displayDate = getBookingDisplayDate(selectedDate, selectedTime);
  
  const packageSavings = calculatePackageSavings();

  const availablePackageServices = availableServices.filter(service => 
    enabledPackageServices?.some(enabledService => enabledService.id === service.id) &&
    !selectedServices.some(s => s.id === service.id)
  );

  const handleServiceRemove = (serviceId: string) => {
    if (!onRemoveService) return;

    if (serviceId === BASE_SERVICE_ID) {
      toast({
        title: language === 'ar' ? 'تحذير' : 'Warning',
        description: language === 'ar' 
          ? 'إزالة الخدمة الأساسية ستؤدي إلى فقدان جميع خصومات الباقة'
          : 'Removing the base service will remove all package discounts',
        variant: "destructive"
      });
    }
    
    onRemoveService(serviceId);
  };

  return (
    <>
      <motion.div 
        className="rounded-lg border p-4 space-y-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h3 className="font-medium">{language === 'ar' ? 'ملخص الحجز' : t('booking.summary')}</h3>
        
        {isDetailsStep && packageEnabled && (
          <PackageSavingsDrawer 
            savings={packageSavings}
            availableServices={availablePackageServices}
            packageSettings={packageSettings}
            onAddService={onAddService}
            isDetailsStep={true}
            packageEnabled={packageEnabled}
            hasBaseService={hasBaseService}
          />
        )}
        
        <div className="space-y-2 text-sm divide-y">
          <SummaryServicesList 
            selectedServices={selectedServices}
            language={language as 'en' | 'ar'}
            onRemoveService={handleServiceRemove}
            baseServiceId={BASE_SERVICE_ID}
          />

          {totalDuration > 0 && (
            <SummaryDetailItem
              label={language === 'ar' ? 'المدة الإجمالية' : t('total.duration')}
              value={`${totalDuration} ${language === 'ar' ? 'د' : t('minutes')}`}
              icon={<Timer className="w-4 h-4" />}
              animate={true}
            />
          )}
          
          {displayDate && selectedTime && (
            <SummaryDetailItem
              label={language === 'ar' ? 'التاريخ والوقت' : t('date.time')}
              value={`${format(displayDate, 'dd/MM/yyyy')} - ${selectedTime}`}
              icon={<Calendar className="w-4 h-4" />}
            />
          )}

          {selectedBarberName && (
            <SummaryDetailItem
              label={language === 'ar' ? 'الحلاق' : t('barber')}
              value={selectedBarberName}
              icon={<User className="w-4 h-4" />}
            />
          )}

          {hasBaseService && packageSavings > 0 && (
            <SummaryDetailItem
              label={language === 'ar' ? 'توفير الباقة' : 'Package savings'}
              priceValue={packageSavings}
              language={language as 'en' | 'ar'}
              icon={<Package className="w-4 h-4" />}
              variant="savings"
              valueClassName="text-green-700"
              value=""
            />
          )}
          
          {!hasBaseService && totalDiscount > 0 && (
            <SummaryDetailItem
              label={language === 'ar' ? 'الخصم' : t('discount')}
              priceValue={totalDiscount}
              language={language as 'en' | 'ar'}
              icon={<Percent className="w-4 h-4" />}
              variant="discount"
              valueClassName="text-destructive"
              value=""
            />
          )}
          
          <SummaryTotalSection 
            totalPrice={totalPrice}
            language={language as 'en' | 'ar'}
          />
        </div>
      </motion.div>
    </>
  );
};
