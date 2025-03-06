
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, ChevronUp, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatPriceArabic } from '@/utils/formatters';

interface PackageSavingsDrawerProps {
  savings: number;
  packageEnabled?: boolean;
  hasBaseService?: boolean;
  packageSettings?: any;
  availableServices?: any[];
  onAddService?: (service: any) => void;
}

export const PackageSavingsDrawer = ({
  savings = 0,
  packageEnabled = false,
  hasBaseService = false,
  packageSettings,
  availableServices = [],
  onAddService
}: PackageSavingsDrawerProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { language } = useLanguage();
  const isRtl = language === 'ar';
  
  // Don't render if package system isn't enabled or base service is not selected
  if (!packageEnabled || !hasBaseService) return null;
  
  // Different states: 
  // 1. Has savings already (show savings)
  // 2. No savings yet (only base service selected - show encouragement)
  const hasPackageDiscounts = savings > 0;
  const showAddMoreMessage = savings === 0;
  
  const toggleDrawer = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="sticky bottom-16 z-30 w-full bg-gradient-to-b from-transparent to-white pointer-events-none">
      <div className="container mx-auto px-4 pointer-events-auto">
        <motion.div
          className="bg-green-50 border border-green-200 rounded-md overflow-hidden"
          animate={{ height: isExpanded ? 'auto' : '48px' }}
          transition={{ duration: 0.3 }}
        >
          {/* Header - Always visible */}
          <div 
            className="p-3 flex justify-between items-center cursor-pointer"
            onClick={toggleDrawer}
          >
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-green-600" />
              <span className="font-medium text-sm text-green-700">
                {hasPackageDiscounts ? (
                  isRtl 
                    ? `وفرت ${formatPriceArabic(savings)} ريال مع الباقة!` 
                    : `You saved SAR ${savings} with package!`
                ) : (
                  isRtl 
                    ? 'أضف خدمات للحصول على الخصم!' 
                    : 'Add services to get discounts!'
                )}
              </span>
            </div>
            <div>
              {isExpanded ? (
                <ChevronDown className="w-5 h-5 text-green-600" />
              ) : (
                <ChevronUp className="w-5 h-5 text-green-600" />
              )}
            </div>
          </div>
          
          {/* Content - Only visible when expanded */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-3 pt-0 text-sm"
              >
                {/* Encouragement when no savings yet */}
                {showAddMoreMessage && (
                  <div className="text-center mb-3">
                    <span className="text-sm text-green-700">
                      {isRtl 
                        ? 'أضف خدمات للحصول على خصومات الباقة!'
                        : 'Add services to get package discounts!'}
                    </span>
                  </div>
                )}
                
                {/* Available services to add */}
                {availableServices && availableServices.length > 0 && (
                  <div className="space-y-2">
                    {/* Title */}
                    <div className="text-xs text-gray-500 mb-1">
                      {isRtl
                        ? 'خدمات متاحة للإضافة:'
                        : 'Available services to add:'}
                    </div>
                    
                    {/* Service list */}
                    <div className="grid grid-cols-1 gap-2">
                      {availableServices.map((service) => (
                        <div 
                          key={service.id}
                          className="flex justify-between items-center bg-white p-2 rounded-md border border-green-100"
                        >
                          <span>{isRtl ? service.name_ar : service.name_en}</span>
                          <button
                            onClick={() => onAddService?.(service)}
                            className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                          >
                            {isRtl ? 'أضف' : 'Add'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};
