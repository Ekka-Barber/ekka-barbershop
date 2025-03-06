
import { useMemo } from 'react';
import { PackageSettings } from '@/types/admin';
import { NextTierThreshold } from '@/types/package';

/**
 * Hook that calculates the next discount tier threshold for package discounts
 * 
 * @param addOnCount - Current number of selected add-on services
 * @param packageSettings - Package settings with discount tiers configuration
 * @returns Next tier threshold information or undefined if at maximum tier
 * 
 * @example
 * ```tsx
 * const nextTier = useNextTierCalculation(selectedAddOns.length, packageSettings);
 * if (nextTier) {
 *   console.log(`Add ${nextTier.servicesNeeded} more service(s) to get ${nextTier.newPercentage}% discount!`);
 * }
 * ```
 */
export function useNextTierCalculation(
  addOnCount: number,
  packageSettings?: PackageSettings
): NextTierThreshold | undefined {
  return useMemo(() => {
    if (!packageSettings) return undefined;
    
    const { discountTiers } = packageSettings;
    
    if (addOnCount === 0) {
      return { 
        servicesNeeded: 1, 
        newPercentage: discountTiers.oneService 
      };
    } else if (addOnCount === 1) {
      return { 
        servicesNeeded: 1, 
        newPercentage: discountTiers.twoServices 
      };
    } else if (addOnCount === 2) {
      return { 
        servicesNeeded: 1, 
        newPercentage: discountTiers.threeOrMore 
      };
    }
    
    return undefined;
  }, [addOnCount, packageSettings]);
}
