import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { TIME } from '@shared/constants/time';
import { useRealtimeSubscription } from '@shared/hooks/useRealtimeSubscription';
import { queryKeys } from '@shared/lib/query-keys';
import { supabase } from '@shared/lib/supabase/client';

import { useAppStore } from '@/app/stores/appStore';

export const useBranches = () => {
  const { branches, setBranches, setLoadingBranches, isLoadingBranches } =
    useAppStore();

  const {
    data: queriedBranches,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.branches(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .order('name');

      if (error) throw error;
      return data;
    },
    staleTime: 5 * TIME.SECONDS_PER_MINUTE * TIME.SECOND_IN_MS, // 5 minutes
    gcTime: 10 * TIME.SECONDS_PER_MINUTE * TIME.SECOND_IN_MS, // 10 minutes
  });

  // Sync React Query data with Zustand store
  useEffect(() => {
    if (queriedBranches) {
      setBranches(queriedBranches);
    }
  }, [queriedBranches, setBranches]);

  // Sync loading state with store
  useEffect(() => {
    setLoadingBranches(isLoading);
  }, [isLoading, setLoadingBranches]);

  // Realtime: auto-refetch when branches change in the database
  useRealtimeSubscription({
    table: 'branches',
    queryKeys: [queryKeys.branches()],
  });

  return {
    data: queriedBranches,
    branches,
    isLoading: isLoading || isLoadingBranches,
    error,
    refetch,
  };
};
