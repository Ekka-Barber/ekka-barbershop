
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
import { SelectedService } from "@/types/service";
import "../ServiceSelection.css";

interface ServiceSelectionViewProps {
  isLoading: boolean;
  categories: any[] | undefined;
  selectionState: any;
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
  } = selectionState;

  return (
    <div className="space-y-6 pb-8 service-selection-container">
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
        currentlySelectedServices={displayServices as SelectedService[]}
      />
    </div>
  );
};
