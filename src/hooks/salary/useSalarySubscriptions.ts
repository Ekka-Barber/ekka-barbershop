import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import debounce from 'lodash/debounce';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

// Define specific payload data types for better type safety
interface SalaryPlanRecord {
  id: string;
  employee_id?: string;
  name: string;
  type: string;
  config: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

interface EmployeeBonusRecord {
  id: string;
  employee_id: string;
  amount: number;
  description: string;
  date: string;
  created_at?: string;
  updated_at?: string;
}

interface EmployeeDeductionRecord {
  id: string;
  employee_id: string;
  amount: number;
  description: string;
  date: string;
  created_at?: string;
  updated_at?: string;
}

interface EmployeeSalesRecord {
  id: string;
  employee_id: string;
  month: string;
  amount: number;
  created_at?: string;
  updated_at?: string;
}

// Use a union type for all possible payload record types
type SalaryRelatedRecord = 
  | SalaryPlanRecord 
  | EmployeeBonusRecord 
  | EmployeeDeductionRecord 
  | EmployeeSalesRecord 
  | Record<string, unknown>;

// Type definitions
export interface SalarySubscriptionOptions {
  selectedMonth: string;
  employeeId?: string;
  enableToasts?: boolean;
  onError?: (error: Error) => void;
  refreshData?: () => void;
}

/**
 * Custom hook for subscribing to salary-related database changes
 * Handles real-time updates for multiple tables with filtering and error handling
 */
export function useSalarySubscriptions({
  selectedMonth,
  employeeId,
  enableToasts = true,
  onError,
  refreshData
}: SalarySubscriptionOptions) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    [key: string]: 'subscribed' | 'error' | 'subscribing';
  }>({});

  useEffect(() => {
    const channels = [];
    
    // Helper function to create a channel subscription
    const createSubscription = (
      table: string, 
      filter: string | undefined, 
      queryKey: string[], 
      toastMessage: string | undefined,
      debounceMs: number = 0
    ) => {
      const channelName = `${table}-${selectedMonth}${employeeId ? `-${employeeId}` : ''}`;
      
      const handleDataChange = debounceMs > 0
        ? debounce((payload: RealtimePostgresChangesPayload<SalaryRelatedRecord>) => {
            // Invalidate the query
            queryClient.invalidateQueries({ queryKey });
            
            // Show toast notification if enabled
            if (enableToasts && toastMessage) {
              toast({
                title: toastMessage,
                description: `${payload.eventType} at ${new Date().toLocaleTimeString()}`
              });
            }
            
            // Update the last update time
            setLastUpdateTime(new Date());
            
            // Call the refresh function if provided
            if (refreshData) {
              refreshData();
            }
          }, debounceMs)
        : (payload: RealtimePostgresChangesPayload<SalaryRelatedRecord>) => {
            // Invalidate the query
            queryClient.invalidateQueries({ queryKey });
            
            // Show toast notification if enabled
            if (enableToasts && toastMessage) {
              toast({
                title: toastMessage,
                description: `${payload.eventType} at ${new Date().toLocaleTimeString()}`
              });
            }
            
            // Update the last update time
            setLastUpdateTime(new Date());
            
            // Call the refresh function if provided
            if (refreshData) {
              refreshData();
            }
          };
      
      try {
        setSubscriptionStatus(prev => ({
          ...prev,
          [table]: 'subscribing'
        }));
        
        const channel = supabase
          .channel(channelName)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table,
              filter
            },
            handleDataChange
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              setSubscriptionStatus(prev => ({
                ...prev,
                [table]: 'subscribed'
              }));
            } else {
              setSubscriptionStatus(prev => ({
                ...prev,
                [table]: 'error'
              }));
              
              if (onError) {
                onError(new Error(`Failed to subscribe to ${table}: ${status}`));
              }
            }
          });
        
        channels.push(channel);
      } catch (error) {
        setSubscriptionStatus(prev => ({
          ...prev,
          [table]: 'error'
        }));
        
        if (onError) {
          onError(error instanceof Error ? error : new Error(`Error subscribing to ${table}`));
        }
      }
    };
    
    // Subscription array with all necessary tables
    // 1. Salary plans subscription
    createSubscription(
      'salary_plans',
      employeeId ? `employee_id=eq.${employeeId}` : undefined,
      ['all-salary-plans'],
      'Salary plans have been updated'
    );
    
    // 2. Employee bonuses subscription
    createSubscription(
      'employee_bonuses',
      `date=like.${selectedMonth}%${employeeId ? ` AND employee_id=eq.${employeeId}` : ''}`,
      ['employee-bonuses', selectedMonth],
      'Employee bonuses have been updated'
    );
    
    // 3. Employee deductions subscription
    createSubscription(
      'employee_deductions',
      `date=like.${selectedMonth}%${employeeId ? ` AND employee_id=eq.${employeeId}` : ''}`,
      ['employee-deductions', selectedMonth],
      'Employee deductions have been updated'
    );
    
    // 4. Employee loans subscription
    createSubscription(
      'employee_loans',
      employeeId ? `employee_id=eq.${employeeId}` : undefined,
      ['employee-loans'],
      'Employee loans have been updated'
    );
    
    // 5. Employee sales subscription (debounced due to potentially frequent updates)
    createSubscription(
      'employee_sales',
      `month=eq.${selectedMonth}${employeeId ? ` AND employee_id=eq.${employeeId}` : ''}`,
      ['employee-sales', selectedMonth],
      'Sales data has been updated',
      2000 // 2 second debounce for sales data updates which might be frequent
    );
    
    // 6. Monthly salary payments subscription
    createSubscription(
      'employee_monthly_salary',
      `month_year=eq.${selectedMonth}${employeeId ? ` AND employee_id=eq.${employeeId}` : ''}`,
      ['employee-monthly-salary', selectedMonth],
      'Salary payment records have been updated'
    );
    
    // Cleanup function to remove all channels
    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, [selectedMonth, employeeId, enableToasts, queryClient, toast, onError, refreshData]);
  
  // Check if any subscriptions have errors
  const hasError = Object.values(subscriptionStatus).includes('error');
  
  return {
    hasError,
    lastUpdateTime,
    subscriptionStatus
  };
} 