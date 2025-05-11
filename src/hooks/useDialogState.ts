
import { useState } from "react";
import { Branch } from "@/types/branch";

export const useDialogState = (branches: Branch[] | undefined) => {
  const [branchDialogOpen, setBranchDialogOpen] = useState(false);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const [eidBookingsDialogOpen, setEidBookingsDialogOpen] = useState(false);
  const [loyaltyDialogOpen, setLoyaltyDialogOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  const handleBranchSelect = (branchId: string) => {
    const selectedBranch = branches?.find(branch => branch.id === branchId);
    if (selectedBranch) {
      setSelectedBranch(selectedBranch);
      setBranchDialogOpen(false);

      // Navigate to booking page with the selected branch
      window.location.href = `/bookings?branch=${branchId}`;
    }
  };

  const handleEidBranchSelect = (branchId: string) => {
    const selectedBranch = branches?.find(branch => branch.id === branchId);
    if (selectedBranch) {
      setSelectedBranch(selectedBranch);
      setEidBookingsDialogOpen(false);

      // Open Fresha link for the selected branch or a default one
      const freshaUrl = selectedBranch.freshaUrl || 'https://www.fresha.com/ekka-barbershop-ekka-midtown-h3pcf2xe/booking';
      window.open(freshaUrl, '_blank');
    }
  };

  const handleLocationDialog = () => {
    if (branches && branches.length === 1) {
      setSelectedBranch(branches[0]);
      setMapDialogOpen(true);
    } else {
      setLocationDialogOpen(true);
    }
  };

  const handleLocationClick = (url: string | null) => {
    if (url) {
      window.open(url, '_blank');
    }
    setMapDialogOpen(false);
    setLocationDialogOpen(false);
  };

  return {
    branchDialogOpen,
    setBranchDialogOpen,
    locationDialogOpen,
    setLocationDialogOpen,
    eidBookingsDialogOpen,
    setEidBookingsDialogOpen,
    mapDialogOpen,
    setMapDialogOpen,
    loyaltyDialogOpen,
    setLoyaltyDialogOpen,
    selectedBranch,
    setSelectedBranch,
    handleBranchSelect,
    handleEidBranchSelect,
    handleLocationClick,
    handleLocationDialog
  };
};
