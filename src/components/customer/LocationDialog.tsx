import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "@/lib/motion";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
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
      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-xl bg-gradient-to-br from-white/98 to-white/95 border-2 border-white/40 shadow-[0_40px_100px_-40px_rgba(0,0,0,0.5),0_20px_50px_-20px_rgba(74,74,74,0.2)] p-0 overflow-hidden rounded-2xl backdrop-blur-xl max-h-[90vh] overflow-y-auto" showCloseButton={false}>
        <VisuallyHidden>
          <DialogTitle>
            {isRTL ? 'فروعنا' : 'Our Branches'}
          </DialogTitle>
          <DialogDescription>
            {isRTL
              ? 'انقر على أي فرع للانتقال مباشرة إلى خرائط جوجل'
              : 'Click on any branch to navigate directly to Google Maps'}
          </DialogDescription>
        </VisuallyHidden>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="relative w-full"
        >
          {/* Decorative top banner */}
          <div className="h-24 bg-gradient-to-r from-[#5a5a5a] via-[#4a4a4a] to-[#3a3a3a] flex items-center justify-center relative overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,0,0,0.4)]">
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
              <MapPin className="text-white w-11 h-11 mb-3 mx-auto drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)]" />
              <h1 className="text-white text-2xl font-bold drop-shadow-[0_4px_12px_rgba(0,0,0,0.25)]">
                {isRTL ? 'فروعنا' : 'Our Branches'}
              </h1>
            </motion.div>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 xs:grid-cols-2 gap-3 p-4 sm:p-6"
          >
            {branches?.map((branch) => (
              <motion.div
                key={branch.id}
                variants={branchVariants}
                className="rounded-2xl relative"
                whileHover={{ scale: 1.04, y: -4, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25), 0 15px 30px -10px rgba(90,90,90,0.15)" }}
                whileTap={{ scale: 0.98, y: 0 }}
              >
                <Button
                  variant="outline"
                  className="w-full h-full flex flex-col items-center justify-center gap-2 px-4 py-4 bg-gradient-to-br from-white/95 to-white/85 hover:from-white/98 hover:to-white/90 border-2 border-white/60 hover:border-[#5a5a5a]/40 transition-all duration-300 rounded-2xl group shadow-[0_15px_35px_-10px_rgba(0,0,0,0.12),0_5px_15px_-5px_rgba(90,90,90,0.1)] backdrop-blur-sm"
                  onClick={() => onLocationClick(branch.google_maps_url)}
                >
                  <div className={`flex-1 flex flex-col items-center text-center`}>
                    <div className="flex-shrink-0 bg-gradient-to-br from-[#5a5a5a]/20 to-[#4a4a4a]/10 p-2.5 rounded-full mb-2 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.2)]">
                      <Building className="w-5 h-5 text-[#4a4a4a] drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-base text-[#1a1a1a] group-hover:text-[#4a4a4a] transition-colors truncate drop-shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
                        {isRTL ? branch.name_ar : branch.name}
                      </span>
                      <span className="text-xs text-[#5a5a5a] group-hover:text-[#4a4a4a] transition-colors truncate max-w-full mt-0.5">
                        {isRTL ? branch.address_ar : branch.address}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2">
                    <div className="bg-gradient-to-br from-[#5a5a5a] to-[#4a4a4a] text-white p-2 rounded-full transform transition-all group-hover:scale-115 group-hover:from-[#4a4a4a] group-hover:to-[#3a3a3a] shadow-[0_4px_12px_-4px_rgba(0,0,0,0.3)]">
                      <ExternalLink className="w-3.5 h-3.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]" />
                    </div>
                  </div>
                </Button>
              </motion.div>
            ))}
          </motion.div>

          <div className="p-4 bg-gradient-to-b from-white/50 to-gray-50/80 border-t border-white/60 text-center backdrop-blur-sm">
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
