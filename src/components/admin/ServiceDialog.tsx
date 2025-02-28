
import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Category, Service } from '@/types/service';
import { ServiceForm } from './ServiceForm';
import { useServiceForm } from '@/hooks/useServiceForm';
import { useToast } from '@/components/ui/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";

type ServiceDialogProps = {
  categories: Category[] | undefined;
  editService?: Service;
  onSuccess?: () => void;
  trigger?: React.ReactElement;
};

export const ServiceDialog = ({ categories, editService, onSuccess, trigger }: ServiceDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
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
    setIsOpen(false);
    onSuccess?.();
    toast({
      title: "Success",
      description: editService 
        ? "Service has been updated successfully"
        : "Service has been added successfully",
    });
  });

  // This effect is critical - it ensures we properly set the service data including category
  // when we're editing a service and the dialog opens
  useEffect(() => {
    if (editService && isOpen) {
      console.log("Setting service data for editing:", editService);
      setNewService({
        ...editService,
        category_id: editService.category_id // Ensure category_id is explicitly set
      });
    }
  }, [editService, isOpen, setNewService]);

  useEffect(() => {
    // Reset the form data when the dialog closes
    if (!isOpen) {
      if (!editService) {
        setNewService({
          category_id: '',
          name_en: '',
          name_ar: '',
          description_en: null,
          description_ar: null,
          duration: 0,
          price: 0,
          discount_type: null,
          discount_value: null,
        });
      }
      if (!editService?.id) {
        setSelectedUpsells([]);
      }
    }
  }, [isOpen, editService, setNewService]);

  const handleSubmit = async () => {
    if (editService) {
      await updateService(newService);
    } else {
      await addService(newService);
    }
  };

  if (editService && !trigger) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {editService ? (
          trigger
        ) : (
          <Button variant="outline" size="icon" className="w-[200px] bg-[#C4A484] hover:bg-[#B8997C] text-white">
            Service <Plus className="w-4 h-4 ml-2" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
          <DialogDescription>
            {editService 
              ? 'Update the service details below.' 
              : 'Fill in the details below to add a new service.'}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <ServiceForm
            categories={categories}
            service={newService}
            onChange={setNewService}
            availableServices={services}
            selectedUpsells={selectedUpsells}
            onUpsellsChange={setSelectedUpsells}
          />
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isLoading || !newService.category_id || !newService.name_en || !newService.name_ar || !newService.duration || !newService.price}
          >
            {isLoading ? 'Saving...' : editService ? 'Update Service' : 'Add Service'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
