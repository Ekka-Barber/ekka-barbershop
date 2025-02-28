
import { GripVertical, Trash, ChevronDown, ChevronRight, Pencil } from 'lucide-react';
import { useState } from 'react';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Category } from '@/types/service';
import { ServiceItem } from './ServiceItem';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

type CategoryItemProps = {
  category: Category;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
};

export const CategoryItem = ({ 
  category, 
  index, 
  isExpanded, 
  onToggle, 
  onDelete 
}: CategoryItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedCategory, setEditedCategory] = useState(category);
  const { toast } = useToast();

  const handleEdit = () => {
    setIsEditing(true);
    setEditedCategory(category);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedCategory(category);
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('service_categories')
        .update({
          name_en: editedCategory.name_en,
          name_ar: editedCategory.name_ar
        })
        .eq('id', category.id);

      if (error) throw error;

      setIsEditing(false);
      toast({
        title: "Category Updated",
        description: "Category has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update category. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleServiceDragEnd = async (result: any) => {
    if (!result.destination || !category.services) return;

    try {
      const newServices = Array.from(category.services);
      const [removed] = newServices.splice(result.source.index, 1);
      newServices.splice(result.destination.index, 0, removed);

      const updates = newServices.map((service, index) => ({
        id: service.id,
        name_en: service.name_en,
        name_ar: service.name_ar,
        description_en: service.description_en,
        description_ar: service.description_ar,
        price: service.price,
        duration: service.duration,
        category_id: category.id,
        display_order: index,
        discount_type: service.discount_type,
        discount_value: service.discount_value
      }));

      const { error } = await supabase
        .from('services')
        .upsert(updates, { onConflict: 'id' });

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
      key={category.id} 
      draggableId={category.id} 
      index={index}
    >
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="space-y-2"
        >
          <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div
                {...provided.dragHandleProps}
                className="cursor-move text-gray-400 hover:text-gray-600"
              >
                <GripVertical className="w-5 h-5" />
              </div>
              {isEditing ? (
                <div className="flex flex-col gap-2">
                  <Input
                    value={editedCategory.name_en}
                    onChange={(e) => setEditedCategory(prev => ({ ...prev, name_en: e.target.value }))}
                    placeholder="English name"
                    className="w-[200px]"
                  />
                  <Input
                    value={editedCategory.name_ar}
                    onChange={(e) => setEditedCategory(prev => ({ ...prev, name_ar: e.target.value }))}
                    placeholder="Arabic name"
                    className="w-[200px]"
                    dir="rtl"
                  />
                </div>
              ) : (
                <button
                  onClick={onToggle}
                  className="flex items-center gap-2 text-left"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                  <div>
                    <p className="font-medium">{category.name_en}</p>
                    <p className="text-sm text-gray-500">{category.name_ar}</p>
                  </div>
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                  >
                    Save
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleEdit}
                    className="text-blue-500 hover:text-blue-600 h-8 w-8"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onDelete}
                    className="text-red-500 hover:text-red-600 h-8 w-8"
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>

          {isExpanded && (
            <Droppable droppableId={category.id} type="service">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="ml-8 space-y-2"
                >
                  {category.services?.map((service, index) => (
                    <ServiceItem 
                      key={service.id} 
                      service={service} 
                      index={index}
                      categoryId={category.id}
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          )}
        </div>
      )}
    </Draggable>
  );
};
