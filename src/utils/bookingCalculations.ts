
/**
 * Utility functions for price and discount calculations in the booking process
 */

/**
 * Calculates the discounted price of a service based on its discount type and value
 */
export const calculateDiscountedPrice = (service: any) => {
  if (!service.discount_type || !service.discount_value) return service.price;
  
  if (service.discount_type === 'percentage') {
    return service.price * (1 - (service.discount_value / 100));
  } else {
    return service.price - service.discount_value;
  }
};

/**
 * Rounds a price according to business rules
 * - If decimal is >= 0.5, round up
 * - If decimal is <= 0.4, round down
 */
export const roundPrice = (price: number) => {
  const decimal = price % 1;
  if (decimal >= 0.5) {
    return Math.ceil(price);
  } else if (decimal <= 0.4) {
    return Math.floor(price);
  }
  return price;
};

/**
 * Calculates the total price from all selected services, accounting for discounts
 */
export const calculateTotalPrice = (selectedServices: any[]) => {
  return selectedServices.reduce((sum, service) => {
    // Use the discounted price if available, otherwise use the standard price
    const price = service.price || 0;
    return sum + price;
  }, 0);
};

/**
 * Calculates the total duration from all selected services in minutes
 */
export const calculateTotalDuration = (selectedServices: any[]) => {
  return selectedServices.reduce((sum, service) => sum + (service.duration || 0), 0);
};

/**
 * Calculates the total savings from all services by comparing original prices to discounted prices
 */
export const calculateTotalSavings = (selectedServices: any[]) => {
  return selectedServices.reduce((sum, service) => {
    const originalPrice = service.originalPrice || service.price;
    const discountedPrice = service.price;
    return sum + (originalPrice - discountedPrice);
  }, 0);
};
