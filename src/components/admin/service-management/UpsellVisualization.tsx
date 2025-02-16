
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, ArrowRight, Pencil } from 'lucide-react';
import { Service } from '@/types/service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const fetchServicesWithUpsells = async () => {
  // First, fetch all services
  const { data: services, error: servicesError } = await supabase
    .from('services')
    .select(`
      *,
      category:service_categories (
        id,
        name_en,
        name_ar
      )
    `)
    .order('category_id')
    .order('display_order');

  if (servicesError) throw servicesError;

  // Then fetch all upsell relationships
  const { data: upsells, error: upsellsError } = await supabase
    .from('service_upsells')
    .select('*');

  if (upsellsError) throw upsellsError;

  // Organize services by category and include their upsells
  const serviceMap = new Map(services.map(s => [s.id, { ...s, upsells: [] }]));
  
  upsells.forEach(upsell => {
    const mainService = serviceMap.get(upsell.main_service_id);
    const upsellService = serviceMap.get(upsell.upsell_service_id);
    
    if (mainService && upsellService) {
      if (!mainService.upsells) mainService.upsells = [];
      mainService.upsells.push({
        ...upsellService,
        discount_percentage: upsell.discount_percentage
      });
    }
  });

  // Group services by category
  const groupedServices = Array.from(serviceMap.values()).reduce((acc, service) => {
    const categoryId = service.category_id;
    if (!acc[categoryId]) {
      acc[categoryId] = {
        id: categoryId,
        name: service.category.name_en,
        services: []
      };
    }
    acc[categoryId].services.push(service);
    return acc;
  }, {});

  return Object.values(groupedServices);
};

export const UpsellVisualization = () => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [editingUpsell, setEditingUpsell] = useState<{
    mainServiceId: string;
    upsellServiceId: string;
    percentage: number;
  } | null>(null);

  const queryClient = useQueryClient();
  
  const { data: categories, isLoading } = useQuery({
    queryKey: ['services-upsells'],
    queryFn: fetchServicesWithUpsells
  });

  const updateUpsellMutation = useMutation({
    mutationFn: async ({ mainServiceId, upsellServiceId, percentage }: {
      mainServiceId: string;
      upsellServiceId: string;
      percentage: number;
    }) => {
      const { error } = await supabase
        .from('service_upsells')
        .update({ discount_percentage: percentage })
        .eq('main_service_id', mainServiceId)
        .eq('upsell_service_id', upsellServiceId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services-upsells'] });
      setEditingUpsell(null);
    }
  });

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handlePercentageSubmit = (mainServiceId: string, upsellServiceId: string, percentage: number) => {
    updateUpsellMutation.mutate({ mainServiceId, upsellServiceId, percentage });
  };

  if (isLoading) {
    return <div className="p-4">Loading services and upsells...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">Services & Upsells</h2>
        <div className="space-y-4">
          {categories?.map((category: any) => (
            <div key={category.id} className="border rounded-lg">
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-t-lg"
              >
                {expandedCategories.has(category.id) ? (
                  <ChevronDown className="w-4 h-4 mr-2" />
                ) : (
                  <ChevronRight className="w-4 h-4 mr-2" />
                )}
                <span className="font-medium">{category.name}</span>
              </button>
              
              {expandedCategories.has(category.id) && (
                <div className="p-3 space-y-4">
                  {category.services.map((service: any) => (
                    <div key={service.id} className="pl-6">
                      <div className="font-medium text-gray-900">{service.name_en}</div>
                      {service.upsells?.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {service.upsells.map((upsell: any) => (
                            <div key={upsell.id} className="flex items-center pl-6 gap-2">
                              <ArrowRight className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">{upsell.name_en}</span>
                              <div className="flex items-center gap-2">
                                {editingUpsell?.mainServiceId === service.id && 
                                 editingUpsell?.upsellServiceId === upsell.id ? (
                                  <form
                                    onSubmit={(e) => {
                                      e.preventDefault();
                                      handlePercentageSubmit(
                                        service.id,
                                        upsell.id,
                                        Number(editingUpsell.percentage)
                                      );
                                    }}
                                    className="flex items-center gap-2"
                                  >
                                    <Input
                                      type="number"
                                      value={editingUpsell.percentage}
                                      onChange={(e) => setEditingUpsell({
                                        ...editingUpsell,
                                        percentage: Number(e.target.value)
                                      })}
                                      className="w-20 h-8"
                                      min="0"
                                      max="100"
                                    />
                                    <Button
                                      type="submit"
                                      size="sm"
                                      variant="ghost"
                                      className="h-8"
                                    >
                                      Save
                                    </Button>
                                  </form>
                                ) : (
                                  <>
                                    <span className="text-sm text-gray-500">
                                      {upsell.discount_percentage}%
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      onClick={() => setEditingUpsell({
                                        mainServiceId: service.id,
                                        upsellServiceId: upsell.id,
                                        percentage: upsell.discount_percentage
                                      })}
                                    >
                                      <Pencil className="w-4 h-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
