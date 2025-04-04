
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
