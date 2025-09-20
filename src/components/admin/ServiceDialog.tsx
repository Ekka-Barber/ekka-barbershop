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
import { useIsMobile } from '@/hooks/use-mobile';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

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
  const isMobile = useIsMobile();
  const [selectedUpsells, setSelectedUpsells] = useState<Array<{ serviceId: string; discountPercentage: number }>>([]);
  const [branches, setBranches] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedBranchIds, setSelectedBranchIds] = useState<string[]>([]);
  const descriptionId = "service-dialog-description";

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
      await supabase
        .from('service_upsells')
        .delete()
        .eq('main_service_id', serviceId);

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

  useEffect(() => {
    if (editService && isOpen) {
      setNewService({
        ...editService,
        category_id: editService.category_id
      });
    }
  }, [editService, isOpen, setNewService]);

  useEffect(() => {
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

  useEffect(() => {
    const fetchBranches = async () => {
      const { data, error } = await supabase
        .from('branches')
        .select('id, name')
        .order('is_main', { ascending: false });
      
      if (error) {
        console.error('Error fetching branches:', error);
        return;
      }
      
      if (data) {
        setBranches(data);
      }
    };
    
    fetchBranches();
  }, []);

  useEffect(() => {
    if (editService?.id && isOpen) {
      const fetchBranchAssignments = async () => {
        const { data, error } = await supabase
          .from('branch_services')
          .select('branch_id')
          .eq('service_id', editService.id);
          
        if (error) {
          console.error('Error fetching branch assignments:', error);
          return;
        }
        
        if (data) {
          setSelectedBranchIds(data.map(item => item.branch_id));
        }
      };
      
      fetchBranchAssignments();
    }
  }, [editService?.id, isOpen]);

  const handleToggleBranch = (branchId: string, checked: boolean) => {
    if (checked) {
      setSelectedBranchIds(prev => [...prev, branchId]);
    } else {
      setSelectedBranchIds(prev => prev.filter(id => id !== branchId));
    }
  };

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
      <DialogContent 
        className={`${isMobile ? 'p-3' : 'p-6'} max-w-[95vw] sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto h-[80vh] sm:h-auto overflow-auto`}
        aria-describedby={descriptionId}
      >
        <DialogHeader className={`${isMobile ? 'pb-2 space-y-1' : 'pb-4 space-y-2'}`}>
          <DialogTitle className={`${isMobile ? 'text-lg' : 'text-xl'}`}>
            {editService ? 'Edit Service' : 'Add New Service'}
          </DialogTitle>
          <DialogDescription id={descriptionId} className={isMobile ? "sr-only" : ""}>
            {editService 
              ? 'Update the service details below.' 
              : 'Fill in the details below to add a new service.'}
          </DialogDescription>
        </DialogHeader>
        <div className={`${isMobile ? 'py-2' : 'py-4'}`}>
          <ServiceForm
            categories={categories}
            service={newService}
            onChange={setNewService}
            availableServices={services}
            selectedUpsells={selectedUpsells}
            onUpsellsChange={setSelectedUpsells}
          />
          
          <div className="py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              {branches.map(branch => (
                <div key={branch.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`service-branch-${branch.id}`} 
                    checked={selectedBranchIds.includes(branch.id)}
                    onCheckedChange={(checked) => handleToggleBranch(branch.id, checked === true)}
                  />
                  <Label htmlFor={`service-branch-${branch.id}`} className="text-sm font-normal">
                    {branch.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter className={`${isMobile ? 'mt-2' : 'mt-4'} gap-2 sm:gap-0`}>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            className={`${isMobile ? 'text-sm py-1.5 px-3' : ''}`}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isLoading || !newService.category_id || !newService.name_en || !newService.name_ar || !newService.duration || !newService.price}
            className={`${isMobile ? 'text-sm py-1.5 px-3' : ''}`}
          >
            {isLoading ? 'Saving...' : editService ? 'Update' : 'Add'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
