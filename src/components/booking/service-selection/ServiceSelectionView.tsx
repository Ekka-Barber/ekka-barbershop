
import { ServicesSkeleton } from "../ServicesSkeleton";
import { AlertTriangle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Sheet } from "@/components/ui/sheet";
import { PackageBanner } from "./PackageBanner";
import { CategoryTabs } from "./CategoryTabs";
import { ServiceGrid } from "./ServiceGrid";
import { ServiceDetailSheet } from "./ServiceDetailSheet";
import { ServicesSummary } from "./ServicesSummary";
import { PackageInfoDialog } from "./PackageInfoDialog";
import { PackageBuilderDialog } from "../package-builder/PackageBuilderDialog";
import { SelectedService, Service } from "@/types/service";
import { PackageSettings } from "@/types/admin";

// Import the constant for base service ID from usePackageDiscount
import { BASE_SERVICE_ID } from "@/hooks/usePackageDiscount";

// Define inferred Category type locally (consider moving to types file)
interface Category {
  id: string;
  name_en: string;
  name_ar: string;
  display_order: number;
  services: Service[];
}

// Define inferred DisplayService type locally
interface DisplayService {
  id: string;
  name: string;
  price: number;
  duration: number;
  originalPrice?: number;
  isBasePackageService?: boolean;
  isPackageAddOn?: boolean;
}

// Define inferred SelectionState type locally (consider moving to types file)
// Note: transformServicesForDisplay still uses 'any' return type - needs check
interface SelectionState {
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
  packageSettings: PackageSettings | null | undefined; // Use imported type
  hasBaseService: boolean;
  availablePackageServices: any[]; // Changed from Service[] to any[]
  baseService: Service | undefined;
  totalDuration: number;
  totalPrice: number;
  displayServices: DisplayService[]; // Use defined DisplayService type
  transformServicesForDisplay: (services: SelectedService[], lang: 'en' | 'ar') => DisplayService[]; // Use defined DisplayService type
  selectedServices: SelectedService[]; // Renamed from selectedServices in hook, keep for clarity here
}

interface ServiceSelectionViewProps {
  isLoading: boolean;
  categories: Category[] | undefined;
  selectionState: SelectionState;
}

export const ServiceSelectionView = ({
  isLoading,
  categories,
  selectionState
}: ServiceSelectionViewProps) => {
  const { language } = useLanguage();

  if (isLoading) {
    return <ServicesSkeleton />;
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-yellow-500" />
        <h3 className="text-lg font-semibold">
          {language === 'ar' ? 'لا توجد خدمات متاحة' : 'No Services Available'}
        </h3>
        <p className="text-gray-500">
          {language === 'ar' 
            ? 'نعتذر، لا توجد خدمات متاحة حالياً. يرجى المحاولة مرة أخرى لاحقاً.'
            : 'Sorry, there are no services available at the moment. Please try again later.'}
        </p>
      </div>
    );
  }

  const {
    activeCategory,
    activeCategoryServices,
    availablePackageServices,
    baseService,
    displayServices,
    handlePackageConfirm,
    handleServiceClick,
    handleServiceToggleWrapper,
    handleSkipPackage,
    handleStepChange,
    hasBaseService,
    isSheetOpen,
    packageEnabled,
    packageSettings,
    selectedService,
    setActiveCategory,
    setIsSheetOpen,
    setShowPackageBuilder,
    setShowPackageInfo,
    showPackageBuilder,
    showPackageInfo,
    sortedCategories,
    totalDuration,
    totalPrice,
    selectedServices: originalSelectedServices
  } = selectionState;

  // Calculate package savings for the ServicesSummary
  const calculatePackageSavings = () => {
    if (!hasBaseService) return 0;
    
    return displayServices.reduce((total, service) => {
      if (!service.originalPrice || service.id === BASE_SERVICE_ID) return total;
      return total + (service.originalPrice - service.price);
    }, 0);
  };

  const packageSavings = calculatePackageSavings();

  return (
    <div className="space-y-6 pb-8 px-2 md:px-4">
      <PackageBanner 
        isVisible={true} 
        onInfoClick={() => setShowPackageInfo(true)}
        hasBaseService={hasBaseService}
        onBuildPackage={() => setShowPackageBuilder(true)}
      />

      <CategoryTabs
        categories={sortedCategories || []}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        language={language}
      />

      <ServiceGrid 
        services={activeCategoryServices || []}
        selectedServices={displayServices}
        onServiceClick={handleServiceClick}
        onServiceToggle={handleServiceToggleWrapper}
        baseServiceId={packageSettings?.baseServiceId}
      />

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <ServiceDetailSheet 
          service={selectedService}
          isSelected={displayServices.some(s => s.id === selectedService?.id)}
          isOpen={isSheetOpen}
          onClose={() => setIsSheetOpen(false)}
          onSelect={handleServiceToggleWrapper}
          language={language}
          isBasePackageService={selectedService?.id === packageSettings?.baseServiceId}
        />
      </Sheet>

      <ServicesSummary
        selectedServices={displayServices}
        totalDuration={totalDuration}
        totalPrice={totalPrice}
        language={language as 'en' | 'ar'}
        onNextStep={() => handleStepChange('datetime')}
        onPrevStep={() => {}} 
        isFirstStep={true} 
        packageEnabled={packageEnabled}
        packageSettings={packageSettings}
        availableServices={availablePackageServices}
        onAddService={handleServiceToggleWrapper}
        hasBaseService={hasBaseService}
        packageSavings={packageSavings}
      />

      <PackageInfoDialog 
        isOpen={showPackageInfo} 
        onClose={() => setShowPackageInfo(false)}
        packageSettings={packageSettings}
      />

      <PackageBuilderDialog
        isOpen={showPackageBuilder}
        onClose={handleSkipPackage}
        onConfirm={handlePackageConfirm}
        packageSettings={packageSettings}
        baseService={baseService}
        availableServices={availablePackageServices}
        currentlySelectedServices={originalSelectedServices}
      />
    </div>
  );
};
