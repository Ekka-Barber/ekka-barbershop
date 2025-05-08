import { useState, useEffect, useCallback } from 'react';
import { format, subMonths } from 'date-fns';
import { supabase } from "@/integrations/supabase/client";
import { Employee, EmployeeSales } from '@/types/employee';
import { logger } from '@/utils/logger';

export interface SalesAnalytics {
  totalSales: number;
  averageSales: number;
  previousMonthComparison: number | null;
  topPerformer: {
    employeeId: string;
    employeeName: string;
    amount: number;
  } | null;
}

export const useEmployeeSales = (selectedDate: Date, employees: Employee[]) => {
  const [salesInputs, setSalesInputs] = useState<Record<string, string>>({});
  const [existingSales, setExistingSales] = useState<EmployeeSales[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [salesAnalytics, setSalesAnalytics] = useState<SalesAnalytics>({
    totalSales: 0,
    averageSales: 0,
    previousMonthComparison: null,
    topPerformer: null
  });

  // Reset the form when date or employees change
  useEffect(() => {
    if (employees.length > 0) {
      fetchSalesData();
    } else {
      setSalesInputs({});
      setExistingSales([]);
      setLastUpdated(null);
    }
  }, [selectedDate, employees]);

  // Enhanced fetchSalesData function
  const fetchSalesData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Format date as YYYY-MM-01 to get the first day of the month
      const monthString = format(selectedDate, 'yyyy-MM-01');
      logger.info('Fetching sales data for month:', monthString);
      
      // DO NOT CHANGE - PRESERVE API LOGIC
      // Fetch sales data for the selected month
      const { data, error } = await supabase
        .from('employee_sales')
        .select('*')
        .eq('month', monthString);
      
      if (error) throw new Error(error.message);
      
      logger.info('Fetched sales data:', data?.length);
      
      // Initialize sales inputs with existing data
      const initialSalesInputs: Record<string, string> = {};
      
      // First reset inputs for all employees to empty string
      employees.forEach(employee => {
        initialSalesInputs[employee.id] = '';
      });
      
      // Store the fetched sales data
      if (data) {
        // Filter out sales records where employee_id is null and cast to EmployeeSales[]
        const validSalesData = (data as EmployeeSales[]).filter(
          (sale): sale is EmployeeSales & { employee_id: string } => 
          sale.employee_id !== null && sale.employee_id !== undefined
        );
        
        setExistingSales(validSalesData);
        
        // Store the last updated timestamp from the most recent record
        if (validSalesData.length > 0) {
          // Sort by updated_at in descending order to get the most recent update
          const sortedData = [...validSalesData].sort((a, b) => 
            new Date(b.updated_at || '').getTime() - new Date(a.updated_at || '').getTime()
          );
          
          if (sortedData[0].updated_at) {
            setLastUpdated(format(new Date(sortedData[0].updated_at), 'yyyy-MM-dd HH:mm:ss'));
          }
          
          // Then populate sales inputs with existing data where available
          validSalesData.forEach(sale => {
            // We know employee_id exists because of the type guard in filter
            initialSalesInputs[sale.employee_id] = Math.floor(sale.sales_amount).toString();
          });
          
          // Calculate analytics for the current month
          await calculateSalesAnalytics(validSalesData);
        } else {
          setLastUpdated(null);
        }
      } else {
        setExistingSales([]);
        setLastUpdated(null);
        setSalesAnalytics({
          totalSales: 0,
          averageSales: 0,
          previousMonthComparison: null,
          topPerformer: null
        });
      }
      
      logger.info('Setting initial sales inputs:', Object.keys(initialSalesInputs).length);
      setSalesInputs(initialSalesInputs);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error fetching sales data';
      logger.error('Error fetching sales data:', errorMessage);
      setError(err instanceof Error ? err : new Error(errorMessage));
      
      // Still initialize empty inputs for all employees on error
      const emptyInputs: Record<string, string> = {};
      employees.forEach(employee => {
        emptyInputs[employee.id] = '';
      });
      setSalesInputs(emptyInputs);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate, employees]);

  // Calculate sales analytics including comparison with previous month
  const calculateSalesAnalytics = async (salesData: EmployeeSales[]) => {
    try {
      // Calculate total and average sales for current month
      const totalSales = salesData.reduce((sum, sale) => sum + sale.sales_amount, 0);
      const averageSales = totalSales / salesData.length;
      
      // Find top performer
      let topPerformer: SalesAnalytics['topPerformer'] = null;
      if (salesData.length > 0) {
        const sortedBySales = [...salesData].sort((a, b) => b.sales_amount - a.sales_amount);
        const topSale = sortedBySales[0];
        if (topSale && topSale.employee_id) {
          topPerformer = {
            employeeId: topSale.employee_id,
            employeeName: topSale.employee_name,
            amount: topSale.sales_amount
          };
        }
      }
      
      // Get previous month's data for comparison
      const previousMonth = subMonths(selectedDate, 1);
      const previousMonthString = format(previousMonth, 'yyyy-MM-01');
      
      const { data: prevMonthData, error: prevMonthError } = await supabase
        .from('employee_sales')
        .select('*')
        .eq('month', previousMonthString);
      
      let previousMonthComparison: number | null = null;
      
      if (!prevMonthError && prevMonthData && prevMonthData.length > 0) {
        const prevMonthTotal = prevMonthData.reduce(
          (sum, sale) => sum + (sale.sales_amount || 0), 
          0
        );
        
        if (prevMonthTotal > 0) {
          // Calculate percentage change ((current - previous) / previous) * 100
          previousMonthComparison = ((totalSales - prevMonthTotal) / prevMonthTotal) * 100;
        }
      }
      
      // Update analytics state
      setSalesAnalytics({
        totalSales,
        averageSales,
        previousMonthComparison,
        topPerformer
      });
      
    } catch (err) {
      logger.error('Error calculating sales analytics:', err);
      // Default to basic analytics without comparison if there's an error
      const totalSales = salesData.reduce((sum, sale) => sum + sale.sales_amount, 0);
      setSalesAnalytics({
        totalSales,
        averageSales: totalSales / salesData.length,
        previousMonthComparison: null,
        topPerformer: null
      });
    }
  };

  const handleSalesChange = useCallback((employeeId: string, value: string) => {
    // Only accept whole numbers (no decimals)
    if (value === '' || (/^\d+$/.test(value) && !value.includes('.'))) {
      setSalesInputs(prev => ({
        ...prev,
        [employeeId]: value
      }));
    }
  }, []);

  const submitSalesData = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Format date as YYYY-MM-01 to get the first day of the month
      const monthString = format(selectedDate, 'yyyy-MM-01');
      
      // Validate sales data
      const invalidEntries = Object.entries(salesInputs)
        .filter(([, value]) => value !== '' && !(/^\d+$/.test(value)));
      
      if (invalidEntries.length > 0) {
        throw new Error('Invalid sales amounts detected. Please enter whole numbers only.');
      }
      
      // Filter out empty values and prepare sales data
      const salesDataEntries = Object.entries(salesInputs)
        .filter(([, value]) => value !== '');
      
      if (salesDataEntries.length === 0) {
        throw new Error('No sales data to save. Please enter at least one sales amount.');
      }
      
      // Find existing sales entries by employee_id and month
      const existingEmployeeSalesById = new Map<string, EmployeeSales>();
      
      // Only add sales with valid employee_id to the map
      existingSales.forEach(sale => {
        if (sale.employee_id) {
          existingEmployeeSalesById.set(sale.employee_id, sale);
        }
      });
      
      // Prepare data for upsert (both inserts and updates)
      const upsertData = [];
      
      // Process each sales entry
      for (const [employeeId, salesAmount] of salesDataEntries) {
        const existingSale = existingEmployeeSalesById.get(employeeId);
        
        // Find the employee to get their name
        const employee = employees.find(e => e.id === employeeId);
        if (!employee) continue; // Skip if employee not found
        
        const salesRecord = {
          employee_id: employeeId,
          employee_name: employee.name, // Keep employee_name for backward compatibility
          month: monthString,
          sales_amount: parseInt(salesAmount, 10),
        };

        if (existingSale) {
          // Include id for updates
          upsertData.push({
            id: existingSale.id,
            ...salesRecord
          });
        } else {
          // No id for inserts
          upsertData.push(salesRecord);
        }
      }
      
      logger.info('Data to upsert:', upsertData.length);
      
      // DO NOT CHANGE - PRESERVE API LOGIC
      // Perform bulk upsert operation
      if (upsertData.length > 0) {
        const { error } = await supabase
          .from('employee_sales')
          .upsert(upsertData, { 
            onConflict: 'id',
            ignoreDuplicates: false // We want to update if there's a conflict
          });
        
        if (error) throw new Error(error.message);
      }
      
      // Refresh sales data to show the latest updates
      await fetchSalesData();
      
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error submitting sales data';
      logger.error('Error submitting sales data:', errorMessage);
      setError(err instanceof Error ? err : new Error(errorMessage));
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if there are any unsaved changes
  const hasUnsavedChanges = useCallback(() => {
    // Create a map of existing sales for quick lookup
    const existingSalesMap = new Map<string, number>();
    existingSales.forEach(sale => {
      if (sale.employee_id) {
        existingSalesMap.set(sale.employee_id, sale.sales_amount);
      }
    });
    
    // Check if any sales input differs from the existing data
    for (const [employeeId, inputValue] of Object.entries(salesInputs)) {
      const existingValue = existingSalesMap.get(employeeId);
      const numericInputValue = inputValue === '' ? 0 : parseInt(inputValue, 10);
      
      if (existingValue !== numericInputValue) {
        return true;
      }
    }
    
    return false;
  }, [salesInputs, existingSales]);

  return {
    salesInputs,
    existingSales,
    isSubmitting,
    isLoading,
    error,
    lastUpdated,
    salesAnalytics,
    handleSalesChange,
    submitSalesData,
    hasUnsavedChanges,
    fetchSalesData
  };
};
