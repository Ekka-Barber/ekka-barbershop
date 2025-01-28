import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Category } from '@/types/service';
import { ServiceForm } from './ServiceForm';
import { useServiceForm } from '@/hooks/useServiceForm';

type ServiceDialogProps = {
  categories: Category[] | undefined;
};

export const ServiceDialog = ({ categories }: ServiceDialogProps) => {
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const { newService, setNewService, addService, isLoading } = useServiceForm(() => setServiceDialogOpen(false));

  return (
    <Dialog open={serviceDialogOpen} onOpenChange={setServiceDialogOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Service
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Service</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <ServiceForm
            categories={categories}
            service={newService}
            onChange={setNewService}
          />
          <Button 
            className="w-full"
            onClick={() => addService(newService)}
            disabled={isLoading || !newService.category_id || !newService.name_en || !newService.name_ar || !newService.duration || !newService.price}
          >
            {isLoading ? 'Adding...' : 'Add Service'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};