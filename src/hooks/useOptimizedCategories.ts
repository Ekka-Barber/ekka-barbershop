import { useCallback, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getSupabaseClient } from '@/services/supabaseService';
import type { Category } from '@/types/service';
import debounce from 'lodash/debounce';

const CATEGORIES_PER_PAGE = 10;

export type SortType = 'name' | 'newest' | 'oldest' | 'services';

export const useOptimizedCategories = () => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortType>('name');
  const queryClient = useQueryClient();

  const fetchCategories = async () => {
    const start = (page - 1) * CATEGORIES_PER_PAGE;
    const end = start + CATEGORIES_PER_PAGE - 1;

    const supabase = await getSupabaseClient();
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
          description_en,
          description_ar,
          price,
          duration,
          category_id,
          display_order,
          discount_type,
          discount_value
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
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  const searchLower = useMemo(() => searchQuery.toLowerCase(), [searchQuery]);
  
  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    
    if (!searchQuery) return categories;
    
    return categories.filter(category => {
      const matchCategory = 
        category.name_en.toLowerCase().includes(searchLower) ||
        category.name_ar.toLowerCase().includes(searchLower);
        
      if (matchCategory) return true;
      
      const matchServices = category.services?.some(service =>
        service.name_en.toLowerCase().includes(searchLower) ||
        service.name_ar.toLowerCase().includes(searchLower)
      );
      
      return matchServices;
    });
  }, [categories, searchQuery, searchLower]);

  const sortedCategories = useMemo(() => {
    if (!filteredCategories.length) return [];

    return [...filteredCategories].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
        case 'oldest':
          return new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime();
        case 'services':
          return (b.services?.length || 0) - (a.services?.length || 0);
        default:
          return (a.display_order || 0) - (b.display_order || 0);
      }
    });
  }, [filteredCategories, sortBy]);

  const totalServices = useMemo(() => 
    categories?.reduce((acc, category) => acc + (category.services?.length || 0), 0) || 0,
    [categories]
  );

  const debouncedSetSearch = useMemo(
    () => debounce((value: string) => setSearchQuery(value), 300),
    []
  );

  const handleSortChange = useCallback((value: string) => {
    setSortBy(value as SortType);
  }, []);

  const setupRealtimeSubscription = useCallback(async () => {
    const supabase = await getSupabaseClient();
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'service_categories'
        },
        () => {
          void queryClient.invalidateQueries({
            queryKey: ['service-categories']
          });
        }
      )
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'services'
        },
        () => {
          void queryClient.invalidateQueries({
            queryKey: ['service-categories']
          });
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
    setupRealtimeSubscription
  };
};
