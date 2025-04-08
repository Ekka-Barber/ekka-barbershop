import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { Calendar, MapPin } from "lucide-react";

interface Branch {
  id: string;
  name: string;
  name_ar: string;
  address: string;
  address_ar: string;
  working_hours?: string | Record<string, string>;
}

interface EidBookingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branches: Branch[] | undefined;
  onBranchSelect: (branchId: string) => void;
}

export const EidBookingsDialog = ({ 
  open, 
  onOpenChange, 
  branches,
  onBranchSelect 
}: EidBookingsDialogProps) => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  
  // Enhanced logging without sensitive data
  console.log("Number of branches in EidBookingsDialog:", branches?.length || 0);

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } }
  };

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
      <DialogContent className="sm:max-w-xl bg-white border-0 shadow-2xl p-0 overflow-hidden rounded-xl">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="relative w-full"
        >
          {/* Decorative top banner */}
          <div className="h-20 bg-gradient-to-r from-[#9490fa] to-[#756af8] flex items-center justify-center relative overflow-hidden">
            <motion.div 
              className="absolute inset-0 w-full h-full opacity-20"
              initial={{ backgroundPosition: '0% 0%' }}
              animate={{ backgroundPosition: '100% 100%' }}
              transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
              style={{ 
                backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23ffffff\' fill-opacity=\'1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")' 
              }}
            />
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
              className="absolute w-20 h-20 rounded-full bg-white/10 -top-10 -left-10"
            />
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2, type: "spring", stiffness: 200 }}
              className="absolute w-12 h-12 rounded-full bg-white/10 -bottom-5 -right-5"
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="z-10"
            >
              <Calendar className="text-white w-10 h-10 mb-2 mx-auto" />
              <h1 className="text-white text-xl font-bold">
                {isRTL ? 'احجز موعدك أونلاين' : 'Book Online'}
              </h1>
            </motion.div>
          </div>

          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="text-center text-xl font-bold text-[#222222] mb-4">
              {isRTL ? 'اختر الفرع' : 'Select Branch'}
            </DialogTitle>
            <p className="text-center text-gray-600 text-sm max-w-md mx-auto">
              {isRTL 
                ? 'احجز موعدك أونلاين عبر منصة فريشا واختر الخدمات التي تناسبك في أي وقت وفي أي مكان.'
                : 'Book your appointment online through Fresha platform and choose services that suit you anytime, anywhere.'}
            </p>
          </DialogHeader>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible" 
            className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-6"
          >
            {branches?.map((branch) => (
              <motion.div
                key={branch.id}
                variants={branchVariants}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="relative"
              >
                <Button
                  variant="outline"
                  className="w-full min-h-[110px] flex flex-col items-start justify-between gap-3 px-4 py-4 bg-white hover:bg-[#756af8]/5 border-2 border-gray-200 hover:border-[#756af8] transition-all duration-300 rounded-lg group"
                  onClick={() => {
                    console.log("Selected branch ID:", branch.id);
                    onBranchSelect(branch.id);
                  }}
                  aria-label={`Select ${isRTL ? branch.name_ar : branch.name} branch`}
                >
                  <div className={`flex flex-col items-${isRTL ? 'end' : 'start'} flex-shrink min-w-0 w-full`}>
                    <div className="w-full flex items-center mb-2">
                      <MapPin className={`w-4 h-4 text-[#756af8] ${isRTL ? 'ml-1.5' : 'mr-1.5'}`} />
                      <span className="font-bold text-base text-[#222222] group-hover:text-[#756af8] transition-colors truncate">
                        {isRTL ? branch.name_ar : branch.name}
                      </span>
                    </div>
                    <span className="w-full text-sm text-gray-600 group-hover:text-[#756af8]/70 transition-colors truncate flex items-center">
                      <MapPin className={`w-3 h-3 ${isRTL ? 'ml-1.5' : 'mr-1.5'} text-gray-400`} />
                      {isRTL ? branch.address_ar : branch.address}
                    </span>
                    <div className="text-xs mt-2 text-[#756af8]">
                      {isRTL ? 'انقر للحجز أونلاين' : 'Click to book online'}
                    </div>
                  </div>
                </Button>
              </motion.div>
            ))}
          </motion.div>
          
          <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
            <motion.p 
              className="text-xs text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {isRTL 
                ? 'احجز موعدك الآن لتجنب الانتظار ولاختصار الوقت' 
                : 'Book your appointment now to avoid waiting and save time'}
            </motion.p>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
