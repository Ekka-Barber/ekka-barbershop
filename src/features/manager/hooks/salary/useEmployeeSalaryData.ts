import { useState, useEffect, useCallback } from "react";

import { useToast } from "@shared/hooks/use-toast";
import { usePayrollData } from "@shared/hooks/usePayrollData";

import { fetchSalaryPlan } from './employeeSalaryApi';
import { processDeductions, processLoans, processBonuses } from './employeeSalaryTransforms';

import { SalaryPlan, EmployeeBonus, EmployeeDeduction, EmployeeLoan } from "@/features/manager/types/salary";

interface EmployeeSalaryData {
  salaryPlan: SalaryPlan | null;
  totalSales: number;
  totalDeductions: number;
  totalLoans: number;
  totalBonuses: number;
  bonusList: EmployeeBonus[];
  deductionsList: EmployeeDeduction[];
  loansList: EmployeeLoan[];
  isLoading: boolean;
  error: string | null;
  fetchData: () => Promise<SalaryDataSnapshot | null>;
}

interface SalaryDataSnapshot {
  salaryPlan: SalaryPlan | null;
  totalSales: number;
  totalDeductions: number;
  totalLoans: number;
  totalBonuses: number;
  bonusList: EmployeeBonus[];
  deductionsList: EmployeeDeduction[];
  loansList: EmployeeLoan[];
}

/**
 * Enhanced hook to fetch all salary-related data for an employee
 */
export function useEmployeeSalaryData(
  employeeId: string,
  employeeName: string,
  selectedMonth: string,
  initialSales?: number,
  salaryPlanId?: string | null
): EmployeeSalaryData {
  const [salaryPlan, setSalaryPlan] = useState<SalaryPlan | null>(null);
  const [totalSales, setTotalSales] = useState<number>(initialSales || 0);
  const [totalDeductions, setTotalDeductions] = useState<number>(0);
  const [totalLoans, setTotalLoans] = useState<number>(0);
  const [totalBonuses, setTotalBonuses] = useState<number>(0);
  const [bonusList, setBonusList] = useState<EmployeeBonus[]>([]);
  const [deductionsList, setDeductionsList] = useState<EmployeeDeduction[]>([]);
  const [loansList, setLoansList] = useState<EmployeeLoan[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { refetch: refetchPayroll } = usePayrollData({
    selectedMonth,
    employeeIds: employeeId ? [employeeId] : undefined,
    employeeNames: employeeName ? [employeeName] : undefined,
    enabled: false,
  });

  // Add useEffect to reset totalSales when month changes (CRITICAL FIX)
  useEffect(() => {
    setTotalSales(initialSales || 0);
  }, [employeeId, selectedMonth, initialSales]);

  const fetchData = useCallback(async (): Promise<SalaryDataSnapshot | null> => {
    setIsLoading(true);
    setError(null);
    let resolvedPlan: SalaryPlan | null = null;
    let resolvedSales = initialSales ?? 0;
    let deductionsTotal = 0;
    let loansTotal = 0;
    let bonusesTotal = 0;
    let resolvedBonusList: EmployeeBonus[] = [];
    let resolvedDeductionsList: EmployeeDeduction[] = [];
    let resolvedLoansList: EmployeeLoan[] = [];
    
    try {
      // Salary plan
       if (salaryPlanId) {
         const { data: planData, error: planError } = await fetchSalaryPlan(salaryPlanId);
        
        if (planError) {
          console.error("Salary plan fetch error:", planError);
         } else if (planData) {
           const plan = planData as SalaryPlan;
          setSalaryPlan(plan);
          resolvedPlan = plan;
        }
      } else {
        setSalaryPlan(null);
      }
      
      const payrollResponse = await refetchPayroll();
      if (payrollResponse.error) {
        throw payrollResponse.error;
      }

      const payrollData = payrollResponse.data;
      const deductions = payrollData?.deductions || [];
      const loans = payrollData?.loans || [];
      const bonuses = payrollData?.bonuses || [];

      const processedDeductions = processDeductions(deductions);
      const processedLoans = processLoans(loans);
      const processedBonuses = processBonuses(bonuses);

        resolvedSales = payrollData?.totals.sales ?? initialSales ?? 0;
      deductionsTotal = payrollData?.totals.deductions ?? 0;
      loansTotal = payrollData?.totals.loans ?? 0;
      bonusesTotal = payrollData?.totals.bonuses ?? 0;

      resolvedBonusList = processedBonuses as EmployeeBonus[];
      resolvedDeductionsList = processedDeductions as EmployeeDeduction[];
      resolvedLoansList = processedLoans as EmployeeLoan[];

      setTotalSales(resolvedSales);

      setTotalDeductions(deductionsTotal);
      setTotalLoans(loansTotal);
      setTotalBonuses(bonusesTotal);
      setBonusList(resolvedBonusList);
      setDeductionsList(resolvedDeductionsList);
      setLoansList(resolvedLoansList);

      return {
        salaryPlan: resolvedPlan,
        totalSales: resolvedSales,
        totalDeductions: deductionsTotal,
        totalLoans: loansTotal,
        totalBonuses: bonusesTotal,
        bonusList: resolvedBonusList,
        deductionsList: resolvedDeductionsList,
        loansList: resolvedLoansList,
      };
    } catch (err: Error | unknown) {
      console.error("Error fetching salary data:", err);
      setError(err instanceof Error ? err.message : "Error fetching salary data");
      toast({
        variant: "destructive",
        title: "خطأ في جلب بيانات الراتب",
        description: err instanceof Error ? err.message : "حدث خطأ أثناء جلب بيانات الراتب",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [initialSales, salaryPlanId, refetchPayroll, toast]);

  return {
    salaryPlan,
    totalSales,
    totalDeductions,
    totalLoans,
    totalBonuses,
    bonusList,
    deductionsList,
    loansList,
    isLoading,
    error,
    fetchData
  };
}
