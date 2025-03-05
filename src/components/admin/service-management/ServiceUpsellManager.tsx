
import { useState, useEffect } from 'react';
import { Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Service } from '@/types/service';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from "@/contexts/LanguageContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface ServiceWithUpsells extends Service {
  upsells?: Array<{
    id: string;
    upsell_service_id: string;
    discount_percentage: number;
    upsell: Service;
  }>;
}

export const ServiceUpsellManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { language } = useLanguage();
  const [editingUpsell, setEditingUpsell] = useState<{
    id: string;
    discount: number;
  } | null>(null);

  // Fetch services with their upsells
  const { data: servicesWithUpsells, isLoading } = useQuery({
    queryKey: ['services-with-upsells'],
    queryFn: async () => {
      // First get all services that have upsells configured
      const { data: upsellRelations, error: upsellError } = await supabase
        .from('service_upsells')
        .select(`
          id,
          main_service_id,
          upsell_service_id,
          discount_percentage,
          upsell:services!service_upsells_upsell_service_id_fkey (
            id, name_en, name_ar, price, duration
          )
        `);

      if (upsellError) throw upsellError;

      // Get unique main service IDs
      const mainServiceIds = [...new Set(upsellRelations.map(rel => rel.main_service_id))];

      // Fetch details of the main services
      const { data: mainServices, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .in('id', mainServiceIds);

      if (servicesError) throw servicesError;

      // Group upsells by main service
      const servicesMap: Record<string, ServiceWithUpsells> = {};
      
      mainServices.forEach(service => {
        servicesMap[service.id] = {
          ...service,
          upsells: []
        };
      });

      upsellRelations.forEach(relation => {
        if (servicesMap[relation.main_service_id]) {
          servicesMap[relation.main_service_id].upsells!.push(relation);
        }
      });

      return Object.values(servicesMap);
    }
  });

  // Mutation to update upsell discount
  const updateUpsellMutation = useMutation({
    mutationFn: async ({ id, discount }: { id: string; discount: number }) => {
      const { error } = await supabase
        .from('service_upsells')
        .update({ discount_percentage: discount })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services-with-upsells'] });
      toast({
        title: "Discount updated",
        description: "The upsell discount has been updated successfully."
      });
      setEditingUpsell(null);
    }
  });

  // Mutation to delete upsell relationship
  const deleteUpsellMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('service_upsells')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services-with-upsells'] });
      toast({
        title: "Upsell removed",
        description: "The upsell relationship has been removed successfully."
      });
    }
  });

  const handleUpdateDiscount = (id: string, discount: number) => {
    if (discount < 0 || discount > 100) {
      toast({
        title: "Invalid discount",
        description: "Discount must be between 0 and 100%",
        variant: "destructive"
      });
      return;
    }

    updateUpsellMutation.mutate({ id, discount });
  };

  const handleDeleteUpsell = (id: string) => {
    deleteUpsellMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Upsell Relationships</h2>
        <Card>
          <CardContent className="p-4">
            <Skeleton className="h-12 w-full mb-4" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!servicesWithUpsells || servicesWithUpsells.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Upsell Relationships</h2>
        <Card>
          <CardContent className="p-4 text-center text-muted-foreground">
            <p>No services with upsell relationships found.</p>
            <p className="text-sm mt-2">Add upsells to services by editing them in the service list above.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Upsell Relationships</h2>
      <p className="text-muted-foreground">Manage upsell relationships between services. Only services with upsells are shown.</p>
      
      <Accordion type="multiple" className="space-y-2">
        {servicesWithUpsells.map(service => (
          <AccordionItem key={service.id} value={service.id} className="border rounded-lg overflow-hidden">
            <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
              <div className="flex justify-between items-center w-full">
                <div>
                  <h3 className="font-medium text-left">
                    {language === 'ar' ? service.name_ar : service.name_en}
                  </h3>
                  <p className="text-sm text-muted-foreground text-left">
                    {service.upsells?.length} upsell{service.upsells?.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Upsell Service</TableHead>
                    <TableHead className="w-32 text-center">Discount</TableHead>
                    <TableHead className="w-32 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {service.upsells?.map(upsell => (
                    <TableRow key={upsell.id}>
                      <TableCell>
                        {language === 'ar' ? upsell.upsell.name_ar : upsell.upsell.name_en}
                      </TableCell>
                      <TableCell className="text-center">
                        {editingUpsell?.id === upsell.id ? (
                          <Input 
                            type="number" 
                            min={0}
                            max={100}
                            value={editingUpsell.discount}
                            onChange={(e) => setEditingUpsell({ 
                              ...editingUpsell, 
                              discount: parseInt(e.target.value) || 0 
                            })}
                            className="w-20 h-8 mx-auto text-center"
                          />
                        ) : (
                          <span>{upsell.discount_percentage}%</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {editingUpsell?.id === upsell.id ? (
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setEditingUpsell(null)}
                              className="h-8 px-2"
                            >
                              Cancel
                            </Button>
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => handleUpdateDiscount(upsell.id, editingUpsell.discount)}
                              className="h-8 px-2"
                            >
                              Save
                            </Button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setEditingUpsell({ id: upsell.id, discount: upsell.discount_percentage })}
                              className="h-8 w-8 p-0"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteUpsell(upsell.id)}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};
