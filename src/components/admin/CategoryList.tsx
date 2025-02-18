
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { CategoryItem } from './CategoryItem';
import { useLanguage } from '@/contexts/LanguageContext';

interface Category {
  id: string;
  name: string;
  services: any[];
}

interface CategoryListProps {
  categories: Category[];
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
  const { language } = useLanguage();

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="categories">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-4"
          >
            {categories.map((category, index) => (
              <CategoryItem
                key={category.id}
                category={category}
                index={index}
                isExpanded={expandedCategories.includes(category.id)}
                onToggle={() => onToggleCategory(category.id)}
                onDelete={() => onDeleteCategory(category.id)}
                language={language}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};
