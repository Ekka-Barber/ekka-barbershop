import { useState } from 'react';

import { Branch } from "@shared/types/branch";
import { useToast } from "@shared/ui/components/use-toast";
import { trackBookingClick, trackLocationClick } from "@shared/utils/gadsTracking";
import { trackButtonClick, trackLocationView } from "@shared/utils/tiktokTracking";

import { useLanguage } from "@/contexts/LanguageContext";


export const useDialogState = (branches: Branch[] | undefined) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [branchDialogOpen, setBranchDialogOpen] = useState(false);
  const [bookingsDialogOpen, setBookingsDialogOpen] = useState(false);
  const [eidBookingsDialogOpen, setEidBookingsDialogOpen] = useState(false);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);

  const getFreshaUrl = (baseUrl: string | null): string | null => {
    if (!baseUrl) return null;
    if (language === 'ar') {
      return baseUrl.replace('https://www.fresha.com/', 'https://www.fresha.com/ar/');
    }
    return baseUrl;
  };

  const openBookingUrl = (branch: Branch) => {
    const url = getFreshaUrl(branch.fresha_booking_url);
    if (url) {
      window.open(url, '_blank');
      return true;
    }
    return false;
  };

  const showBookingErrorToast = () => {
    toast({
      title: language === 'ar' ? 'خطأ' : 'Error',
      description: language === 'ar'
        ? 'لم نتمكن من العثور على رابط الحجز لهذا الفرع'
        : 'Could not find booking link for this branch',
      variant: "destructive"
    });
  };

  const handleBranchSelect = (branchId: string) => {
    trackButtonClick({
      buttonId: 'book_now',
      buttonName: 'Book Now'
    });
    setBranchDialogOpen(false);

    const selectedBranch = branches?.find(branch => branch.id === branchId);

    if (selectedBranch) {
      trackBookingClick(selectedBranch.name);
      if (openBookingUrl(selectedBranch)) {
        return;
      }
    }

    showBookingErrorToast();
  };

  const handleBranchSelectForBookings = (branchId: string) => {
    trackButtonClick({
      buttonId: 'bookings',
      buttonName: 'Bookings'
    });
    setBookingsDialogOpen(false);

    const selectedBranch = branches?.find(branch => branch.id === branchId);

    if (selectedBranch) {
      trackBookingClick(selectedBranch.name);
      if (openBookingUrl(selectedBranch)) {
        return;
      }
    }

    showBookingErrorToast();
  };

  const handleEidBranchSelect = (branchId: string) => {
    trackButtonClick({
      buttonId: 'eid_bookings',
      buttonName: 'Eid Bookings'
    });
    setEidBookingsDialogOpen(false);

    const selectedBranch = branches?.find(branch => branch.id === branchId);

    if (selectedBranch) {
      trackBookingClick(selectedBranch.name);
      if (openBookingUrl(selectedBranch)) {
        return;
      }
    }

    showBookingErrorToast();
  };

  const handleLocationClick = (url: string | null, branchName?: string) => {
    if (url) {
      trackLocationClick(branchName ?? 'unknown');
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
