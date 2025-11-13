
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "@/lib/motion";
import { MapPin, Star, Clock, Navigation, Phone } from "lucide-react";
import { Branch } from "@/types/branch";

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-white border-0 shadow-2xl p-0 overflow-hidden rounded-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="relative"
        >
          {/* Modern Header */}
          <div className="relative h-24 bg-gradient-to-br from-[#D6B35A] via-[#C79A2A] to-[#B39260] flex items-center justify-center overflow-hidden">
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
                className="mb-2"
              >
                <MapPin className="w-7 h-7 text-white drop-shadow-lg" />
              </motion.div>
              <h1 className="text-white text-xl font-bold drop-shadow-lg">
                {t('select.branch')}
              </h1>
            </motion.div>
          </div>

          {/* Content Section */}
          <div className="p-6">
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

            <Separator className="mb-6 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

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
                  whileHover={{ y: -2, scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Card
                    className="group cursor-pointer border-2 border-gray-100 hover:border-[#D6B35A] transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-white to-gray-50/30"
                    onClick={() => onBranchSelect(branch.id)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3 flex-1">
                          <motion.div
                            whileHover={{ rotate: 15, scale: 1.1 }}
                            className="w-10 h-10 rounded-full bg-[#D6B35A]/10 flex items-center justify-center group-hover:bg-[#D6B35A]/20 transition-colors flex-shrink-0 mt-0.5"
                          >
                            <MapPin className="w-5 h-5 text-[#D6B35A]" />
                          </motion.div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-bold text-lg text-gray-900 group-hover:text-[#D6B35A] transition-colors truncate">
                                {isRTL ? branch.name_ar : branch.name}
                              </h3>
                              {branch.is_main && (
                                <Badge variant="outline" className="bg-[#D6B35A]/10 text-[#D6B35A] border-[#D6B35A]/20 text-xs flex-shrink-0">
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
                          whileHover={{ x: 3 }}
                          className="flex-shrink-0 ml-3"
                        >
                          <div className="w-8 h-8 rounded-full bg-[#D6B35A]/10 flex items-center justify-center group-hover:bg-[#D6B35A]/20 transition-colors">
                            <motion.div
                              animate={{ x: [0, 3, 0] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                              className="text-[#D6B35A] text-sm font-bold"
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
      </DialogContent>
    </Dialog>
  );
};
