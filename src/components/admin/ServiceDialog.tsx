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
import { useToast } from '@/components/ui/use-toast';

type ServiceDialogProps = {
  categories: Category[] | undefined;
  editService?: Service;
  onSuccess?: () => void;
};

export const ServiceDialog = ({ categories, editService, onSuccess }: ServiceDialogProps) => {
  const [isExpanded, setIsExpanded] = useState<string>('');
  const { toast } = useToast();
  const { newService, setNewService, addService, updateService, isLoading } = useServiceForm(() => {
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
      setIsExpanded('edit-service');
    }
  }, [editService]);

  const handleSubmit = async () => {
    if (editService) {
      await updateService(newService);
    } else {
      await addService(newService);
    }
  };

  return (
    <Accordion
      type="single"
      collapsible
      value={isExpanded}
      onValueChange={setIsExpanded}
      className="w-full"
    >
      <AccordionItem value={editService ? 'edit-service' : 'add-service'} className="border-none">
        <div className="flex items-center justify-between">
          {!editService && (
            <AccordionTrigger className="hover:no-underline py-0">
              <Button 
                variant="outline"
                size="icon" 
                className="w-[200px] bg-[#C4A484] hover:bg-[#B8997C] text-white"
              >
                Service <Plus className="w-4 h-4 ml-2" />
              </Button>
            </AccordionTrigger>
          )}
        </div>
        <AccordionContent className="pt-4">
          <div className="space-y-4 bg-card rounded-lg border shadow-sm p-6">
            <ServiceForm
              categories={categories}
              service={newService}
              onChange={setNewService}
            />
            <Button 
              className="w-full"
              onClick={handleSubmit}
              disabled={isLoading || !newService.category_id || !newService.name_en || !newService.name_ar || !newService.duration || !newService.price}
            >
              {isLoading ? 'Saving...' : editService ? 'Update Service' : 'Add Service'}
            </Button>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};