import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Category, Service } from '@/types/service';
import { ServiceForm } from './ServiceForm';
import { useServiceForm } from '@/hooks/useServiceForm';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";

type ServiceDialogProps = {
  categories: Category[] | undefined;
  editService?: Service;
  onSuccess?: () => void;
  trigger?: React.ReactElement;
};

export const ServiceDialog = ({ categories, editService, onSuccess, trigger }: ServiceDialogProps) => {
  const [isExpanded, setIsExpanded] = useState<string>('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUpsells, setSelectedUpsells] = useState<Array<{ serviceId: string; discountPercentage: number }>>([]);

  const { data: services } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*');
      if (error) throw error;
      return data as Service[];
    }
  });

  const { data: existingUpsells } = useQuery({
    queryKey: ['service-upsells', editService?.id],
    queryFn: async () => {
      if (!editService?.id) return [];
      const { data, error } = await supabase
        .from('service_upsells')
        .select('*')
        .eq('main_service_id', editService.id);
      if (error) throw error;
      return data;
    },
    enabled: !!editService?.id
  });

  useEffect(() => {
    if (existingUpsells) {
      setSelectedUpsells(
        existingUpsells.map(upsell => ({
          serviceId: upsell.upsell_service_id,
          discountPercentage: upsell.discount_percentage
        }))
      );
    }
  }, [existingUpsells]);

  const upsellMutation = useMutation({
    mutationFn: async ({ serviceId, upsells }: { serviceId: string, upsells: typeof selectedUpsells }) => {
      // First, delete existing upsells
      await supabase
        .from('service_upsells')
        .delete()
        .eq('main_service_id', serviceId);

      // Then insert new ones
      if (upsells.length > 0) {
        const { error } = await supabase
          .from('service_upsells')
          .insert(
            upsells.map(upsell => ({
              main_service_id: serviceId,
              upsell_service_id: upsell.serviceId,
              discount_percentage: upsell.discountPercentage
            }))
          );
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-upsells'] });
    }
  });

  const { newService, setNewService, addService, updateService, isLoading } = useServiceForm(async () => {
    const serviceId = editService?.id || newService.id;
    if (serviceId) {
      await upsellMutation.mutateAsync({
        serviceId,
        upsells: selectedUpsells
      });
    }
    setIsExpanded('');
    onSuccess?.();
    toast({
      title: "Success",
      description: editService 
        ? "Service has been updated successfully"
        : "Service has been added successfully",
    });
  });

  useEffect(() => {
    if (editService) {
      setNewService(editService);
    }
  }, [editService]);

  const handleSubmit = async () => {
    if (editService) {
      await updateService(newService);
    } else {
      await addService(newService);
    }
  };

  if (editService && !trigger) return null;

  return (
    <Accordion
      type="single"
      collapsible
      value={isExpanded}
      onValueChange={setIsExpanded}
      className="w-full"
    >
      <AccordionItem value={editService ? 'edit-service' : 'add-service'} className="border-none">
        {editService ? (
          <>
            <div className="w-full">
              <AccordionTrigger>
                <div className="w-full">
                  {trigger}
                </div>
              </AccordionTrigger>
            </div>
            <AccordionContent className="pt-4">
              <div className="space-y-4 bg-card rounded-lg border shadow-sm p-6">
                <ServiceForm
                  categories={categories}
                  service={newService}
                  onChange={setNewService}
                  availableServices={services}
                  selectedUpsells={selectedUpsells}
                  onUpsellsChange={setSelectedUpsells}
                />
                <Button 
                  className="w-full"
                  onClick={handleSubmit}
                  disabled={isLoading || !newService.category_id || !newService.name_en || !newService.name_ar || !newService.duration || !newService.price}
                >
                  {isLoading ? 'Saving...' : 'Update Service'}
                </Button>
              </div>
            </AccordionContent>
          </>
        ) : (
          <>
            <AccordionTrigger className="hover:no-underline py-0">
              <Button 
                variant="outline"
                size="icon" 
                className="w-[200px] bg-[#C4A484] hover:bg-[#B8997C] text-white"
              >
                Service <Plus className="w-4 h-4 ml-2" />
              </Button>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <div className="space-y-4 bg-card rounded-lg border shadow-sm p-6">
                <ServiceForm
                  categories={categories}
                  service={newService}
                  onChange={setNewService}
                  availableServices={services}
                  selectedUpsells={selectedUpsells}
                  onUpsellsChange={setSelectedUpsells}
                />
                <Button 
                  className="w-full"
                  onClick={handleSubmit}
                  disabled={isLoading || !newService.category_id || !newService.name_en || !newService.name_ar || !newService.duration || !newService.price}
                >
                  {isLoading ? 'Saving...' : 'Add Service'}
                </Button>
              </div>
            </AccordionContent>
          </>
        )}
      </AccordionItem>
    </Accordion>
  );
};
