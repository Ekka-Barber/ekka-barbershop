
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PartyPopper, ChevronUp, ChevronDown, Check, Plus } from 'lucide-react';
import { PriceDisplay } from "@/components/ui/price-display";
import { 
  Sheet,
  SheetContent,
  SheetTrigger
} from "@/components/ui/sheet";
import { Service, SelectedService } from '@/types/service';
import { PackageSettings } from '@/types/admin';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface PackageSavingsDrawerProps {
  savings: number;
  language: 'en' | 'ar';
  availableServices?: Service[];
  packageSettings?: PackageSettings;
  selectedServices?: SelectedService[];
  onAddService?: (service: Service) => void;
}

export const PackageSavingsDrawer = ({ 
  savings, 
  language,
  availableServices = [],
  packageSettings,
  selectedServices = [],
  onAddService
}: PackageSavingsDrawerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  
  if (savings <= 0) return null;
  
  const isRtl = language === 'ar';
  // Using up/down icons for vertical handle on right edge
  const TriggerIcon = isRtl ? ChevronUp : ChevronDown;

  // Filter out services already in the package
  const availableToAdd = availableServices.filter(service => 
    !selectedServices.some(s => s.id === service.id)
  );

  const getDiscountPercentage = (count: number): number => {
    if (!packageSettings) return 0;
    
    const totalAddOns = selectedServices.length + count - 1; // Subtract 1 for base service
    
    if (totalAddOns >= 3) {
      return packageSettings.discountTiers.threeOrMore;
    } else if (totalAddOns === 2) {
      return packageSettings.discountTiers.twoServices;
    } else if (totalAddOns === 1) {
      return packageSettings.discountTiers.oneService;
    }
    return 0;
  };

  const handleAddService = (service: Service) => {
    if (!onAddService) {
      toast({
        title: language === 'ar' ? 'عذراً' : 'Sorry',
        description: language === 'ar' 
          ? 'لا يمكن إضافة خدمات في هذه المرحلة'
          : 'Cannot add services at this stage',
        variant: "destructive"
      });
      return;
    }

    // Check if adding this service would exceed max services
    if (packageSettings?.maxServices && 
        selectedServices.length >= packageSettings.maxServices) {
      toast({
        title: language === 'ar' 
          ? 'تم الوصول إلى الحد الأقصى للخدمات' 
          : 'Maximum services limit reached',
        description: language === 'ar'
          ? `يمكنك إضافة ${packageSettings.maxServices} خدمات كحد أقصى`
          : `You can add a maximum of ${packageSettings.maxServices} services to your package`,
        variant: "destructive"
      });
      return;
    }

    onAddService(service);
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      {/* Compact vertical handle on the right edge - attached flush to the edge */}
      <SheetTrigger asChild>
        <motion.div
          className={`fixed z-50 right-0 top-24
          bg-gradient-to-l from-[#F2FCE2] to-[#E7F7D4] cursor-pointer
          py-2 px-1.5 shadow-md border-y border-l border-green-200 rounded-l-lg
          flex flex-col items-center gap-1`}
          whileHover={{ 
            scale: 1.03,
            x: -1
          }}
          whileTap={{ scale: 0.97 }}
          layout
        >
          <PartyPopper className="h-4 w-4 text-green-700" />
          <TriggerIcon className="h-2.5 w-2.5 text-green-700" />
        </motion.div>
      </SheetTrigger>
      
      {/* The drawer content with auto height and flush to the edge */}
      <SheetContent 
        side="right"
        className="bg-[#F8FFEE] border-l border-y border-green-200 p-0 rounded-l-xl mx-auto h-auto inset-auto top-24 bottom-auto right-0 shadow-xl"
      >
        <div className="p-3 space-y-3">
          <div className="bg-white rounded-lg p-2.5 shadow-inner">
            <div className="flex flex-col items-center space-y-0.5">
              <span className="text-2xs text-green-700">
                {isRtl ? 'المبلغ الذي وفرته' : 'You saved'}
              </span>
              <PriceDisplay 
                price={savings} 
                language={language} 
                size="lg"
                className="text-green-700 font-bold text-lg"
              />
              <span className="text-[10px] text-green-600 mt-0.5">
                {isRtl 
                  ? 'مقارنة بسعر الخدمات الفردية' 
                  : 'compared to individual prices'}
              </span>
            </div>
          </div>
          
          {availableToAdd.length > 0 && (
            <>
              <div className="text-xs text-green-700 font-medium text-center">
                {isRtl 
                  ? 'أضف المزيد من الخدمات لتوفير أكثر!'
                  : 'Add more services to save more!'}
              </div>
              
              <Separator className="bg-green-200" />
              
              <div className="max-h-[calc(100vh-350px)] overflow-y-auto space-y-2">
                {availableToAdd.slice(0, 5).map((service) => {
                  const serviceName = language === 'ar' ? service.name_ar : service.name_en;
                  const nextDiscount = getDiscountPercentage(1);
                  const discountedPrice = Math.floor(service.price * (1 - nextDiscount / 100));
                  
                  return (
                    <Card key={service.id} className="bg-white shadow-sm border-green-100">
                      <CardContent className="p-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="text-xs font-medium truncate">{serviceName}</h4>
                            {nextDiscount > 0 && (
                              <div className="flex items-center mt-1">
                                <PriceDisplay 
                                  price={discountedPrice} 
                                  originalPrice={service.price}
                                  showDiscount={true}
                                  language={language} 
                                  size="sm"
                                  className="text-xs"
                                />
                              </div>
                            )}
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => handleAddService(service)}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                
                {availableToAdd.length > 5 && (
                  <div className="text-2xs text-center text-green-700">
                    {isRtl 
                      ? `و ${availableToAdd.length - 5} خدمات أخرى متاحة...` 
                      : `And ${availableToAdd.length - 5} more services available...`}
                  </div>
                )}
              </div>
            </>
          )}
          
          {availableToAdd.length === 0 && (
            <div className="text-2xs text-green-700 text-center pb-1">
              <p>
                {isRtl 
                  ? 'لقد أضفت كل الخدمات المتاحة!'
                  : 'You have added all available services!'}
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
