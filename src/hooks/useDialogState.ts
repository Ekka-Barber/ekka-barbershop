import { useState } from 'react';
import { trackButtonClick, trackLocationView } from "@/utils/tiktokTracking";
import { useNavigate } from 'react-router-dom';
import type { Branch } from "@/types/branch";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/use-toast";

export const useDialogState = (branches: Branch[] | undefined) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { toast } = useToast();
  const [branchDialogOpen, setBranchDialogOpen] = useState(false);
  const [eidBookingsDialogOpen, setEidBookingsDialogOpen] = useState(false);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  
  const handleBranchSelect = (branchId: string) => {
    trackButtonClick({
      buttonId: 'book_now',
      buttonName: 'Book Now'
    });
    setBranchDialogOpen(false);
    navigate(`/bookings?branch=${branchId}`);
  };

  const handleEidBranchSelect = (branchId: string) => {
    trackButtonClick({
      buttonId: 'eid_bookings',
      buttonName: 'Eid Bookings'
    });
    setEidBookingsDialogOpen(false);
    
    if (branches) {
      const selectedBranch = branches.find(branch => branch.id === branchId);
      
      if (selectedBranch) {
        if (selectedBranch.name === "Ash-Sharai" || selectedBranch.name_ar === "الشرائع") {
          const url = language === 'ar' 
            ? "https://www.fresha.com/ar/book-now/ekka-gspkudll/all-offer?id=1532757&share&pId=881059"
            : "https://www.fresha.com/book-now/ekka-gspkudll/all-offer?id=1532757&share&pId=881059";
          window.open(url, '_blank');
          return;
        } else if (selectedBranch.name === "Al-Waslyia" || selectedBranch.name_ar === "الوصلية") {
          const url = language === 'ar' 
            ? "https://www.fresha.com/ar/book-now/ekka-gspkudll/all-offer?id=935949&share&pId=881059"
            : "https://www.fresha.com/book-now/ekka-gspkudll/all-offer?id=935949&share&pId=881059";
          window.open(url, '_blank');
          return;
        }
      }
    }
    
    toast({
      title: language === 'ar' ? 'خطأ' : 'Error',
      description: language === 'ar' 
        ? 'لم نتمكن من العثور على رابط الحجز لهذا الفرع' 
        : 'Could not find booking link for this branch',
      variant: "destructive"
    });
  };

  const handleLocationClick = (url: string | null) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  const handleLocationDialog = () => {
    setLocationDialogOpen(true);
    if (branches?.[0]) {
      trackLocationView({
        id: branches[0].id,
        name_en: branches[0].name,
        value: undefined
      });
    }
  };

  return {
    branchDialogOpen, 
    setBranchDialogOpen,
    eidBookingsDialogOpen, 
    setEidBookingsDialogOpen,
    locationDialogOpen, 
    setLocationDialogOpen,
    mapDialogOpen, 
    setMapDialogOpen,
    selectedBranch,
    setSelectedBranch,
    handleBranchSelect,
    handleEidBranchSelect,
    handleLocationClick,
    handleLocationDialog
  };
};
