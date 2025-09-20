import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { MapPin, ExternalLink, Building } from "lucide-react";
import { Branch } from "@/types/branch";

interface LocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branches: Branch[] | undefined;
  onLocationClick: (url: string | null) => void;
}

export const LocationDialog = ({
  open,
  onOpenChange,
  branches,
  onLocationClick
}: LocationDialogProps) => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

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
      <DialogContent className="sm:max-w-xl bg-white border-0 shadow-2xl p-0 overflow-hidden rounded-xl" showCloseButton={false}>
        <DialogTitle className="sr-only">
          {isRTL ? 'فروعنا' : 'Our Branches'}
        </DialogTitle>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="relative w-full"
        >
          {/* Decorative top banner */}
          <div className="h-20 bg-gradient-to-r from-[#6c6c6c] to-[#4c4c4c] flex items-center justify-center relative overflow-hidden">
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
              <MapPin className="text-white w-10 h-10 mb-2 mx-auto" />
              <h1 className="text-white text-xl font-bold">
                {isRTL ? 'فروعنا' : 'Our Branches'}
              </h1>
            </motion.div>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible" 
            className="grid grid-cols-2 gap-3 p-6"
          >
            {branches?.map((branch) => (
              <motion.div
                key={branch.id}
                variants={branchVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative"
              >
                <Button
                  variant="outline"
                  className="w-full h-full flex flex-col items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-gray-100 border border-gray-200 hover:border-gray-400 transition-all duration-300 rounded-lg group shadow-sm"
                  onClick={() => onLocationClick(branch.google_maps_url)}
                >
                  <div className={`flex-1 flex flex-col items-center text-center`}>
                    <div className="flex-shrink-0 bg-[#4c4c4c]/10 p-2 rounded-full mb-2">
                      <Building className="w-5 h-5 text-[#4c4c4c]" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-base text-gray-800 group-hover:text-[#4c4c4c] transition-colors truncate">
                        {isRTL ? branch.name_ar : branch.name}
                      </span>
                      <span className="text-xs text-gray-500 group-hover:text-[#4c4c4c]/70 transition-colors truncate max-w-full">
                        {isRTL ? branch.address_ar : branch.address}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2">
                    <div className="bg-[#4c4c4c] text-white p-1.5 rounded-full transform transition-transform group-hover:scale-110 group-hover:bg-[#3a3a3a]">
                      <ExternalLink className="w-3 h-3" />
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
                ? 'انقر على أي فرع للانتقال مباشرة إلى خرائط جوجل'
                : 'Click on any branch to navigate directly to Google Maps'}
            </motion.p>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
