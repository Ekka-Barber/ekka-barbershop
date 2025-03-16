
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { validateService } from '@/utils/serviceValidation';

/**
 * Hook for fetching service categories data
 */
export const useCategoryData = (branchId?: string) => {
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['service_categories', branchId],
    queryFn: async () => {
      // First, get category IDs that are assigned to this branch if branch is specified
      let categoryIds: string[] = [];
      
      if (branchId) {
        const { data: branchCategories, error: branchCategoryError } = await supabase
          .from('branch_categories')
          .select('category_id')
          .eq('branch_id', branchId);
        
        if (branchCategoryError) {
          console.error('Error fetching branch categories:', branchCategoryError);
          throw branchCategoryError;
        }
        
        categoryIds = branchCategories.map(item => item.category_id);
        
        // If no categories assigned to this branch, return empty array
        if (categoryIds.length === 0) {
          return [];
        }
      }
      
      // Get all categories or filter by IDs if branch is specified
      let categoryQuery = supabase
        .from('service_categories')
        .select(`
          id,
          name_en,
          name_ar,
          display_order,
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
        .order('display_order', { ascending: true });
      
      // Add filter if branch is specified
      if (branchId && categoryIds.length > 0) {
        categoryQuery = categoryQuery.in('id', categoryIds);
      }
      
      const { data: categories, error: categoriesError } = await categoryQuery;
      
      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError);
        throw categoriesError;
      }
      
      // Process categories
      let processedCategories = categories?.map(category => ({
        ...category,
        services: category.services
          .map(service => ({
            ...service,
            category_id: category.id // Ensure category_id is set
          }))
          .map(validateService)
          .filter(Boolean) // Remove null values from invalid services
          .sort((a, b) => (a?.display_order || 0) - (b?.display_order || 0))
      }));
      
      // If branch is specified, filter services to only show those assigned to this branch
      if (branchId) {
        // Get service IDs that are assigned to this branch
        const { data: branchServices, error: branchServiceError } = await supabase
          .from('branch_services')
          .select('service_id')
          .eq('branch_id', branchId);
        
        if (branchServiceError) {
          console.error('Error fetching branch services:', branchServiceError);
          throw branchServiceError;
        }
        
        const serviceIds = branchServices.map(item => item.service_id);
        
        // Filter services in each category
        processedCategories = processedCategories?.map(category => ({
          ...category,
          services: category.services.filter(service => serviceIds.includes(service.id))
        }));
        
        // Remove categories with no services
        processedCategories = processedCategories?.filter(category => category.services.length > 0);
      }
      
      return processedCategories;
    },
    enabled: true, // Always fetch categories
  });

  const { data: employees, isLoading: employeesLoading } = useQuery({
    queryKey: ['employees', branchId],
    queryFn: async () => {
      if (!branchId) return [];
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('branch_id', branchId);
      
      if (error) throw error;
      return data;
    },
    enabled: !!branchId,
  });

  return {
    categories,
    categoriesLoading,
    employees,
    employeesLoading
  };
};
