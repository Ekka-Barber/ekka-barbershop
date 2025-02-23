import { useCallback, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Category } from '@/types/service';
import debounce from 'lodash/debounce';

const CATEGORIES_PER_PAGE = 10;

export type SortType = 'name' | 'newest' | 'oldest' | 'services';
export type FilterType = 'all' | 'empty';

export const useOptimizedCategories = () => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortType>('name');
  const [filterBy, setFilterBy] = useState<FilterType>('all');
  const queryClient = useQueryClient();

  const fetchCategories = async () => {
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
          category_id,
          display_order
        )
      `)
      .order('display_order')
      .range(start, end);

    if (error) throw error;

    const categoriesWithSortedServices = categories?.map(category => ({
      ...category,
      services: category.services?.sort((a, b) => a.display_order - b.display_order)
    }));

    return categoriesWithSortedServices as Category[];
  };

  const { data: categories, isLoading } = useQuery({
    queryKey: ['service-categories', page],
    queryFn: fetchCategories,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
  });

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
          return a.display_order - b.display_order;
      }
    });
  }, [filteredCategories, sortBy]);

  const totalServices = useMemo(() => 
    categories?.reduce((acc, category) => acc + (category.services?.length || 0), 0) || 0,
    [categories]
  );

  const debouncedSetSearch = useCallback(
    debounce((value: string) => setSearchQuery(value), 300),
    []
  );

  const handleSortChange = useCallback((value: string) => {
    setSortBy(value as SortType);
  }, []);

  const handleFilterChange = useCallback((value: string) => {
    setFilterBy(value as FilterType);
  }, []);

  const setupRealtimeSubscription = useCallback(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', 
        { 
          event: '*',
          schema: 'public',
          table: 'service_categories'
        },
        () => {
          void queryClient.invalidateQueries({ queryKey: ['service-categories'] });
        }
      )
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'services'
        },
        () => {
          void queryClient.invalidateQueries({ queryKey: ['service-categories'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return {
    categories: sortedCategories,
    isLoading,
    totalServices,
    page,
    setPage,
    setSearchQuery: debouncedSetSearch,
    setSortBy: handleSortChange,
    setFilterBy: handleFilterChange,
    setupRealtimeSubscription
  };
};
