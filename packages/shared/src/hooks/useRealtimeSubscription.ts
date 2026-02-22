import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import { supabase } from '@shared/lib/supabase/client';

type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

interface UseRealtimeSubscriptionOptions {
  table: string;
  queryKeys: readonly (readonly unknown[])[];
  schema?: string;
  event?: RealtimeEvent;
  filter?: string;
  enabled?: boolean;
}

export function useRealtimeSubscription({
  table,
  queryKeys,
  schema = 'public',
  event = '*',
  filter,
  enabled = true,
}: UseRealtimeSubscriptionOptions): void {
  const queryClient = useQueryClient();

  const queryKeysRef = useRef(queryKeys);
  queryKeysRef.current = queryKeys;

  useEffect(() => {
    if (!enabled) return;

    const uid = Math.random().toString(36).slice(2, 8);
    const channelName = `rt_${schema}_${table}_${event}_${uid}`;

    const channel = supabase.channel(channelName);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (channel as any).on(
      'postgres_changes',
      {
        event,
        schema,
        table,
        ...(filter ? { filter } : {}),
      },
      () => {
        for (const key of queryKeysRef.current) {
          void queryClient.invalidateQueries({ queryKey: key });
        }
      },
    );

    channel.subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [table, schema, event, filter, enabled, queryClient]);
}
