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
  trigger?: React.ReactElement;
};

export const ServiceDialog = ({ categories, editService, onSuccess, trigger }: ServiceDialogProps) => {
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

Let's fix the "React.Children.only" error in the ServiceDialog component. The error occurs because the AccordionTrigger with asChild prop expects exactly one child element, but we're passing the trigger prop directly which might be a fragment or multiple elements.

<lov-code>
Let's update the ServiceDialog.tsx file to properly handle the trigger:

<lov-write file_path="src/components/admin/ServiceDialog.tsx">
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
  trigger?: React.ReactElement;
};

export const ServiceDialog = ({ categories, editService, onSuccess, trigger }: ServiceDialogProps) => {
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