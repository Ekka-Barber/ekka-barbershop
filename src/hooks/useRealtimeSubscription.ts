import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import debounce from 'lodash/debounce';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export type PostgresChangesEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

export interface RealtimeSubscriptionConfig {
  table: string;
  filter?: string;
  queryKey: unknown[];
  enableToast?: boolean;
  toastMessage?: string;
  onDataChange?: (payload: RealtimePostgresChangesPayload<any>) => void;
  debounceMs?: number;
  onError?: (error: Error) => void;
}

/**
 * Hook for setting up Supabase real-time subscriptions that invalidate React Query cache on data changes
 * 
 * @param options Configuration options for the subscription
 * @returns void
 * 
 * @example
 * ```tsx
 * // Basic usage
 * useRealtimeSubscription({
 *   table: 'employees',
 *   queryKey: ['employees', branchId]
 * });
 * 
 * // With custom filter and toast notifications
 * useRealtimeSubscription({
 *   table: 'employee_sales',
 *   filter: `employee_id=eq.${employeeId}`,
 *   queryKey: ['employee-sales', employeeId],
 *   enableToast: true,
 *   toastMessage: 'Sales data has been updated'
 * });
 * ```
 */
export function useRealtimeSubscription({
  table,
  filter,
  queryKey,
  enableToast = false,
  toastMessage,
  onDataChange,
  debounceMs = 0,
  onError
}: RealtimeSubscriptionConfig) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const subscription = useRef(null);
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    // Handler function with optional debouncing
    const handleChange = debounceMs > 0
      ? debounce((payload: RealtimePostgresChangesPayload<any>) => {
          queryClient.invalidateQueries(queryKey);
          
          if (enableToast && toastMessage) {
            toast({
              title: toastMessage,
              description: `${payload.eventType} at ${new Date().toLocaleTimeString()}`,
            });
          }
          
          if (onDataChange) {
            onDataChange(payload);
          }
        }, debounceMs)
      : (payload: RealtimePostgresChangesPayload<any>) => {
          queryClient.invalidateQueries(queryKey);
          
          if (enableToast && toastMessage) {
            toast({
              title: toastMessage,
              description: `${payload.eventType} at ${new Date().toLocaleTimeString()}`,
            });
          }
          
          if (onDataChange) {
            onDataChange(payload);
          }
        };

    try {
      // Create channel with appropriate filters
      const channel = supabase
        .channel(`${table}-changes-${queryKey.join('-')}`)
        .on(
          'postgres_changes',
          {
            event: '*' as PostgresChangesEvent, 
            schema: 'public',
            table,
            filter: filter ? filter : undefined,
          },
          handleChange
        )
        .subscribe((status) => {
          if (status !== 'SUBSCRIBED') {
            setHasError(true);
            if (onError) onError(new Error(`Failed to subscribe to ${table}: ${status}`));
          } else {
            setHasError(false);
          }
        });
      
      subscription.current = channel;
    } catch (error) {
      setHasError(true);
      if (onError) onError(error instanceof Error ? error : new Error(String(error)));
      console.error(`Error setting up subscription for ${table}:`, error);
    }
    
    // Cleanup subscription on unmount
    return () => {
      if (subscription.current) {
        try {
          supabase.removeChannel(subscription.current);
        } catch (error) {
          console.error(`Error removing channel for ${table}:`, error);
        }
      }
    };
  }, [table, filter, JSON.stringify(queryKey), enableToast, toastMessage, debounceMs, queryClient, toast, onDataChange, onError]);
  
  return { hasError };
}

/**
 * Hook for managing multiple Supabase real-time subscriptions
 * 
 * @param subscriptions Array of subscription options
 * @returns void
 * 
 * @example
 * ```tsx
 * useMultipleRealtimeSubscriptions([
 *   {
 *     table: 'employees',
 *     queryKey: ['employees', branchId]
 *   },
 *   {
 *     table: 'salary_plans',
 *     queryKey: ['salary-plans']
 *   }
 * ]);
 * ```
 */
export function useMultipleRealtimeSubscriptions(
  subscriptionsConfig: RealtimeSubscriptionConfig[]
) {
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    const newErrors: Record<string, boolean> = {};
    const cleanupFunctions: (() => void)[] = [];
    
    subscriptionsConfig.forEach((config, index) => {
      const subscriptionKey = `${config.table}-${index}`;
      
      const handleError = (err: Error) => {
        setErrors(prev => ({
          ...prev,
          [subscriptionKey]: true
        }));
        if (config.onError) config.onError(err);
      };
      
      // Set up this specific subscription
      const singleConfig = {
        ...config,
        onError: handleError
      };
      
      try {
        // Set up Supabase subscription
        const channel = supabase
          .channel(`${config.table}-changes-${config.queryKey.join('-')}-${index}`)
          .on(
            'postgres_changes',
            {
              event: '*' as PostgresChangesEvent,
              schema: 'public',
              table: config.table,
              filter: config.filter ? config.filter : undefined,
            },
            config.debounceMs && config.debounceMs > 0
              ? debounce((payload: RealtimePostgresChangesPayload<any>) => {
                  const queryClient = useQueryClient();
                  queryClient.invalidateQueries(config.queryKey);
                  
                  if (config.enableToast && config.toastMessage) {
                    const { toast } = useToast();
                    toast({
                      title: config.toastMessage,
                      description: `${payload.eventType} at ${new Date().toLocaleTimeString()}`,
                    });
                  }
                  
                  if (config.onDataChange) {
                    config.onDataChange(payload);
                  }
                }, config.debounceMs)
              : (payload: RealtimePostgresChangesPayload<any>) => {
                  const queryClient = useQueryClient();
                  queryClient.invalidateQueries(config.queryKey);
                  
                  if (config.enableToast && config.toastMessage) {
                    const { toast } = useToast();
                    toast({
                      title: config.toastMessage,
                      description: `${payload.eventType} at ${new Date().toLocaleTimeString()}`,
                    });
                  }
                  
                  if (config.onDataChange) {
                    config.onDataChange(payload);
                  }
                }
          )
          .subscribe((status) => {
            if (status !== 'SUBSCRIBED') {
              setErrors(prev => ({
                ...prev,
                [subscriptionKey]: true
              }));
              if (config.onError) config.onError(new Error(`Failed to subscribe to ${config.table}: ${status}`));
            } else {
              setErrors(prev => ({
                ...prev,
                [subscriptionKey]: false
              }));
            }
          });
        
        // Add cleanup function
        cleanupFunctions.push(() => {
          try {
            supabase.removeChannel(channel);
          } catch (error) {
            console.error(`Error removing channel for ${config.table}:`, error);
          }
        });
      } catch (error) {
        setErrors(prev => ({
          ...prev,
          [subscriptionKey]: true
        }));
        if (config.onError) config.onError(error instanceof Error ? error : new Error(String(error)));
        console.error(`Error setting up subscription for ${config.table}:`, error);
      }
    });
    
    // Return cleanup function that calls all individual cleanup functions
    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, [subscriptionsConfig]);
  
  const hasAnyError = Object.values(errors).some(Boolean);
  
  return { errors, hasAnyError };
}
