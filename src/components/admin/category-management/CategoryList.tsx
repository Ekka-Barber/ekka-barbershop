
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { Category } from '@/types/service';
import CategoryItem from '@/components/admin/CategoryItem';

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
                onExpandedChange={() => onToggleCategory(category.id)}
                onDelete={() => onDeleteCategory(category.id)}
                services={category.services}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};
