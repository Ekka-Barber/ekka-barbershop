import { useState, useCallback, useEffect, useRef } from "react";

import { useToast } from "@shared/hooks/use-toast";
import {
  calculateSalaryFromPlan,
  getActiveWorkdayRatio,
  getPayrollWindow,
  type SalaryPlanConfig,
} from "@shared/lib/salary/calculations";

import { useEmployeeSalaryData } from "@/features/manager/hooks/salary/useEmployeeSalaryData";
import { SalaryPlanType, SalaryCalculationResult, EmployeeBonus, EmployeeDeduction, EmployeeLoan } from "@/features/manager/types/salary";

export function useSalaryCalculation(
  employeeId: string,
  employeeName: string,
  selectedMonth: string,
  initialSales?: number,
  salaryPlanId?: string | null,
  startDate?: string | null,
  endDate?: string | null
): SalaryCalculationResult {
  const [baseSalary, setBaseSalary] = useState<number>(0);
  const [commission, setCommission] = useState<number>(0);
  const [targetBonus, setTargetBonus] = useState<number>(0);
  const [totalSalary, setTotalSalary] = useState<number>(0);
  const [planType, setPlanType] = useState<SalaryPlanType | null>(null);
  const [planName, setPlanName] = useState<string | null>(null);
  const [calculationDone, setCalculationDone] = useState<boolean>(false);
  const [bonusList, setBonusList] = useState<EmployeeBonus[]>([]);
  const [deductionsList, setDeductionsList] = useState<EmployeeDeduction[]>([]);
  const [loansList, setLoansList] = useState<EmployeeLoan[]>([]);
  const { toast } = useToast();

  const previousMonthRef = useRef(selectedMonth);

  // Reset calculation when month changes
  useEffect(() => {
    if (previousMonthRef.current !== selectedMonth) {
      setCalculationDone(false);
      previousMonthRef.current = selectedMonth;
    }
  }, [selectedMonth, employeeId]);

  const {
    totalDeductions,
    totalLoans,
    bonusList: fetchedBonusList,
    deductionsList: fetchedDeductionsList,
    loansList: fetchedLoansList,
    isLoading, 
    error,
    fetchData 
  } = useEmployeeSalaryData(
    employeeId,
    employeeName,
    selectedMonth,
    initialSales,
    salaryPlanId
  );

  // Update lists when data is fetched
  useEffect(() => {
    if (fetchedBonusList) {
      setBonusList(fetchedBonusList);
    }
  }, [fetchedBonusList]);
  
  useEffect(() => {
    if (fetchedDeductionsList) {
      setDeductionsList(fetchedDeductionsList);
    }
  }, [fetchedDeductionsList]);
  
  useEffect(() => {
    if (fetchedLoansList) {
      setLoansList(fetchedLoansList);
    }
  }, [fetchedLoansList]);
  
  const calculate = useCallback(async () => {
    try {
      setCalculationDone(false);
      // Fetch all data first
      const salarySnapshot = await fetchData();
      if (!salarySnapshot) {
        setCalculationDone(true);
        return;
      }

      const {
        salaryPlan: currentSalaryPlan,
        totalSales: snapshotSales,
        totalDeductions: snapshotDeductions,
        totalLoans: snapshotLoans,
        totalBonuses: snapshotBonuses,
        bonusList: _snapshotBonusList,
      } = salarySnapshot;
      
      // Handle case when no salary plan assigned
      if (!currentSalaryPlan) {
        setPlanType(null);
        setPlanName(null);
        setBaseSalary(0);
        setCommission(0);
        setTargetBonus(0);
        // Only extra bonuses, deductions, loans apply
        const finalSalary = snapshotBonuses - snapshotDeductions - snapshotLoans;
        setTotalSalary(finalSalary);
        setCalculationDone(true);
        return;
      }
      
      setPlanType(currentSalaryPlan.type);
      setPlanName(currentSalaryPlan.name);
      
       const planConfig: SalaryPlanConfig = {
         name: currentSalaryPlan.name,
         blocks: [],
         description: '',
         ...(currentSalaryPlan.config as Partial<SalaryPlanConfig>),
       };
       const result = calculateSalaryFromPlan(snapshotSales, planConfig, [], []);

      const baseSalary = Math.round(result.basicSalary * 100) / 100;
      const commission = Math.round(result.commission * 100) / 100;
      const targetBonus = Math.round(result.targetBonus * 100) / 100;

      const { windowStart, windowEnd } = getPayrollWindow(selectedMonth);
      const prorationRatio = getActiveWorkdayRatio(
        startDate,
        endDate,
        windowStart,
        windowEnd
      );
      const proratedBaseSalary = Math.round(baseSalary * prorationRatio * 100) / 100;

      // Calculate total without extra bonuses (plan components)
      const totalWithoutExtraBonuses = baseSalary + commission + targetBonus;
      const proratedTotalWithoutExtraBonuses = totalWithoutExtraBonuses - baseSalary + proratedBaseSalary;
      
      // Add extra bonuses (DB bonuses)
      const planGross = proratedTotalWithoutExtraBonuses + snapshotBonuses;
      
      // Subtract deductions and loans
      const salaryAfterDeductions = planGross - snapshotDeductions;
      const finalSalary = salaryAfterDeductions - snapshotLoans;

      setBaseSalary(proratedBaseSalary);
      setCommission(commission);
      setTargetBonus(targetBonus);
      setTotalSalary(finalSalary);
      setCalculationDone(true);
      
    } catch (err: Error | unknown) {
      console.error("Salary calculation error:", err);
      toast({
        variant: "destructive",
        title: "خطأ في حساب الراتب",
        description: err instanceof Error ? err.message : "حدث خطأ أثناء حساب الراتب",
      });
      setCalculationDone(true);
    }
  }, [fetchData, toast, selectedMonth, startDate, endDate]);

  return {
    baseSalary,
    commission,
    targetBonus,
    deductions: totalDeductions,
    loans: totalLoans,
    totalSalary,
    planType,
    planName,
    isLoading,
    error,
    calculate,
    calculationDone,
    bonusList,
    deductionsList,
    loansList
  };
}
