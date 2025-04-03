
import { BranchDialog } from "@/components/customer/BranchDialog";
import { LocationDialog } from "@/components/customer/LocationDialog";
import { EidBookingsDialog } from "@/components/customer/EidBookingsDialog";

interface CustomerModalsProps {
  branchDialogOpen: boolean;
  setBranchDialogOpen: (open: boolean) => void;
  locationDialogOpen: boolean;
  setLocationDialogOpen: (open: boolean) => void;
  eidBookingsDialogOpen: boolean;
  setEidBookingsDialogOpen: (open: boolean) => void;
  branches: any[] | undefined;
  onBranchSelect: (branchId: string) => void;
  onLocationClick: (url: string | null) => void;
  onEidBranchSelect: (branchId: string) => void;
}

export const CustomerModals = ({
  branchDialogOpen,
  setBranchDialogOpen,
  locationDialogOpen,
  setLocationDialogOpen,
  eidBookingsDialogOpen,
  setEidBookingsDialogOpen,
  branches,
  onBranchSelect,
  onLocationClick,
  onEidBranchSelect
}: CustomerModalsProps) => {
  return (
    <>
      <BranchDialog 
        open={branchDialogOpen} 
        onOpenChange={setBranchDialogOpen} 
        branches={branches} 
        onBranchSelect={onBranchSelect} 
      />
      <LocationDialog 
        open={locationDialogOpen} 
        onOpenChange={setLocationDialogOpen} 
        branches={branches} 
        onLocationClick={onLocationClick} 
      />
      <EidBookingsDialog 
        open={eidBookingsDialogOpen} 
        onOpenChange={setEidBookingsDialogOpen} 
        branches={branches} 
        onBranchSelect={onEidBranchSelect} 
      />
    </>
  );
};
