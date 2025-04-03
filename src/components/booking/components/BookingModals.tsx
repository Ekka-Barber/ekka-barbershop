
import { UpsellModal } from "@/components/booking/UpsellModal";
import { PackageBuilderDialog } from "../package-builder/PackageBuilderDialog";
import { PackageSettings } from "@/types/admin";
import { SelectedService, Service } from "@/types/service";

interface BookingModalsProps {
  showUpsellModal: boolean;
  showPackageBuilder: boolean;
  handleUpsellModalClose: () => void;
  handleUpsellConfirm: (selectedUpsells: any[]) => void;
  handlePackageBuilderClose: () => void;
  handlePackageBuilderConfirm: (packageServices: SelectedService[]) => void;
  availableUpsells: any[];
  packageSettings?: PackageSettings;
  baseService: Service | null | undefined;
  availablePackageServices: Service[];
  selectedServices: SelectedService[];
}

export const BookingModals = ({
  showUpsellModal,
  showPackageBuilder,
  handleUpsellModalClose,
  handleUpsellConfirm,
  handlePackageBuilderClose,
  handlePackageBuilderConfirm,
  availableUpsells,
  packageSettings,
  baseService,
  availablePackageServices,
  selectedServices
}: BookingModalsProps) => {
  return (
    <>
      <UpsellModal 
        isOpen={showUpsellModal} 
        onClose={handleUpsellModalClose} 
        onConfirm={handleUpsellConfirm} 
        availableUpsells={availableUpsells} 
      />
      
      <PackageBuilderDialog
        isOpen={showPackageBuilder}
        onClose={handlePackageBuilderClose}
        onConfirm={handlePackageBuilderConfirm}
        packageSettings={packageSettings}
        baseService={baseService || null}
        availableServices={availablePackageServices}
        currentlySelectedServices={selectedServices}
      />
    </>
  );
};
