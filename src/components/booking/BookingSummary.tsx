
import { useLanguage } from "@/contexts/LanguageContext";
import { format } from "date-fns";
import { Slash, X, Timer, Calendar, User, Package } from "lucide-react";
import { SelectedService, Service } from "@/types/service";
import { PriceDisplay } from "@/components/ui/price-display";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { getBookingDisplayDate } from "@/utils/dateAdjustment";
import { CustomBadge } from "@/components/ui/custom-badge";
import { PackageSavingsDrawer } from "./service-selection/summary/PackageSavingsDrawer";
import { usePackageDiscount } from "@/hooks/usePackageDiscount";
import { useToast } from "@/hooks/use-toast";

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

// Base package service ID
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
  
  // Use the package discount hook to get package-related information
  const { 
    packageEnabled, 
    packageSettings, 
    calculatePackageSavings,
    enabledPackageServices
  } = usePackageDiscount(selectedServices);
  
  const totalDuration = selectedServices.reduce((total, service) => total + (service.duration || 0), 0);
  
  // Fixed discount calculation
  const totalOriginalPrice = selectedServices.reduce((sum, service) => 
    sum + (service.originalPrice || service.price), 0);
  
  // The total discount is the difference between original prices and actual prices
  const totalDiscount = totalOriginalPrice - totalPrice;

  const displayDate = getBookingDisplayDate(selectedDate, selectedTime);
  
  // Check if this is a package booking
  const hasBasePackageService = selectedServices.some(s => s.id === BASE_SERVICE_ID);
  const hasPackageDiscounts = hasBasePackageService && totalDiscount > 0;
  const packageSavings = calculatePackageSavings();

  // Get available package services (that aren't already selected)
  const availablePackageServices = availableServices.filter(service => 
    // Update this line to check the id property of each enabled package service
    enabledPackageServices?.some(enabledService => enabledService.id === service.id) &&
    !selectedServices.some(s => s.id === service.id)
  );

  // Handle service removal with confirmation for base service
  const handleServiceRemove = (service: SelectedService) => {
    if (!onRemoveService) return;

    // Check if this is the base service
    if (service.id === BASE_SERVICE_ID) {
      // Show warning toast about removing the base service
      toast({
        title: language === 'ar' ? 'تحذير' : 'Warning',
        description: language === 'ar' 
          ? 'إزالة الخدمة الأساسية ستؤدي إلى فقدان جميع خصومات الباقة'
          : 'Removing the base service will remove all package discounts',
        variant: "destructive"
      });
    }
    
    // Call the remove service handler
    onRemoveService(service.id);
  };

  const serviceItem = (service: SelectedService) => (
    <motion.div 
      key={service.id} 
      className="flex justify-between items-center py-2 group"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center gap-2">
        <span>{language === 'ar' ? service.name_ar : service.name_en}</span>
        {service.id === BASE_SERVICE_ID && (
          <CustomBadge variant="success" className="text-[0.65rem] px-1 py-0">
            {language === 'ar' ? 'أساسي' : 'BASE'}
          </CustomBadge>
        )}
        {onRemoveService && (
          <motion.button
            onClick={() => handleServiceRemove(service)}
            className={cn(
              "p-1 hover:bg-gray-100 rounded-full transition-colors",
              service.isUpsellItem ? "opacity-0 group-hover:opacity-100" : "opacity-70 group-hover:opacity-100"
            )}
            aria-label="Remove service"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-4 h-4 text-red-500" />
          </motion.button>
        )}
      </div>
      <div className="flex items-center gap-2">
        {service.originalPrice && service.originalPrice > service.price && (
          <PriceDisplay 
            price={service.originalPrice} 
            language={language as 'en' | 'ar'} 
            size="sm"
            className="text-[#ea384c] line-through"
          />
        )}
        <PriceDisplay 
          price={service.price} 
          language={language as 'en' | 'ar'} 
          size="sm"
        />
      </div>
    </motion.div>
  );

  return (
    <>
      {/* Show PackageSavingsDrawer on the details step if package discounts are available */}
      {isDetailsStep && packageEnabled && packageSavings > 0 && (
        <PackageSavingsDrawer 
          savings={packageSavings}
          language={language as 'en' | 'ar'}
          availableServices={availablePackageServices}
          packageSettings={packageSettings}
          selectedServices={selectedServices}
          onAddService={onAddService}
          isDetailsStep={true}
        />
      )}
      
      <motion.div 
        className="rounded-lg border p-4 space-y-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h3 className="font-medium">{language === 'ar' ? 'ملخص الحجز' : t('booking.summary')}</h3>
        
        <div className="space-y-2 text-sm divide-y">
          <div className="pb-2">
            <AnimatePresence>
              {selectedServices.length > 0 ? (
                selectedServices.map(service => serviceItem(service))
              ) : (
                <motion.div 
                  className="text-muted-foreground text-center py-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {language === 'ar' ? 'لم يتم اختيار أي خدمات' : 'No services selected'}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {totalDuration > 0 && (
            <div className="pt-2 flex justify-between text-muted-foreground items-center">
              <span className="flex items-center gap-2">
                <Timer className="w-4 h-4" />
                {language === 'ar' ? 'المدة الإجمالية' : t('total.duration')}
              </span>
              <motion.span
                key={totalDuration}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                {totalDuration} {language === 'ar' 
                  ? 'د'
                  : t('minutes')}
              </motion.span>
            </div>
          )}
          
          {displayDate && selectedTime && (
            <div className="pt-2 flex justify-between text-muted-foreground items-center">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {language === 'ar' ? 'التاريخ والوقت' : t('date.time')}
              </span>
              <span>{format(displayDate, 'dd/MM/yyyy')} - {selectedTime}</span>
            </div>
          )}

          {selectedBarberName && (
            <div className="pt-2 flex justify-between text-muted-foreground items-center">
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {language === 'ar' ? 'الحلاق' : t('barber')}
              </span>
              <span>{selectedBarberName}</span>
            </div>
          )}

          {hasPackageDiscounts && (
            <motion.div 
              className="pt-2 flex justify-between text-green-700 items-center"
              initial={{ backgroundColor: "rgba(242, 252, 226, 0.5)" }}
              animate={{ backgroundColor: "transparent" }}
              transition={{ duration: 1 }}
            >
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                <span>{language === 'ar' ? 'توفير الباقة' : 'Package savings'}</span>
              </div>
              <PriceDisplay 
                price={totalDiscount} 
                language={language as 'en' | 'ar'}
                size="sm"
                className="text-green-700"
              />
            </motion.div>
          )}
          
          {!hasPackageDiscounts && totalDiscount > 0 && (
            <motion.div 
              className="pt-2 flex justify-between text-destructive items-center"
              initial={{ backgroundColor: "rgba(254, 226, 226, 0.3)" }}
              animate={{ backgroundColor: "transparent" }}
              transition={{ duration: 1 }}
            >
              <div className="flex items-center gap-2">
                <Slash className="w-4 h-4" />
                <span>{language === 'ar' ? 'الخصم' : t('discount')}</span>
              </div>
              <PriceDisplay 
                price={totalDiscount} 
                language={language as 'en' | 'ar'}
                size="sm"
                className="text-destructive"
              />
            </motion.div>
          )}
          
          <div className="border-t pt-3 font-medium flex justify-between">
            <span>{language === 'ar' ? 'المجموع' : t('total')}</span>
            <motion.div
              key={totalPrice}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <PriceDisplay 
                price={totalPrice} 
                language={language as 'en' | 'ar'}
                size="base"
              />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </>
  );
};
