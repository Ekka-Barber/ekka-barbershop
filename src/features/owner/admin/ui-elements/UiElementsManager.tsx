import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult, DroppableProvided, DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';
import { GripVertical, Pencil, Settings } from 'lucide-react';
import { useState } from 'react';
import React, { Suspense, lazy } from 'react';

const IconSelectorDialog = lazy(() => import('./IconSelectorDialog').then(m => ({ default: m.IconSelectorDialog })));


import { useElementMutations } from '@features/shared-features/ui-elements/hooks/useElementMutations';
import { useUiElementsData } from '@features/shared-features/ui-elements/hooks/useUiElementsData';
import type { UiElement } from '@features/shared-features/ui-elements/types';

import { getIcon } from '@shared/lib/icons';
import { Button } from '@shared/ui/components/button';
import { Switch } from '@shared/ui/components/switch';

import { EditElementDialog } from './EditElementDialog';

import { useLanguage } from '@/contexts/LanguageContext';

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
          className={`flex items-center gap-4 p-4 bg-white rounded-lg border shadow-sm ${snapshot.isDragging ? 'opacity-50' : ''
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
              checked={element.is_visible ?? true} // Default to true if null
              onCheckedChange={(checked) => onVisibilityChange(element.id, checked)}
            />
          </div>
        </div>
      )}
    </Draggable>
  );
});

DraggableItem.displayName = 'DraggableItem';

const UiElementsManager = () => {
  const { language } = useLanguage();
  const [editingElement, setEditingElement] = useState<UiElement | null>(null);
  const [iconElement, setIconElement] = useState<UiElement | null>(null);

  // Use custom hooks for data and mutations
  const { data: elements, isLoading } = useUiElementsData();
  const { updateVisibility, updateOrder } = useElementMutations({ language });

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !elements) return;

    const items = Array.from(elements);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    updateOrder.mutate(items);
  };

  const renderIcon = (iconName: string) => {
    const Icon = getIcon(iconName);
    return <Icon className="h-5 w-5 text-gray-500" />;
  };

  const handleVisibilityChange = (id: string, is_visible: boolean) => {
    updateVisibility.mutate({ id, is_visible });
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

      <Suspense fallback={<div className="flex items-center justify-center p-4"><div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-gold-200 border-t-transparent" /></div>}>
        <IconSelectorDialog
          isOpen={!!iconElement}
          onClose={() => setIconElement(null)}
          elementId={iconElement?.id || null}
          currentIcon={iconElement?.icon || null}
        />
      </Suspense>
    </div>
  );
};

export default UiElementsManager;
