
import { Transaction } from '@/lib/salary/types/salary';
import { SalesData } from '@/lib/salary/calculators/BaseCalculator';

/**
 * Transforms raw sales data to the format expected by salary calculators
 */
export const transformSalesData = (rawSalesData: any): SalesData => {
  return {
    sales_amount: rawSalesData.sales_amount,
    date: rawSalesData.month // Using month as date
  };
};

/**
 * Maps raw transaction data to the Transaction interface
 */
export const mapToTransaction = (rawTransaction: any): Transaction => {
  return {
    id: rawTransaction.id,
    amount: rawTransaction.amount,
    date: rawTransaction.date,
    description: rawTransaction.description,
    employee_id: rawTransaction.employee_id
  };
};

/**
 * Maps arrays of raw transaction data to arrays of Transaction objects
 */
export const mapTransactions = <T extends object>(items: T[]): Transaction[] => {
  return items.map(item => mapToTransaction(item));
};
