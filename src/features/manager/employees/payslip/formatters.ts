import { PayslipData, PayslipButtonProps } from '@/features/manager/types/payslip';

/**
 * Get the current pay period (month and year) in Gregorian format
 */
const getCurrentPayPeriod = (): string => {
  const date = new Date();
  try {
    // Use Arabic locale with Gregorian calendar for consistency
    return new Intl.DateTimeFormat('ar', {
      year: 'numeric',
      month: 'long',
      calendar: 'gregory'
    }).format(date);
  } catch {
    // Fallback to basic format
    return `${date.getMonth() + 1}/${date.getFullYear()}`;
  }
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
