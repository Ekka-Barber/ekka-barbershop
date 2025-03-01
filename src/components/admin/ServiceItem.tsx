
import { GripVertical, Pencil } from 'lucide-react';
import { Draggable } from '@hello-pangea/dnd';
import { Button } from "@/components/ui/button";
import { Service } from '@/types/service';
import { ServiceDialog } from './ServiceDialog';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

type ServiceItemProps = {
  service: Service;
  index: number;
  categoryId: string;
};

export const ServiceItem = ({ service, index, categoryId }: ServiceItemProps) => {
  const { toast } = useToast();

  const handleDragEnd = async (newIndex: number) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ display_order: newIndex })
        .eq('id', service.id)
        .eq('category_id', categoryId);

      if (error) throw error;

      toast({
        title: "Order Updated",
        description: "Service order has been updated successfully.",
      });
    } catch (error) {
      console.error('Service reorder error:', error);
      toast({
        title: "Error",
        description: "An error occurred while reordering services.",
        variant: "destructive",
      });
    }
  };

  return (
    <Draggable
      key={service.id}
      draggableId={service.id}
      index={index}
    >
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="flex items-center justify-between p-2 bg-gray-50 border rounded-lg"
          onDragEnd={() => handleDragEnd(index)}
        >
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm font-medium">{service.name_en}</p>
              <p className="text-xs text-gray-500">{service.name_ar}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-500">
              {service.duration} mins • ${service.price}
            </div>
            <ServiceDialog
              categories={[{ 
                id: service.category_id, 
                name_en: '', 
                name_ar: '', 
                display_order: 0,
                created_at: new Date().toISOString(),
                services: []
              }]}
              editService={service}
              trigger={
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-500 hover:text-blue-600"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              }
            />
          </div>
        </div>
      )}
    </Draggable>
  );
};
