
import { useLanguage } from "@/contexts/LanguageContext";
import { Service, SelectedService } from '@/types/service';
import { usePackageDiscount } from "@/hooks/usePackageDiscount";
import { useCategoryState } from "./service-selection/useCategoryState";
import { usePackageInteraction } from "./service-selection/usePackageInteraction";
import { useServiceCalculation } from "./service-selection/useServiceCalculation";

/**
 * Interface for useServiceSelectionState hook props
 * @interface UseServiceSelectionStateProps
 */
interface UseServiceSelectionStateProps {
  categories: any[] | undefined;
  isLoading: boolean;
  selectedServices: SelectedService[];
  onServiceToggle: (service: any) => void;
  onStepChange?: (step: string) => void;
  isUpdatingPackage?: boolean;
  handlePackageServiceUpdate?: (services: SelectedService[]) => void;
  branchId?: string;
}

/**
 * Manages the state for service selection UI components
 * Coordinates between multiple specialized hooks for different aspects of service selection
 * 
 * @param {UseServiceSelectionStateProps} props - Hook parameters
 * @returns {Object} Aggregated state and handler functions for service selection
 */
export const useServiceSelectionState = ({
  categories,
  isLoading,
  selectedServices,
  onServiceToggle,
  onStepChange,
  isUpdatingPackage = false,
  handlePackageServiceUpdate,
  branchId
}: UseServiceSelectionStateProps) => {
  const { language } = useLanguage();
  
  // Use the extracted custom hooks
  const { 
    activeCategory,
    setActiveCategory,
    selectedService,
    isSheetOpen,
    setIsSheetOpen,
    sortedCategories,
    activeCategoryServices,
    handleServiceClick
  } = useCategoryState({ categories });

  const { 
    BASE_SERVICE_ID, 
    packageEnabled, 
    packageSettings, 
    hasBaseService,
    enabledPackageServices
  } = usePackageDiscount(selectedServices, isUpdatingPackage);

  const {
    showPackageInfo,
    setShowPackageInfo,
    showPackageBuilder,
    setShowPackageBuilder,
    pendingNextStep,
    setPendingNextStep,
    handleServiceToggleWrapper,
    handlePackageConfirm,
    handleSkipPackage
  } = usePackageInteraction({
    onServiceToggle,
    onStepChange,
    handlePackageServiceUpdate,
    selectedServices,
    BASE_SERVICE_ID
  });

  const {
    totalDuration,
    totalPrice,
    transformServicesForDisplay
  } = useServiceCalculation({ selectedServices });

  // Find base service
  const baseService = selectedServices.find(s => 
    s.isBasePackageService || s.id === packageSettings?.baseServiceId
  ) || categories?.flatMap(c => c.services).find(s => s.id === packageSettings?.baseServiceId);

  const displayServices = transformServicesForDisplay(selectedServices, language as 'en' | 'ar');

  return {
    // Category state
    activeCategory,
    setActiveCategory,
    sortedCategories,
    activeCategoryServices,
    
    // Service selection
    selectedService,
    isSheetOpen,
    setIsSheetOpen,
    handleServiceClick,
    
    // Package interaction
    showPackageInfo,
    setShowPackageInfo,
    showPackageBuilder,
    setShowPackageBuilder,
    pendingNextStep,
    handleServiceToggleWrapper,
    handlePackageConfirm,
    handleSkipPackage,
    handleStepChange: onStepChange,
    
    // Package settings
    packageEnabled,
    packageSettings,
    hasBaseService,
    availablePackageServices: enabledPackageServices || [],
    baseService,
    
    // Service calculations
    totalDuration,
    totalPrice,
    displayServices,
    
    // Export the language for use in components
    language,
    
    // Re-export nested functions for backward compatibility
    // (this ensures no functionality is broken)
    transformServicesForDisplay,
    
    // Also add selectedServices back for compatibility
    selectedServices
  };
};
