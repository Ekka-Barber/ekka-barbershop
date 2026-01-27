import { useState, useCallback, useRef } from 'react';

import { Employee } from '@shared/types/domains';
import { logger } from '@shared/utils/logger';

import { SalaryCalculatorFactory } from '../calculators/CalculatorFactory';
import {
  SalaryPlanType,
  Transaction,
  SalaryPlan,
  SalaryCalculationResult,
} from '../types/salary';

// Types for calculation history and performance metrics
export interface CalculationHistoryEntry {
  id: string;
  timestamp: Date;
  employeeId: string;
  employeeName: string;
  planName: string;
  salesAmount: number;
  result: SalaryCalculationResult;
  executionTime: number; // in milliseconds
  cacheHit: boolean;
}

export interface PerformanceMetrics {
  totalCalculations: number;
  averageExecutionTime: number;
  cacheHitRate: number;
  lastCalculationTime: number;
  calculationsInLastHour: number;
}

// Cache key generator
const generateCacheKey = (
  employeeId: string,
  planId: string,
  salesAmount: number,
  selectedMonth: string,
  transactionHash: string
): string => {
  return `${employeeId}-${planId}-${salesAmount}-${selectedMonth}-${transactionHash}`;
};

// Transaction hash generator for cache invalidation
const generateTransactionHash = (transactions: {
  bonuses: Transaction[];
  deductions: Transaction[];
  loans: Transaction[];
}): string => {
  const combined = [
    ...transactions.bonuses.map((b) => `${b.id}-${b.amount}`),
    ...transactions.deductions.map((d) => `${d.id}-${d.amount}`),
    ...transactions.loans.map((l) => `${l.id}-${l.amount}`),
  ].join('|');

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString();
};

/**
 * Enhanced Hook to handle salary calculator logic with caching and history
 */
