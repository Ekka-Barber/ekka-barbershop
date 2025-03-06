
import { 
  calculateDiscountedPrice, 
  calculateTotalPrice, 
  calculateTotalDuration,
  calculateTotalSavings, 
  roundPrice 
} from '../bookingCalculations';

// Explicit imports for Jest functions
import { describe, expect, it } from '@jest/globals';

describe('Booking Calculations Utility', () => {
  describe('calculateDiscountedPrice', () => {
    it('should return original price when no discount is applied', () => {
      const service = { price: 100 };
      expect(calculateDiscountedPrice(service)).toBe(100);
    });

    it('should apply percentage discount correctly', () => {
      const service = { 
        price: 100, 
        discount_type: 'percentage', 
        discount_value: 20 
      };
      expect(calculateDiscountedPrice(service)).toBe(80);
    });

    it('should apply amount discount correctly', () => {
      const service = { 
        price: 100, 
        discount_type: 'amount', 
        discount_value: 25 
      };
      expect(calculateDiscountedPrice(service)).toBe(75);
    });
  });

  describe('roundPrice', () => {
    it('should round up when decimal is >= 0.5', () => {
      expect(roundPrice(100.5)).toBe(101);
      expect(roundPrice(100.9)).toBe(101);
    });

    it('should round down when decimal is <= 0.4', () => {
      expect(roundPrice(100.4)).toBe(100);
      expect(roundPrice(100.1)).toBe(100);
    });

    it('should not change integer prices', () => {
      expect(roundPrice(100)).toBe(100);
    });
  });

  describe('calculateTotalPrice', () => {
    it('should sum prices of all selected services', () => {
      const services = [
        { price: 100 },
        { price: 150 },
        { price: 200 }
      ];
      expect(calculateTotalPrice(services)).toBe(450);
    });

    it('should handle empty service array', () => {
      expect(calculateTotalPrice([])).toBe(0);
    });

    it('should handle services without price', () => {
      const services = [
        { price: 100 },
        { },
        { price: 200 }
      ];
      expect(calculateTotalPrice(services)).toBe(300);
    });
  });

  describe('calculateTotalDuration', () => {
    it('should sum durations of all selected services', () => {
      const services = [
        { duration: 30 },
        { duration: 45 },
        { duration: 60 }
      ];
      expect(calculateTotalDuration(services)).toBe(135);
    });

    it('should handle empty service array', () => {
      expect(calculateTotalDuration([])).toBe(0);
    });

    it('should handle services without duration', () => {
      const services = [
        { duration: 30 },
        { },
        { duration: 60 }
      ];
      expect(calculateTotalDuration(services)).toBe(90);
    });
  });

  describe('calculateTotalSavings', () => {
    it('should calculate total savings from original to discounted prices', () => {
      const services = [
        { originalPrice: 120, price: 100 },
        { originalPrice: 200, price: 160 },
        { price: 50 } // No savings
      ];
      expect(calculateTotalSavings(services)).toBe(60);
    });

    it('should handle empty service array', () => {
      expect(calculateTotalSavings([])).toBe(0);
    });

    it('should handle services without original price', () => {
      const services = [
        { price: 100 },
        { originalPrice: 200, price: 160 }
      ];
      expect(calculateTotalSavings(services)).toBe(40);
    });
  });
});
