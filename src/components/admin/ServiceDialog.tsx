import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Category, Service } from '@/types/service';

type ServiceDialogProps = {
  categories: Category[] | undefined;
};

export const ServiceDialog = ({ categories }: ServiceDialogProps) => {
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [newService, setNewService] = useState<Partial<Service>>({
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
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addServiceMutation = useMutation({
    mutationFn: async (service: Partial<Service>) => {
      if (!service.category_id || !service.name_en || !service.name_ar || 
          service.duration === undefined || service.price === undefined) {
        throw new Error('Missing required fields');
      }

      await supabase.rpc('set_branch_manager_code', { code: 'true' });
      const { data, error } = await supabase
        .from('services')
        .insert([{
          category_id: service.category_id,
          name_en: service.name_en,
          name_ar: service.name_ar,
          description_en: service.description_en,
          description_ar: service.description_ar,
          duration: service.duration,
          price: service.price,
          discount_type: service.discount_type,
          discount_value: service.discount_value,
          display_order: categories?.find(c => c.id === service.category_id)?.services?.length || 0
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-categories'] });
      setServiceDialogOpen(false);
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
      toast({
        title: "Success",
        description: "Service added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add service",
        variant: "destructive",
      });
      console.error('Add error:', error);
    }
  });

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
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <Select
              value={newService.category_id}
              onValueChange={(value) => setNewService(prev => ({ ...prev, category_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name_en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">English Name</label>
            <Input
              value={newService.name_en}
              onChange={(e) => setNewService(prev => ({ ...prev, name_en: e.target.value }))}
              placeholder="Enter service name in English"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Arabic Name</label>
            <Input
              value={newService.name_ar}
              onChange={(e) => setNewService(prev => ({ ...prev, name_ar: e.target.value }))}
              placeholder="Enter service name in Arabic"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">English Description</label>
            <Textarea
              value={newService.description_en || ''}
              onChange={(e) => setNewService(prev => ({ ...prev, description_en: e.target.value }))}
              placeholder="Enter service description in English"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Arabic Description</label>
            <Textarea
              value={newService.description_ar || ''}
              onChange={(e) => setNewService(prev => ({ ...prev, description_ar: e.target.value }))}
              placeholder="Enter service description in Arabic"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Duration (minutes)</label>
              <Input
                type="number"
                value={newService.duration || ''}
                onChange={(e) => setNewService(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                placeholder="Enter duration"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Price</label>
              <Input
                type="number"
                value={newService.price || ''}
                onChange={(e) => setNewService(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                placeholder="Enter price"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Discount Type</label>
            <Select
              value={newService.discount_type || ''}
              onValueChange={(value: 'percentage' | 'amount' | '') => 
                setNewService(prev => ({ 
                  ...prev, 
                  discount_type: value || null 
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select discount type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No discount</SelectItem>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="amount">Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {newService.discount_type && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Discount Value {newService.discount_type === 'percentage' ? '(%)' : '($)'}
              </label>
              <Input
                type="number"
                value={newService.discount_value || ''}
                onChange={(e) => setNewService(prev => ({ 
                  ...prev, 
                  discount_value: parseFloat(e.target.value) || 0 
                }))}
                placeholder={`Enter discount ${newService.discount_type === 'percentage' ? 'percentage' : 'amount'}`}
              />
            </div>
          )}

          <Button 
            className="w-full"
            onClick={() => addServiceMutation.mutate(newService)}
            disabled={!newService.category_id || !newService.name_en || !newService.name_ar || !newService.duration || !newService.price}
          >
            Service
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};