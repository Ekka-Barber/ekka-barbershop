
import { useEffect, useState } from 'react';
import { usePWAInstall } from 'react-use-pwa-install';
import { useLanguage } from "@/contexts/LanguageContext";
import { trackButtonClick } from "@/utils/tiktokTracking";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

export const InstallAppPrompt = () => {
  const { t } = useLanguage();
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const install = usePWAInstall();
  const [isHovered, setIsHovered] = useState(false);

  const handleInstallClick = async () => {
    trackButtonClick({
      buttonId: 'install_app',
      buttonName: 'Install App'
    });
    setShowInstallGuide(true);
  };

  const handleInstallConfirm = async () => {
    if (install) {
      try {
        await install();
        setShowInstallGuide(false);
      } catch (error) {
        console.error('Installation failed:', error);
      }
    }
  };

  // If already installed or not available, don't show the prompt
  if (!install) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
        className="w-full px-4 py-3 fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent z-50"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.75rem)' }}
      >
        <AlertDialog open={showInstallGuide} onOpenChange={setShowInstallGuide}>
          <AlertDialogTrigger asChild>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onHoverStart={() => setIsHovered(true)}
              onHoverEnd={() => setIsHovered(false)}
            >
              <Button
                className="w-full h-14 text-lg font-medium bg-white hover:bg-gray-50 text-gray-800 
                          transition-all duration-300 shadow-lg hover:shadow-xl border border-gray-200 
                          relative overflow-hidden touch-target"
                onClick={handleInstallClick}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-[#C4A484]/20 to-transparent"
                  initial={false}
                  animate={{
                    opacity: isHovered ? 1 : 0,
                    scale: isHovered ? 1.05 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                />
                <span className="relative z-10">{t('install.app')}</span>
              </Button>
            </motion.div>
          </AlertDialogTrigger>
          <AlertDialogContent className="sm:max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl">{t('install.guide.title')}</AlertDialogTitle>
              <AlertDialogDescription className="text-base leading-6">
                {t('install.guide.description')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="text-gray-500">{t('cancel')}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleInstallConfirm}
                className="bg-[#C4A484] hover:bg-[#B8997C] text-white"
              >
                {t('install')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.div>
    </AnimatePresence>
  );
};
