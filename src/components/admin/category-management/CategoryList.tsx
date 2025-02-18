
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { Category } from '@/types/service';
import { CategoryItem } from '../../admin/CategoryItem';

interface CategoryListProps {
  categories: Category[] | undefined;
  expandedCategories: string[];
  onToggleCategory: (categoryId: string) => void;
  onDeleteCategory: (categoryId: string) => void;
  onDragEnd: (result: any) => void;
}

export const CategoryList = ({
  categories,
  expandedCategories,
  onToggleCategory,
  onDeleteCategory,
  onDragEnd
}: CategoryListProps) => {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="categories" type="category">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-2"
          >
            {categories?.map((category, index) => (
              <CategoryItem
                key={category.id}
                category={category}
                index={index}
                isExpanded={expandedCategories.includes(category.id)}
                onToggle={() => onToggleCategory(category.id)}
                onDelete={() => onDeleteCategory(category.id)}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

