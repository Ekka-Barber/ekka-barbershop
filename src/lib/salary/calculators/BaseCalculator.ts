
import { SalaryDetail, Transaction } from '../types/salary';
import { 
  CalculationParams, 
  CalculationStatus,
  CalculatorResult, 
  SalesData 
} from './types/calculatorTypes';

/**
 * Abstract base class for salary calculators
 * Provides common functionality for all calculator implementations
 */
export abstract class BaseCalculator {
  protected cache = new Map<string, CalculatorResult>();

  /**
   * Calculate salary based on the provided parameters
   * This must be implemented by all calculator subclasses
   */
  abstract calculate(params: CalculationParams): Promise<CalculatorResult>;

  /**
   * Method to retrieve cached calculation results
   * Can be overridden by subclasses for specific caching strategies
   * 
   * @param params Calculation parameters to use as cache key
   * @returns Cached result or null if not in cache
   */
  getFromCache(params: CalculationParams): CalculatorResult | null {
    return null; // Default implementation returns null (no caching)
  }

  /**
   * Method to save calculation results to cache
   * Can be overridden by subclasses for specific caching strategies
   * 
   * @param key Cache key to store result under
   * @param result Calculation result to cache
   */
  saveToCache(key: string, result: CalculatorResult): void {
    // Default implementation does nothing
  }
  
  /**
   * Validates input parameters for calculation
   * Throws error if required parameters are missing
   * 
   * @param params Parameters to validate
   */
  protected validateInput(params: CalculationParams): void {
    if (!params.employee) {
      throw new Error('Employee data is required for salary calculation');
    }
    
    if (!params.plan) {
      throw new Error('Salary plan is required for salary calculation');
    }
    
    if (params.salesAmount === undefined) {
      throw new Error('Sales amount is required for salary calculation');
    }
  }
  
  /**
   * Parses configuration object from various formats
   * Handles string JSON configs and object configs
   * 
   * @param config Configuration to parse
   * @returns Parsed configuration as an object
   */
  protected parseConfig(config: any): Record<string, any> {
    if (!config) return {};
    
    if (typeof config === 'string') {
      try {
        return JSON.parse(config);
      } catch {
        return {};
      }
    }
    
    return config;
  }
  
  /**
   * Standard error handler for calculations
   * Creates a consistent error result object
   * 
   * @param error Error that occurred during calculation
   * @param params Original calculation parameters
   * @returns Standardized error result
   */
  protected handleCalculationError(error: unknown, params: CalculationParams): CalculatorResult {
    const errorMessage = error instanceof Error ? error.message : 'Unknown calculation error';
    
    return {
      baseSalary: 0,
      commission: 0,
      total: 0,
      calculationStatus: {
        success: false,
        error: errorMessage,
        details: {
          employeeId: params.employee.id,
          planType: params.plan?.type || 'unknown',
          errorTime: new Date().toISOString()
        }
      },
      error: errorMessage
    };
  }
}

// Alias SalaryCalculator to BaseCalculator for backward compatibility
export type SalaryCalculator = BaseCalculator;

// Re-export types
export type { 
  CalculationParams, 
  CalculationStatus,
  CalculatorResult, 
  SalesData,
  Transaction 
};
