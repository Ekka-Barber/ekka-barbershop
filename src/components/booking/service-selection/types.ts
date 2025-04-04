
import { SelectedService, Service, Category } from "@/types/service";
import { PackageSettings } from "@/types/admin";

export interface SelectionState {
  activeCategory: string | null;
  setActiveCategory: React.Dispatch<React.SetStateAction<string | null>>;
  sortedCategories: Category[] | undefined;
  activeCategoryServices: Service[] | undefined;
  selectedService: Service | null;
  isSheetOpen: boolean;
  setIsSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleServiceClick: (service: Service) => void;
  showPackageInfo: boolean;
  setShowPackageInfo: React.Dispatch<React.SetStateAction<boolean>>;
  showPackageBuilder: boolean;
  setShowPackageBuilder: React.Dispatch<React.SetStateAction<boolean>>;
  pendingNextStep: boolean;
  handleServiceToggleWrapper: (service: Service) => void;
  handlePackageConfirm: (selectedPackageServices: Service[]) => void;
  handleSkipPackage: () => void;
  handleStepChange: ((step: string) => void) | undefined;
  packageEnabled: boolean;
  packageSettings: PackageSettings | undefined;
  selectedServices: SelectedService[];
  // Add any additional properties needed by ServiceSelectionView
}

export interface ServiceSelectionViewProps {
  isLoading: boolean;
  categories: Category[] | undefined;
  selectionState: SelectionState;
}
