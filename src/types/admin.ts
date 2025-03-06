
// Package settings types
export interface PackageSettings {
  baseServiceId: string;
  discountTiers: {
    oneService: number;
    twoServices: number;
    threeOrMore: number;
  };
  maxServices: number | null;
}

export interface PackageServiceToggle {
  serviceId: string;
  enabled: boolean;
}