export const useCalculator = ({
  employee,
  plan,
  transactionData,
  salesAmount,
  selectedMonth,
}: {
  employee: Employee;
  plan: SalaryPlan | null;
  transactionData: {
    bonuses: Transaction[];
    deductions: Transaction[];
    loans: Transaction[];
  };
  salesAmount: number;
  selectedMonth: string;
}): {
  calculate: () => Promise<void>;
  calculationResult: SalaryCalculationResult;
  setCalculationResult: React.Dispatch<
    React.SetStateAction<SalaryCalculationResult>
  >;
  calculationHistory: CalculationHistoryEntry[];
  performanceMetrics: PerformanceMetrics;
  clearHistory: () => void;
  clearCache: () => void;
} => {
  // Helper function to create initial result
  const createInitialResult = (
    calculate: () => Promise<void>
  ): SalaryCalculationResult => ({
    baseSalary: 0,
    commission: 0,
    targetBonus: 0,
    regularBonus: 0,
    deductions: 0,
    loans: 0,
    totalSalary: 0,
    planType: null,
    planName: null,
    isLoading: true,
    error: null,
    calculate,
    calculationDone: false,
    details: [],
  });

  const [calculationResult, setCalculationResult] =
    useState<SalaryCalculationResult>(() =>
      createInitialResult(async () => {})
    );
  const [calculationHistory, setCalculationHistory] = useState<
    CalculationHistoryEntry[]
  >([]);

  // Cache and performance tracking
  const calculationCache = useRef(new Map<string, SalaryCalculationResult>());
  const performanceData = useRef({
    totalCalculations: 0,
    totalExecutionTime: 0,
    cacheHits: 0,
    calculationTimes: [] as number[],
  });

  // Performance metrics calculation
  const performanceMetrics: PerformanceMetrics = {
    totalCalculations: performanceData.current.totalCalculations,
    averageExecutionTime:
      performanceData.current.totalCalculations > 0
        ? performanceData.current.totalExecutionTime /
          performanceData.current.totalCalculations
        : 0,
    cacheHitRate:
      performanceData.current.totalCalculations > 0
        ? (performanceData.current.cacheHits /
            performanceData.current.totalCalculations) *
          100
        : 0,
    lastCalculationTime:
      performanceData.current.calculationTimes[
        performanceData.current.calculationTimes.length - 1
      ] || 0,
    calculationsInLastHour: calculationHistory.filter(
      (entry) => Date.now() - entry.timestamp.getTime() < 3600000
    ).length,
  };

  const clearHistory = useCallback(() => {
    setCalculationHistory([]);
    performanceData.current = {
      totalCalculations: 0,
      totalExecutionTime: 0,
      cacheHits: 0,
      calculationTimes: [],
    };
  }, []);

  const clearCache = useCallback(() => {
    calculationCache.current.clear();
  }, []);

  const calculate = useCallback(async () => {
    const startTime = performance.now();
    let cacheHit = false;
    let currentResult: SalaryCalculationResult;

    try {
      if (!plan) {
        currentResult = {
          ...createInitialResult(async () => {}),
          isLoading: false,
          error: 'No salary plan found for this employee',
          calculationDone: true,
        };
        setCalculationResult((prev) => ({
          ...currentResult,
          calculate: prev.calculate,
        }));
        return;
      }

      // Add validation for plan type
      if (!plan.type) {
        currentResult = {
          ...createInitialResult(async () => {}),
          isLoading: false,
          error: 'The salary plan has no defined type',
          calculationDone: true,
        };
        setCalculationResult((prev) => ({
          ...currentResult,
          calculate: prev.calculate,
        }));
        return;
      }

      // Generate cache key
      const transactionHash = generateTransactionHash(transactionData);
      const cacheKey = generateCacheKey(
        employee.id,
        plan.id,
        salesAmount,
        selectedMonth,
        transactionHash
      );

      // Check cache first
      const cachedResult = calculationCache.current.get(cacheKey);
      if (cachedResult) {
        cacheHit = true;
        performanceData.current.cacheHits++;
        currentResult = cachedResult;
        setCalculationResult((prev) => ({
          ...cachedResult,
          calculate: prev.calculate,
        }));
      } else {
        // Get the appropriate calculator for this plan type
        const factory = SalaryCalculatorFactory.getInstance();
        const calculator = factory.getCalculator(plan.type as SalaryPlanType);

        // Perform calculation
        const result = await calculator.calculate({
          employee,
          plan,
          salesAmount,
          bonuses: transactionData.bonuses,
          deductions: transactionData.deductions,
          loans: transactionData.loans,
          selectedMonth,
        });

        // Transform CalculatorResult to SalaryCalculationResult
        currentResult = {
          baseSalary: result.baseSalary,
          commission: result.commission,
          targetBonus: result.targetBonus || 0,
          regularBonus: result.bonus || 0,
          deductions: result.deductions || 0,
          loans: result.loans || 0,
          totalSalary: result.total || 0,
          planType: (result.planType as SalaryPlanType) || plan.type,
          planName: result.planName || plan.name,
          isLoading: false,
          error: result.error || null,
          calculate: async () => {}, // Placeholder, will be set correctly below
          calculationDone: true,
          details: result.details || [],
          bonusList: transactionData.bonuses,
          deductionsList: transactionData.deductions,
        };

        // Cache the result (without the calculate function)
        calculationCache.current.set(cacheKey, currentResult);

        // Set the result with the correct calculate function
        setCalculationResult((prev) => ({
          ...currentResult,
          calculate: prev.calculate,
        }));
      }

      // Record performance metrics
      const executionTime = performance.now() - startTime;
      performanceData.current.totalCalculations++;
      performanceData.current.totalExecutionTime += executionTime;
      performanceData.current.calculationTimes.push(executionTime);

      // Keep only last 100 calculation times for performance
      if (performanceData.current.calculationTimes.length > 100) {
        performanceData.current.calculationTimes =
          performanceData.current.calculationTimes.slice(-100);
      }

      // Add to calculation history
      const historyEntry: CalculationHistoryEntry = {
        id: `calc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        employeeId: employee.id,
        employeeName: employee.name,
        planName: plan.name,
        salesAmount,
        result: currentResult,
        executionTime,
        cacheHit,
      };

      setCalculationHistory((prev) => {
        const newHistory = [historyEntry, ...prev];
        // Keep only last 50 calculations
        return newHistory.slice(0, 50);
      });
    } catch (error) {
      logger.error('Error calculating salary:', error);
      setCalculationResult((prev) => ({
        ...createInitialResult(prev.calculate),
        isLoading: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
        calculationDone: true,
      }));

      // Record performance metrics even for errors
      const executionTime = performance.now() - startTime;
      performanceData.current.totalCalculations++;
      performanceData.current.totalExecutionTime += executionTime;
    }
  }, [employee, plan, transactionData, salesAmount, selectedMonth]);

  return {
    calculate,
    calculationResult,
    setCalculationResult,
    calculationHistory,
    performanceMetrics,
    clearHistory,
    clearCache,
  };
};
