
export interface NextTierThreshold {
  servicesNeeded: number;
  newPercentage: number;
}

export interface PackageCalculation {
  originalTotal: number;
  discountedTotal: number;
  savings: number;
  discountPercentage: number;
  totalWithBase: number;
}

export interface DiscountTier {
  minServices: number;
  percentage: number;
  label: string;
}

export interface PackageDiscount {
  currentTier: DiscountTier;
  nextTier: DiscountTier | null;
  servicesNeeded: number;
  maxDiscount: number;
}

export interface PackageConfiguration {
  enabled: boolean;
  baseServiceId: string;
  discountTiers: {
    oneService: number;
    twoServices: number;
    threeOrMore: number;
  };
  maxServices: number;
}
