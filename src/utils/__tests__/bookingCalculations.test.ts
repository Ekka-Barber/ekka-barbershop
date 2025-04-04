
import { 
  calculateDiscountedPrice, 
  calculateTotalPrice, 
  calculateTotalDuration,
  calculateTotalSavings, 
  roundPrice 
} from '../bookingCalculations';
import { Service } from '@/types/service';

describe('Booking Calculations Utility', () => {
  describe('calculateDiscountedPrice', () => {
    it('should return original price when no discount is applied', () => {
      const service = { price: 100 } as any;
      expect(calculateDiscountedPrice(service)).toBe(100);
    });

    it('should apply percentage discount correctly', () => {
      const service = { 
        price: 100, 
        discount_type: 'percentage' as "percentage", 
        discount_value: 20 
      };
      expect(calculateDiscountedPrice(service)).toBe(80);
    });

    it('should apply amount discount correctly', () => {
      const service = { 
        price: 100, 
        discount_type: 'amount' as "amount", 
        discount_value: 25 
      };
      expect(calculateDiscountedPrice(service)).toBe(75);
    });
    
    it('should handle zero discount value', () => {
      const service = { 
        price: 100, 
        discount_type: 'percentage' as "percentage", 
        discount_value: 0 
      };
      expect(calculateDiscountedPrice(service)).toBe(100);
    });
    
    it('should handle undefined discount type', () => {
      const service = { 
        price: 100, 
        discount_value: 20 
      };
      expect(calculateDiscountedPrice(service)).toBe(100);
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
    
    it('should handle edge case of exactly 0.5', () => {
      expect(roundPrice(100.5)).toBe(101);
    });
    
    it('should handle negative numbers correctly', () => {
      expect(roundPrice(-100.3)).toBe(-100);
      expect(roundPrice(-100.7)).toBe(-100); // Note: Math.ceil(-100.7) is -100
    });
  });

  describe('calculateTotalPrice', () => {
    it('should sum prices of all selected services', () => {
      const services = [
        { price: 100 },
        { price: 150 },
        { price: 200 }
      ] as Service[];
      expect(calculateTotalPrice(services)).toBe(450);
    });

    it('should handle empty service array', () => {
      expect(calculateTotalPrice([])).toBe(0);
    });

    it('should handle services without price', () => {
      const services = [
        { price: 100 },
        { } as any,
        { price: 200 }
      ] as Service[];
      expect(calculateTotalPrice(services)).toBe(300);
    });
    
    it('should handle zero prices', () => {
      const services = [
        { price: 0 },
        { price: 100 },
        { price: 0 }
      ] as Service[];
      expect(calculateTotalPrice(services)).toBe(100);
    });
  });

  describe('calculateTotalDuration', () => {
    it('should sum durations of all selected services', () => {
      const services = [
        { duration: 30, price: 0 },
        { duration: 45, price: 0 },
        { duration: 60, price: 0 }
      ] as Service[];
      expect(calculateTotalDuration(services)).toBe(135);
    });

    it('should handle empty service array', () => {
      expect(calculateTotalDuration([])).toBe(0);
    });

    it('should handle services without duration', () => {
      const services = [
        { duration: 30, price: 0 },
        { price: 0 } as any,
        { duration: 60, price: 0 }
      ] as Service[];
      expect(calculateTotalDuration(services)).toBe(90);
    });
    
    it('should handle zero durations', () => {
      const services = [
        { duration: 0, price: 0 },
        { duration: 30, price: 0 },
        { duration: 0, price: 0 }
      ] as Service[];
      expect(calculateTotalDuration(services)).toBe(30);
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
    
    it('should return zero when originalPrice equals price', () => {
      const services = [
        { originalPrice: 100, price: 100 },
        { originalPrice: 200, price: 200 }
      ];
      expect(calculateTotalSavings(services)).toBe(0);
    });
    
    it('should handle negative savings (price increase)', () => {
      const services = [
        { originalPrice: 100, price: 120 } // Unusual case, price increased
      ];
      expect(calculateTotalSavings(services)).toBe(-20);
    });
  });
});
