
/**
 * Utility functions for price and discount calculations in the booking process
 */

// Define a type for Service objects
interface Service {
  price: number;
  originalPrice?: number;
  discount_type?: 'percentage' | 'amount' | string;
  discount_value?: number;
  duration?: number;
}

/**
 * Calculates the discounted price of a service based on its discount type and value
 * 
 * @param {Service} service - The service to calculate price for
 * @returns {number} The calculated price after discount
 */
export const calculateDiscountedPrice = (service: Service) => {
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
 * 
 * @param {number} price - The price to round
 * @returns {number} The rounded price
 */
export const roundPrice = (price: number) => {
  const decimal = price % 1;
  if (decimal >= 0.5) {
    return Math.ceil(price);
  } else {
    // Round down if decimal is < 0.5
    return Math.floor(price);
  }
};

/**
 * Calculates the total price from all selected services, accounting for discounts
 * 
 * @param {Service[]} selectedServices - Array of selected services
 * @returns {number} The total price of all services
 */
export const calculateTotalPrice = (selectedServices: Service[]) => {
  return selectedServices.reduce((sum, service) => {
    // Use the discounted price if available, otherwise use the standard price
    const price = service.price || 0;
    return sum + price;
  }, 0);
};

/**
 * Calculates the total duration from all selected services in minutes
 * 
 * @param {Service[]} selectedServices - Array of selected services
 * @returns {number} The total duration in minutes
 */
export const calculateTotalDuration = (selectedServices: Service[]) => {
  return selectedServices.reduce((sum, service) => sum + (service.duration || 0), 0);
};

/**
 * Calculates the total savings from all services by comparing original prices to discounted prices
 * 
 * @param {Service[]} selectedServices - Array of selected services
 * @returns {number} The total savings amount
 */
export const calculateTotalSavings = (selectedServices: Service[]) => {
  return selectedServices.reduce((sum, service) => {
    const originalPrice = service.originalPrice || service.price;
    const discountedPrice = service.price;
    return sum + (originalPrice - discountedPrice);
  }, 0);
};
