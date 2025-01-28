import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical, Plus, Trash } from 'lucide-react';
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

type Service = {
  id: string;
  category_id: string;
  name_en: string;
  name_ar: string;
  description_en: string | null;
  description_ar: string | null;
  duration: number;
  price: number;
  display_order: number;
};

type Category = {
  id: string;
  name_en: string;
  name_ar: string;
};

const ServiceList = () => {
  const [newService, setNewService] = useState({
    category_id: '',
    name_en: '',
    name_ar: '',
    description_en: '',
    description_ar: '',
    duration: 30,
    price: 0
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories } = useQuery({
    queryKey: ['service-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_categories')
        .select('*')
        .order('display_order');
      
      if (error) throw error;
      return data as Category[];
    }
  });

  const { data: services, isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('display_order');
      
      if (error) throw error;
      return data as Service[];
    }
  });

  const addServiceMutation = useMutation({
    mutationFn: async (service: Omit<Service, 'id' | 'display_order'>) => {
      const servicesInCategory = services?.filter(s => s.category_id === service.category_id) || [];
      const { data, error } = await supabase
        .from('services')
        .insert([{ 
          ...service,
          display_order: servicesInCategory.length
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      setDialogOpen(false);
      setNewService({
        category_id: '',
        name_en: '',
        name_ar: '',
        description_en: '',
        description_ar: '',
        duration: 30,
        price: 0
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

  const deleteServiceMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast({
        title: "Success",
        description: "Service deleted successfully",
      });
    }
  });

  const updateOrderMutation = useMutation({
    mutationFn: async (updates: { id: string; display_order: number }[]) => {
      const { error } = await supabase
        .from('services')
        .upsert(updates);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    }
  });

  const handleDragEnd = (result: any) => {
    if (!result.destination || !services) return;

    const items = Array.from(services);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updates = items.map((item, index) => ({
      id: item.id,
      display_order: index
    }));

    updateOrderMutation.mutate(updates);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Services</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Service
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
                    <SelectValue placeholder="Select a category" />
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
                <Input
                  value={newService.description_en}
                  onChange={(e) => setNewService(prev => ({ ...prev, description_en: e.target.value }))}
                  placeholder="Enter service description in English"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Arabic Description</label>
                <Input
                  value={newService.description_ar}
                  onChange={(e) => setNewService(prev => ({ ...prev, description_ar: e.target.value }))}
                  placeholder="Enter service description in Arabic"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Duration (minutes)</label>
                  <Input
                    type="number"
                    value={newService.duration}
                    onChange={(e) => setNewService(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    min={0}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price</label>
                  <Input
                    type="number"
                    value={newService.price}
                    onChange={(e) => setNewService(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                    min={0}
                    step={0.01}
                  />
                </div>
              </div>
              <Button 
                className="w-full"
                onClick={() => addServiceMutation.mutate(newService)}
                disabled={!newService.category_id || !newService.name_en || !newService.name_ar}
              >
                Add Service
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="services">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
            >
              {services?.map((service, index) => (
                <Draggable 
                  key={service.id} 
                  draggableId={service.id} 
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          {...provided.dragHandleProps}
                          className="cursor-move text-gray-400 hover:text-gray-600"
                        >
                          <GripVertical className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium">{service.name_en}</p>
                          <p className="text-sm text-gray-500">{service.name_ar}</p>
                          <div className="text-sm text-gray-500">
                            <span>{service.duration} mins</span>
                            <span className="mx-2">•</span>
                            <span>${service.price}</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteServiceMutation.mutate(service.id)}
                      >
                        <Trash className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default ServiceList;