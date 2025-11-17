import { useState } from 'react';
import { trackButtonClick, trackLocationView } from "@/utils/tiktokTracking";
import { Branch } from "@/types/branch";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/use-toast";

export const useDialogState = (branches: Branch[] | undefined) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [branchDialogOpen, setBranchDialogOpen] = useState(false);
  const [bookingsDialogOpen, setBookingsDialogOpen] = useState(false);
  const [eidBookingsDialogOpen, setEidBookingsDialogOpen] = useState(false);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  
  const handleBranchSelect = (branchId: string) => {
    trackButtonClick({
      buttonId: 'book_now',
      buttonName: 'Book Now'
    });
    setBranchDialogOpen(false);

    if (branches) {
      const selectedBranch = branches.find(branch => branch.id === branchId);

      if (selectedBranch) {
        // Use branch IDs instead of hard-coded names for better maintainability
        if (selectedBranch.id === "4b11ca76-a282-4a14-947b-0fad49239d3b") {
          // Ash-Sharai branch
          const url = language === 'ar'
            ? "https://www.fresha.com/ar/book-now/ekka-gspkudll/all-offer?id=1532757&share&pId=881059"
            : "https://www.fresha.com/book-now/ekka-gspkudll/all-offer?id=1532757&share&pId=881059";
          window.open(url, '_blank');
          return;
        } else if (selectedBranch.id === "bc505e80-db4f-4617-b81e-4593a53a219d") {
          // Al-Waslyia branch
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

  const handleBranchSelectForBookings = (branchId: string) => {
    trackButtonClick({
      buttonId: 'bookings',
      buttonName: 'Bookings'
    });
    setBookingsDialogOpen(false);
    
    if (branches) {
      const selectedBranch = branches.find(branch => branch.id === branchId);

      if (selectedBranch) {
        // Use branch IDs instead of hard-coded names for better maintainability
        if (selectedBranch.id === "4b11ca76-a282-4a14-947b-0fad49239d3b") {
          // Ash-Sharai branch
          const url = language === 'ar'
            ? "https://www.fresha.com/ar/book-now/ekka-gspkudll/all-offer?id=1532757&share&pId=881059"
            : "https://www.fresha.com/book-now/ekka-gspkudll/all-offer?id=1532757&share&pId=881059";
          window.open(url, '_blank');
          return;
        } else if (selectedBranch.id === "bc505e80-db4f-4617-b81e-4593a53a219d") {
          // Al-Waslyia branch
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

  const handleEidBranchSelect = (branchId: string) => {
    trackButtonClick({
      buttonId: 'eid_bookings',
      buttonName: 'Eid Bookings'
    });
    setEidBookingsDialogOpen(false);
    
    if (branches) {
      const selectedBranch = branches.find(branch => branch.id === branchId);

      if (selectedBranch) {
        // Use branch IDs instead of hard-coded names for better maintainability
        if (selectedBranch.id === "4b11ca76-a282-4a14-947b-0fad49239d3b") {
          // Ash-Sharai branch
          const url = language === 'ar'
            ? "https://www.fresha.com/ar/book-now/ekka-gspkudll/all-offer?id=1532757&share&pId=881059"
            : "https://www.fresha.com/book-now/ekka-gspkudll/all-offer?id=1532757&share&pId=881059";
          window.open(url, '_blank');
          return;
        } else if (selectedBranch.id === "bc505e80-db4f-4617-b81e-4593a53a219d") {
          // Al-Waslyia branch
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
    bookingsDialogOpen,
    setBookingsDialogOpen,
    eidBookingsDialogOpen,
    setEidBookingsDialogOpen,
    locationDialogOpen,
    setLocationDialogOpen,
    handleBranchSelect,
    handleBranchSelectForBookings,
    handleEidBranchSelect,
    handleLocationClick,
    handleLocationDialog
  };
};
