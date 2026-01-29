
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { MapPin, Star, Clock, Navigation, Phone } from "lucide-react";

import { motion } from "@shared/lib/motion";
import { Branch } from "@shared/types/branch";
import { Badge } from "@shared/ui/components/badge";
import { Card, CardContent } from "@shared/ui/components/card";
import { Separator } from "@shared/ui/components/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@shared/ui/components/sheet";

import { useLanguage } from "@/contexts/LanguageContext";

interface BranchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branches: Branch[] | undefined;
  onBranchSelect: (branchId: string) => void;
}

export const BranchDialog = ({
  open,
  onOpenChange,
  branches,
  onBranchSelect
}: BranchDialogProps) => {
  const { language, t } = useLanguage();
  const isRTL = language === 'ar';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const branchVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="bg-gradient-to-br from-white/98 to-white/95 border-2 border-white/40 shadow-[0_40px_100px_-40px_rgba(0,0,0,0.5),0_20px_50px_-20px_rgba(232,198,111,0.2)] rounded-t-2xl sm:rounded-2xl overflow-hidden backdrop-blur-xl flex flex-col h-[90vh] pb-[calc(var(--sab)+1rem)] sm:max-w-2xl sm:mx-auto"
      >
        <VisuallyHidden>
          <SheetTitle>
            {t('select.branch')}
          </SheetTitle>
          <SheetDescription>
            {isRTL
              ? 'اختر الفرع الأقرب إليك للحصول على أفضل خدمة'
              : 'Choose the branch closest to you for the best service experience'}
          </SheetDescription>
        </VisuallyHidden>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="relative flex h-full flex-col min-h-0"
        >
          <SheetHeader className="relative h-28 bg-gradient-to-br from-brand-gold-200 via-brand-gold-300 to-brand-gold-500 flex items-center justify-center overflow-hidden shadow-[0_10px_40px_-10px_rgba(232,198,111,0.4)] flex-shrink-0">
            <motion.div
              className="absolute inset-0 opacity-10"
              animate={{
                backgroundPosition: ["0% 0%", "100% 100%"],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.2) 25%, transparent 25%), linear-gradient(-45deg, rgba(255,255,255,0.2) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.2) 75%), linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.2) 75%)',
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
              }}
            />

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative z-10 flex flex-col items-center text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mb-3"
              >
                <MapPin className="w-8 h-8 text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)]" />
              </motion.div>
              <h1 className="text-white text-2xl font-bold drop-shadow-[0_4px_12px_rgba(0,0,0,0.25)]">
                {t('select.branch')}
              </h1>
            </motion.div>
          </SheetHeader>

          {/* Content Section */}
          <div className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-6 momentum-scroll custom-scrollbar touch-action-pan-y" style={{ WebkitOverflowScrolling: 'touch' }}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-center mb-6"
            >
              <p className="text-gray-600 text-sm leading-relaxed">
                {isRTL
                  ? 'اختر الفرع الأقرب إليك للحصول على أفضل خدمة'
                  : 'Choose the branch closest to you for the best service experience'}
              </p>
            </motion.div>

            <Separator className="mb-6 bg-gradient-to-r from-transparent via-brand-gold-200/30 to-transparent h-[2px] shadow-[0_0_15px_rgba(232,198,111,0.2)]" />

            {/* Enhanced Branch Grid */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 gap-4"
            >
              {branches?.map((branch) => (
                <motion.div
                  key={branch.id}
                  variants={branchVariants}
                  className="rounded-2xl"
                  whileHover={{ y: -4, scale: 1.02, boxShadow: "0 25px 50px -12px rgba(232,198,111,0.35), 0 15px 30px -10px rgba(214,179,90,0.25)" }}
                  whileTap={{ scale: 0.99, y: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <Card
                    className="group cursor-pointer border-2 border-white/60 hover:border-brand-gold-200/50 transition-all duration-300 shadow-[0_15px_35px_-10px_rgba(0,0,0,0.1),0_5px_15px_-5px_rgba(232,198,111,0.1)] bg-gradient-to-br from-white/95 to-white/85 backdrop-blur-sm rounded-2xl"
                    onClick={() => onBranchSelect(branch.id)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3 flex-1">
                          <motion.div
                            whileHover={{ rotate: 15, scale: 1.15 }}
                            className="w-11 h-11 rounded-full bg-gradient-to-br from-brand-gold-200/20 to-brand-gold-300/10 flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-brand-gold-200/30 group-hover:to-brand-gold-300/20 transition-all flex-shrink-0 mt-0.5 shadow-[0_4px_12px_-4px_rgba(232,198,111,0.3)]"
                          >
                            <MapPin className="w-5 h-5 text-brand-gold-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]" />
                          </motion.div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-bold text-lg text-brand-gray-900 group-hover:text-brand-gold-400 transition-colors truncate drop-shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
                                {isRTL ? branch.name_ar : branch.name}
                              </h3>
                              {branch.is_main && (
                                <Badge variant="outline" className="bg-gradient-to-r from-brand-gold-200/20 to-brand-gold-300/10 text-brand-gold-400 border-brand-gold-200/30 text-xs flex-shrink-0 shadow-[0_2px_8px_-2px_rgba(232,198,111,0.3)]">
                                  <Star className="w-3 h-3 mr-1 fill-current" />
                                  {isRTL ? 'رئيسي' : 'Main'}
                                </Badge>
                              )}
                            </div>

                            <p className="text-sm text-gray-600 leading-relaxed mb-3 line-clamp-2">
                              {isRTL ? branch.address_ar : branch.address}
                            </p>

                            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{isRTL ? 'مفتوح الآن' : 'Open Now'}</span>
                              </div>

                              {branch.whatsapp_number && (
                                <div className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  <span>WhatsApp</span>
                                </div>
                              )}

                              {branch.google_maps_url && (
                                <div className="flex items-center gap-1">
                                  <Navigation className="w-3 h-3" />
                                  <span>{isRTL ? 'خرائط' : 'Maps'}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <motion.div
                          whileHover={{ x: 4, scale: 1.1 }}
                          className="flex-shrink-0 ml-3"
                        >
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-gold-200/20 to-brand-gold-300/10 flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-brand-gold-200/30 group-hover:to-brand-gold-300/20 transition-all shadow-[0_4px_12px_-4px_rgba(232,198,111,0.3)]">
                            <motion.div
                              animate={{ x: [0, 4, 0] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                              className="text-brand-gold-400 text-base font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]"
                            >
                              →
                            </motion.div>
                          </div>
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-6 text-center"
            >
              <p className="text-xs text-gray-500">
                {isRTL
                  ? 'جميع الفروع مجهزة بأحدث المعدات والخدمات'
                  : 'All branches are equipped with the latest equipment and services'}
              </p>
            </motion.div>
          </div>
        </motion.div>
      </SheetContent>
    </Sheet>
  );
};
