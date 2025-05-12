import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult, DroppableProvided, DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';
import { GripVertical, Pencil, Settings } from 'lucide-react';
import { useState } from 'react';
import { EditElementDialog } from './EditElementDialog';
import { IconSelectorDialog } from './IconSelectorDialog';
import * as LucideIcons from 'lucide-react';
import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface UiElement {
  id: string;
  type: 'button' | 'section';
  name: string;
  display_name: string;
  display_name_ar: string;
  description: string | null;
  description_ar: string | null;
  is_visible: boolean;
  display_order: number;
  icon: string | null;
  action: string | null;
}

type IconType = keyof typeof LucideIcons;

const DraggableItem = React.memo(({ 
  element, 
  index, 
  language, 
  renderIcon, 
  onEditClick, 
  onIconClick, 
  onVisibilityChange 
}: { 
  element: UiElement;
  index: number;
  language: string;
  renderIcon: (iconName: string) => React.ReactNode;
  onEditClick: (element: UiElement) => void;
  onIconClick: (element: UiElement) => void;
  onVisibilityChange: (id: string, is_visible: boolean) => void;
}) => {
  return (
    <Draggable draggableId={element.id} index={index}>
      {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`flex items-center gap-4 p-4 bg-white rounded-lg border shadow-sm ${
            snapshot.isDragging ? 'opacity-50' : ''
          }`}
        >
          <div
            {...provided.dragHandleProps}
            className="cursor-grab"
          >
            <GripVertical className="h-5 w-5 text-gray-400" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-4">
              {element.icon && renderIcon(element.icon)}
              <h3 className="font-medium">
                {language === 'ar' ? element.display_name_ar : element.display_name}
              </h3>
              <span className="text-sm text-gray-500">
                ({element.type})
              </span>
            </div>
            {element.description && (
              <p className="text-sm text-gray-600 mt-1">
                {language === 'ar' ? element.description_ar : element.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onIconClick(element)}
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEditClick(element)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Switch
              checked={element.is_visible}
              onCheckedChange={(checked) => onVisibilityChange(element.id, checked)}
            />
          </div>
        </div>
      )}
    </Draggable>
  );
});

DraggableItem.displayName = 'DraggableItem';

export const UiElementsManager = () => {
  const { toast } = useToast();
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  const [editingElement, setEditingElement] = useState<UiElement | null>(null);
  const [iconElement, setIconElement] = useState<UiElement | null>(null);

  const { data: elements, isLoading } = useQuery({
    queryKey: ['ui-elements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ui_elements')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as UiElement[];
    }
  });

  const updateVisibilityMutation = useMutation({
    mutationFn: async ({ id, is_visible }: { id: string; is_visible: boolean }) => {
      const { error } = await supabase
        .from('ui_elements')
        .update({ is_visible })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ui-elements'] });
      toast({
        title: language === 'ar' ? 'تم التحديث' : 'Updated',
        description: language === 'ar' ? 'تم تحديث حالة العنصر' : 'Element visibility updated',
      });
    },
    onError: (error) => {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'حدث خطأ أثناء التحديث' : 'An error occurred while updating',
        variant: 'destructive',
      });
      console.error('Error updating visibility:', error);
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: async (elements: UiElement[]) => {
      const updates = elements.map((element, index) => ({
        id: element.id,
        display_order: index,
        type: element.type,
        name: element.name,
        display_name: element.display_name,
        display_name_ar: element.display_name_ar
      }));

      const { error } = await supabase
        .from('ui_elements')
        .upsert(updates);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ui-elements'] });
      toast({
        title: language === 'ar' ? 'تم التحديث' : 'Updated',
        description: language === 'ar' ? 'تم تحديث ترتيب العناصر' : 'Elements order updated',
      });
    },
    onError: (error) => {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'حدث خطأ أثناء تحديث الترتيب' : 'An error occurred while updating order',
        variant: 'destructive',
      });
      console.error('Error updating order:', error);
    },
  });

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !elements) return;

    const items = Array.from(elements);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    updateOrderMutation.mutate(items);
  };

  const renderIcon = (iconName: string) => {
    const Icon = LucideIcons[iconName as IconType] as LucideIcon;
    return Icon ? <Icon className="h-5 w-5 text-gray-500" /> : null;
  };

  const handleVisibilityChange = (id: string, is_visible: boolean) => {
    updateVisibilityMutation.mutate({ id, is_visible });
  };

  if (isLoading) {
    return <div className="text-center py-8">{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</div>;
  }

  if (!elements) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {language === 'ar' ? 'إدارة عناصر الواجهة' : 'UI Elements Management'}
        </h2>
        <p className="text-sm text-gray-500">
          {language === 'ar' 
            ? 'اسحب العناصر لإعادة ترتيبها أو استخدم المفتاح لتفعيل/تعطيل العناصر' 
            : 'Drag elements to reorder or use the toggle to show/hide elements'}
        </p>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="ui-elements">
          {(provided: DroppableProvided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {elements.map((element, index) => (
                <DraggableItem
                  key={element.id}
                  element={element}
                  index={index}
                  language={language}
                  renderIcon={renderIcon}
                  onEditClick={setEditingElement}
                  onIconClick={setIconElement}
                  onVisibilityChange={handleVisibilityChange}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <EditElementDialog
        isOpen={!!editingElement}
        onClose={() => setEditingElement(null)}
        element={editingElement}
      />

      <IconSelectorDialog
        isOpen={!!iconElement}
        onClose={() => setIconElement(null)}
        elementId={iconElement?.id || null}
        currentIcon={iconElement?.icon || null}
      />
    </div>
  );
};
