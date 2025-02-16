
import { useCallback, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Category } from '@/types/service';
import debounce from 'lodash/debounce';

const CATEGORIES_PER_PAGE = 10;

export const useOptimizedCategories = () => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'newest' | 'oldest' | 'services'>('name');
  const [filterBy, setFilterBy] = useState<'all' | 'empty'>('all');
  const queryClient = useQueryClient();

  // Optimized query with pagination and field selection
  const { data: categories, isLoading } = useQuery({
    queryKey: ['service-categories', page],
    queryFn: async () => {
      const start = (page - 1) * CATEGORIES_PER_PAGE;
      const end = start + CATEGORIES_PER_PAGE - 1;

      const { data: categories, error } = await supabase
        .from('service_categories')
        .select(`
          id,
          name_en,
          name_ar,
          display_order,
          created_at,
          services (
            id,
            name_en,
            name_ar,
            price,
            duration,
            display_order
          )
        `)
        .order('display_order')
        .range(start, end);

      if (error) throw error;
      return categories as Category[];
    },
    staleTime: 1000 * 60, // Consider data fresh for 1 minute
    cacheTime: 1000 * 60 * 5, // Keep in cache for 5 minutes
  });

  // Memoized filtering
  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    
    return categories.filter(category => {
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchCategory = 
          category.name_en.toLowerCase().includes(searchLower) ||
          category.name_ar.toLowerCase().includes(searchLower);
        const matchServices = category.services?.some(service =>
          service.name_en.toLowerCase().includes(searchLower) ||
          service.name_ar.toLowerCase().includes(searchLower)
        );
        return matchCategory || matchServices;
      }
      
      if (filterBy === 'empty') {
        return !category.services?.length;
      }
      
      return true;
    });
  }, [categories, searchQuery, filterBy]);

  // Memoized sorting
  const sortedCategories = useMemo(() => {
    if (!filteredCategories.length) return [];

    return [...filteredCategories].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'services':
          return (b.services?.length || 0) - (a.services?.length || 0);
        default:
          return a.name_en.localeCompare(b.name_en);
      }
    });
  }, [filteredCategories, sortBy]);

  // Memoized total services calculation
  const totalServices = useMemo(() => 
    categories?.reduce((acc, category) => acc + (category.services?.length || 0), 0) || 0,
    [categories]
  );

  // Debounced search handler
  const debouncedSetSearch = useCallback(
    debounce((value: string) => setSearchQuery(value), 300),
    []
  );

  // Optimized real-time subscription setup
  const setupRealtimeSubscription = useCallback(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', 
        { 
          event: 'INSERT',
          schema: 'public',
          table: 'service_categories'
        },
        (payload) => {
          queryClient.setQueryData(['service-categories', page], (old: Category[] | undefined) => {
            if (!old) return [payload.new as Category];
            return [...old, payload.new as Category];
          });
        }
      )
      .on('postgres_changes',
        { 
          event: 'UPDATE',
          schema: 'public',
          table: 'service_categories'
        },
        (payload) => {
          queryClient.setQueryData(['service-categories', page], (old: Category[] | undefined) => {
            if (!old) return [];
            return old.map(category => 
              category.id === payload.new.id ? { ...category, ...payload.new } : category
            );
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [page, queryClient]);

  return {
    categories: sortedCategories,
    isLoading,
    totalServices,
    page,
    setPage,
    setSearchQuery: debouncedSetSearch,
    setSortBy,
    setFilterBy,
    setupRealtimeSubscription
  };
};
