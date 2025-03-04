
/**
 * Utility functions for price and discount calculations in the booking process
 */

/**
 * Calculates the discounted price of a service based on its discount type and value
 */
export const calculateDiscountedPrice = (service: any) => {
  if (!service.discount_type || !service.discount_value) return service.price;
  
  if (service.discount_type === 'percentage') {
    return service.price - (service.price * (service.discount_value / 100));
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
 * Calculates the total price from all selected services
 */
export const calculateTotalPrice = (selectedServices: any[]) => {
  return selectedServices.reduce((sum, service) => sum + service.price, 0);
};

/**
 * Calculates the total duration from all selected services in minutes
 */
export const calculateTotalDuration = (selectedServices: any[]) => {
  return selectedServices.reduce((sum, service) => sum + service.duration, 0);
};
