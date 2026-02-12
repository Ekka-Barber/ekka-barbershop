import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import { supabase } from '@shared/lib/supabase/client';

type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

interface UseRealtimeSubscriptionOptions {
  /** Supabase table name to subscribe to */
  table: string;
  /** React Query key(s) to invalidate when a change occurs */
  queryKeys: readonly unknown[][];
  /** Schema to listen on (defaults to 'public') */
  schema?: string;
  /** Which events to listen for (defaults to '*' = all) */
  event?: RealtimeEvent;
  /** Optional filter string, e.g. 'branch_id=eq.xxx' */
  filter?: string;
  /** Whether the subscription is enabled (defaults to true) */
  enabled?: boolean;
}

/**
 * Generic hook that subscribes to Supabase Realtime postgres_changes
 * and invalidates the specified React Query keys when a change occurs.
 *
 * @example
 * ```ts
 * useRealtimeSubscription({
 *   table: 'employees',
 *   queryKeys: [['employees'], ['employees', selectedBranch]],
 * });
 * ```
 */
export function useRealtimeSubscription({
  table,
  queryKeys,
  schema = 'public',
  event = '*',
  filter,
  enabled = true,
}: UseRealtimeSubscriptionOptions): void {
  const queryClient = useQueryClient();

  // Stable ref for queryKeys so the effect doesn't re-run on every render
  const queryKeysRef = useRef(queryKeys);
  queryKeysRef.current = queryKeys;

  useEffect(() => {
    if (!enabled) return;

    // Unique channel name per hook instance to avoid cleanup conflicts
    const uid = Math.random().toString(36).slice(2, 8);
    const channelName = `rt_${schema}_${table}_${event}_${uid}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event,
          schema,
          table,
          ...(filter ? { filter } : {}),
        },
        () => {
          // Invalidate all specified query keys so React Query refetches
          for (const key of queryKeysRef.current) {
            void queryClient.invalidateQueries({ queryKey: key });
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [table, schema, event, filter, enabled, queryClient]);
}
