import { calculateTotal } from '@shared/utils/math';

import { PayslipData, PayslipButtonProps } from '@/features/manager/types/payslip';
import { EmployeeBonus, EmployeeDeduction, EmployeeLoan } from '@/features/manager/types/salary';

export { formatCurrencySAR as formatCurrency } from '@shared/utils/currency';

export { formatDateDDMMYYYY as formatDate } from '@shared/utils/date/dateUtils';

/**
 * Get the current pay period (month and year) in Gregorian format
 */
export const getCurrentPayPeriod = (): string => {
  const date = new Date();
  try {
    // Use Arabic locale with Gregorian calendar for consistency
    return new Intl.DateTimeFormat('ar', {
      year: 'numeric',
      month: 'long',
      calendar: 'gregory'
    }).format(date);
  } catch (error) {
    console.error('Error getting current pay period:', error);
    // Fallback to basic format
    return `${date.getMonth() + 1}/${date.getFullYear()}`;
  }
};

export { safeGet } from '@shared/utils/object';

/**
 * Calculate total bonuses amount from a list of bonuses
 */
export const calculateTotalBonuses = (bonusList: Array<EmployeeBonus> = []): number => {
  if (!Array.isArray(bonusList)) return 0;
  return bonusList.reduce((sum, bonus) => {
    const amount = Number(bonus?.amount || 0);
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);
};

/**
 * Enhanced data mapping function with validation and fallbacks
 */
export const enhancedMapSalaryToPayslipData = (
  employeeData: PayslipButtonProps['employeeData'],
  salaryData: PayslipButtonProps['salaryData'],
  payPeriod: string
): PayslipData => {
  // Default values for required fields
  const defaultEmployee = {
    id: '0',
    nameAr: 'موظف',
    role: 'غير محدد'
  };
  
  // Validate employee data
  const validatedEmployee = {
    id: employeeData?.id || defaultEmployee.id,
    nameAr: employeeData?.name_ar || employeeData?.name || defaultEmployee.nameAr,
    branch: employeeData?.branch || undefined,
    role: employeeData?.role || defaultEmployee.role,
    salaryPlan: salaryData?.planName ? {
      name: salaryData.planName,
      type: salaryData.planType || 'fixed',
    } : undefined,
  };
  
  // Validate and transform bonus list with fallbacks
  const validatedBonuses = Array.isArray(salaryData?.bonusList) 
    ? salaryData.bonusList.map(bonus => ({
        amount: Number(bonus?.amount || 0),
        description: bonus?.description || 'مكافأة',
        date: bonus?.date || new Date().toISOString().split('T')[0],
      }))
    : [];
  
  // Add target bonus as a separate entry in the bonuses array if it's greater than zero
  const targetBonus = Number(salaryData?.targetBonus || 0);
  if (targetBonus > 0) {
    validatedBonuses.push({
      amount: targetBonus,
      description: 'بونص الأهداف المبيعات',
      date: new Date().toISOString().split('T')[0],
    });
  }
  
  // Validate and transform deductions list with fallbacks
  const validatedDeductions = Array.isArray(salaryData?.deductionsList) 
    ? salaryData.deductionsList.map(deduction => ({
        amount: Number(deduction?.amount || 0),
        description: deduction?.description || 'حسم',
        date: deduction?.date || new Date().toISOString().split('T')[0],
      }))
    : [];
  
  // Validate and transform loans list with fallbacks
  const validatedLoans = Array.isArray(salaryData?.loansList) 
    ? salaryData.loansList.map(loan => ({
        amount: Number(loan?.amount || 0),
        description: loan?.description || 'سلفة',
        date: loan?.date || new Date().toISOString().split('T')[0],
      }))
    : [];
  
  // Calculate totals with fallbacks
  const baseSalary = Number(salaryData?.baseSalary || 0);
  const commission = Number(salaryData?.commission || 0);
  
  // Ensure all earnings are properly added
  const totalBonuses = validatedBonuses.reduce((sum, bonus) => sum + bonus.amount, 0);
  console.log('Payslip data calculation:', { 
    baseSalary, 
    commission, 
    targetBonus, 
    validatedBonuses, 
    totalBonuses 
  });
  const totalEarnings = baseSalary + commission + totalBonuses;
  
  // Ensure all deductions are properly calculated
  const totalDeductions = Number(salaryData?.deductions || 0) + Number(salaryData?.loans || 0);
  
  // Ensure net salary is correct, recalculate if needed
  const providedNetSalary = Number(salaryData?.netSalary || 0);
  const calculatedNetSalary = totalEarnings - totalDeductions;
  
  // Use provided net salary if reasonable, otherwise use calculated
  const netSalary = providedNetSalary > 0 ? providedNetSalary : calculatedNetSalary;
  
  return {
    companyName: 'إكه للعناية بالرجل',
    companyLogoUrl: '/logo_Header/header11.png',
    payPeriod: payPeriod || getCurrentPayPeriod(),
    issueDate: new Date().toISOString().split('T')[0],
    employee: validatedEmployee,
    totalSales: Number(salaryData?.totalSales || 0),
    targetSales: 15000, // Fixed target value of 15,000 SAR
    baseSalary: baseSalary,
    commission: commission,
    commissionRate: salaryData?.commissionRate || (salaryData?.planType === 'dynamic_basic' ? 0.1 : undefined), // Default to 10% for commission plans
    commissionThreshold: salaryData?.commissionThreshold || (salaryData?.planType === 'dynamic_basic' ? 5000 : undefined), // Default threshold
    bonuses: validatedBonuses,
    deductions: validatedDeductions,
    loans: validatedLoans,
    summary: {
      totalEarnings,
      totalDeductions,
      netSalary
    }
  };
};

export { isNegativeAmount, isPositiveAmount } from '@shared/utils/math';

export { calculateTotal } from '@shared/utils/math';

/**
 * Get a summarized version of financial lists for display
 * @param items Array of financial items
 * @param limit Maximum number of items to include
 * @returns Limited array with a summarized "Other" item if needed
 */
export const getSummarizedList = <T extends EmployeeBonus | EmployeeDeduction | EmployeeLoan>(
  items: T[],
  limit: number = 5
): Array<T | { amount: number; description: string; date: string; id?: string }> => {
  if (items.length <= limit) return items;

  const shownItems = items.slice(0, limit - 1);
  const remainingItems = items.slice(limit - 1);
  
  const otherAmount = calculateTotal(remainingItems);
  const otherItem = {
    amount: otherAmount,
    description: `أخرى (${remainingItems.length})`,
    date: new Date().toISOString().split('T')[0],
    id: 'summarized'
  };

  return [...shownItems, otherItem];
};

/**
 * Convert English numerals to Arabic numerals
 * @param value Number or string with English numerals
 * @returns String with Arabic numerals
 */
export { convertToArabic as toArabicNumerals } from '@shared/utils/arabicNumerals';

export { getValueType } from '@shared/utils/math';

export { getReadableFileSize } from '@shared/utils/file';

/**
 * Create a filename for the downloaded payslip
 * @param employeeName Employee name
 * @param payPeriod Pay period string
 * @returns Formatted filename
 */
export const createPayslipFilename = (employeeName: string, payPeriod: string): string => {
  // Remove any special characters that might cause issues in filenames
  const sanitizedName = employeeName.replace(/[^\w\s]/gi, '');
  const sanitizedPeriod = payPeriod.replace(/[^\w\s]/gi, '');
  
  return `payslip_${sanitizedName}_${sanitizedPeriod}.pdf`.replace(/\s+/g, '_');
};

// Saudi Riyal symbol path that can be used in React components
export const SAUDI_RIYAL_SYMBOL = '/Saudi_Riyal_Symbol.svg'; 
