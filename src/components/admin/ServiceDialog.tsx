import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Category } from '@/types/service';
import { ServiceForm } from './ServiceForm';
import { useServiceForm } from '@/hooks/useServiceForm';
import { useToast } from '@/components/ui/use-toast';

type ServiceDialogProps = {
  categories: Category[] | undefined;
};

export const ServiceDialog = ({ categories }: ServiceDialogProps) => {
  const [isExpanded, setIsExpanded] = useState<string>('');
  const { toast } = useToast();
  const { newService, setNewService, addService, isLoading } = useServiceForm(() => {
    setIsExpanded('');
    toast({
      title: "Success",
      description: "Service has been added successfully",
    });
  });

  const handleAddService = async () => {
    await addService(newService);
  };

  return (
    <Accordion
      type="single"
      collapsible
      value={isExpanded}
      onValueChange={setIsExpanded}
      className="w-full"
    >
      <AccordionItem value="add-service" className="border-none">
        <div className="flex items-center justify-between">
          <AccordionTrigger className="hover:no-underline py-0">
            <Button 
              variant="outline"
              size="icon" 
              className="w-[200px] bg-[#C4A484] hover:bg-[#B8997C] text-white"
            >
              Service <Plus className="w-4 h-4 ml-2" />
            </Button>
          </AccordionTrigger>
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
              onClick={handleAddService}
              disabled={isLoading || !newService.category_id || !newService.name_en || !newService.name_ar || !newService.duration || !newService.price}
            >
              {isLoading ? 'Adding...' : 'Add Service'}
            </Button>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};