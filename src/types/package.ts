
/**
 * Interface for discount tiers configuration in package settings
 * @interface DiscountTiers
 */
export interface DiscountTiers {
  /**
   * Discount percentage when one add-on service is selected
   */
  oneService: number;
  
  /**
   * Discount percentage when two add-on services are selected
   */
  twoServices: number;
  
  /**
   * Discount percentage when three or more add-on services are selected
   */
  threeOrMore: number;
}

/**
 * Interface for package calculation results
 * @interface PackageCalculation
 */
export interface PackageCalculation {
  /**
   * Original total price before any discounts
   */
  originalTotal: number;
  
  /**
   * Total price after discounts have been applied
   */
  discountedTotal: number;
  
  /**
   * Total amount saved due to package discounts
   */
  savings: number;
  
  /**
   * Current discount percentage being applied
   */
  discountPercentage: number;
  
  /**
   * Total with base service (may be needed for specific calculations)
   */
  totalWithBase: number;
}

/**
 * Interface for the next tier threshold data
 * @interface NextTierThreshold
 */
export interface NextTierThreshold {
  /**
   * Number of services needed to reach the next discount tier
   */
  servicesNeeded: number;
  
  /**
   * Discount percentage of the next tier
   */
  newPercentage: number;
}
