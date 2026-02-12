import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { MapPin } from "lucide-react";

import { motion } from "@shared/lib/motion";
import { Branch } from "@shared/types/branch";
import { Button } from "@shared/ui/components/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@shared/ui/components/sheet";

import freshLogoWhite from "@/assets/fresh-logo-white.svg";
import { useLanguage } from "@/contexts/LanguageContext";


interface EidBookingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branches: Branch[] | undefined;
  onBranchSelect: (branchId: string) => void;
}

const EidBookingsDialog = ({
  open,
  onOpenChange,
  branches,
  onBranchSelect
}: EidBookingsDialogProps) => {
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="bg-gradient-to-br from-white/98 to-white/95 border-2 border-white/40 shadow-[0_40px_100px_-40px_rgba(0,0,0,0.5),0_20px_50px_-20px_rgba(232,198,111,0.25)] rounded-t-2xl sm:rounded-2xl overflow-hidden backdrop-blur-xl flex flex-col h-auto max-h-[90vh] pb-[calc(var(--sab)+1rem)] sm:max-w-2xl sm:mx-auto"
      >
        <VisuallyHidden>
          <SheetTitle>
            {isRTL ? 'احجز موعدك أونلاين' : 'Book Online'}
          </SheetTitle>
          <SheetDescription>
            {isRTL
              ? 'احجز موعدك أونلاين عبر منصة فريشا واختر الخدمات التي تناسبك في أي وقت وفي أي مكان.'
              : 'Book your appointment online through Fresha platform and choose services that suit you anytime, anywhere.'}
          </SheetDescription>
        </VisuallyHidden>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="relative flex h-full flex-col min-h-0 w-full"
        >
          <SheetHeader className="h-28 bg-gradient-to-r from-brand-gold-200 via-brand-gold-300 to-brand-gold-500 flex items-center justify-center relative overflow-hidden shadow-[0_10px_40px_-10px_rgba(232,198,111,0.5)] flex-shrink-0">
            <motion.div
              className="absolute inset-0 w-full h-full opacity-20"
              style={{
                backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23ffffff\' fill-opacity=\'1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
                backgroundPosition: '0% 0%'
              } as React.CSSProperties}
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
              className="z-10 flex flex-col items-center"
            >
              <img
                src={freshLogoWhite}
                alt="Fresha"
                width={140}
                height={30}
                className="mb-2 h-[30px] w-[140px] object-contain filter drop-shadow-md"
              />
              <h1 className="text-white text-2xl font-bold drop-shadow-[0_4px_12px_rgba(0,0,0,0.25)]">
                {isRTL ? 'احجز موعدك أونلاين' : 'Book Online'}
              </h1>
            </motion.div>
          </SheetHeader>

          {/* Content Wrapper */}
          <div className="flex-1 overflow-y-auto min-h-0 momentum-scroll custom-scrollbar touch-action-pan-y p-4 sm:p-6" style={{ WebkitOverflowScrolling: 'touch' }}>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 xs:grid-cols-2 gap-3"
            >
              {branches?.map((branch) => (
                <motion.div
                  key={branch.id}
                  variants={branchVariants}
                  className="rounded-2xl relative"
                  whileHover={{ scale: 1.04, y: -4, boxShadow: "0 25px 50px -12px rgba(232,198,111,0.35), 0 15px 30px -10px rgba(214,179,90,0.25)" }}
                  whileTap={{ scale: 0.98, y: 0 }}
                >
                  <Button
                    variant="outline"
                    className="w-full h-full min-h-[140px] flex flex-col items-center justify-center gap-3 px-4 py-4 bg-gradient-to-br from-white/95 to-white/85 hover:from-white/98 hover:to-white/90 hover:bg-brand-gold-200/10 border-2 border-white/60 hover:border-brand-gold-300/40 transition-all duration-300 rounded-2xl group shadow-[0_15px_35px_-10px_rgba(0,0,0,0.12),0_5px_15px_-5px_rgba(214,179,90,0.15)] backdrop-blur-sm"
                    onClick={() => {
                      onBranchSelect(branch.id);
                    }}
                    aria-label={`Select ${isRTL ? branch.name_ar : branch.name} branch`}
                  >
                    <div className={`flex-1 flex flex-col items-center text-center`}>
                      <div className="flex-shrink-0 bg-gradient-to-br from-brand-gold-200/20 to-brand-gold-500/10 p-3 rounded-full mb-2 shadow-[0_4px_12px_-4px_rgba(232,198,111,0.2)]">
                        <MapPin className="w-5 h-5 text-brand-gold-400 drop-shadow-[0_2px_4px_rgba(232,198,111,0.2)]" />
                      </div>
                      <div className="flex flex-col min-w-0 gap-1">
                        <span className="font-bold text-lg text-brand-gray-900 group-hover:text-brand-gold-400 transition-colors truncate drop-shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
                          {isRTL ? branch.name_ar : branch.name}
                        </span>
                        <span className="text-sm text-brand-gray-500 group-hover:text-brand-gold-300 transition-colors truncate max-w-full">
                          {isRTL ? branch.address_ar : branch.address}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 text-sm text-brand-gold-400 font-medium flex items-center gap-1">
                      {isRTL ? 'انقر للحجز أونلاين' : 'Click to book online'}
                      <span className="transform transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
                        {isRTL ? '←' : '→'}
                      </span>
                    </div>
                  </Button>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-gradient-to-b from-white/50 to-brand-gold-50/60 border-t border-white/60 text-center backdrop-blur-sm flex-shrink-0">
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
      </SheetContent>
    </Sheet>
  );
};

export default EidBookingsDialog;
