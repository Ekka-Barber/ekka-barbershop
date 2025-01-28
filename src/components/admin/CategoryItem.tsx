import { GripVertical, Trash, ChevronDown, ChevronRight, Pencil } from 'lucide-react';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import { Button } from "@/components/ui/button";
import { Category } from '@/types/service';
import { ServiceItem } from './ServiceItem';
import { CategoryDialog } from './CategoryDialog';

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
          <div className="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <div
                {...provided.dragHandleProps}
                className="cursor-move text-gray-400 hover:text-gray-600"
              >
                <GripVertical className="w-5 h-5" />
              </div>
              <button
                onClick={onToggle}
                className="flex items-center gap-2"
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
            </div>
            <div className="flex items-center gap-2">
              <CategoryDialog
                categories={[category]}
                editCategory={category}
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
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
              >
                <Trash className="w-4 h-4 text-red-500" />
              </Button>
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