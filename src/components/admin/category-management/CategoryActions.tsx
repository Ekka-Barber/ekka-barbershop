
import { CategoryDialog } from '../CategoryDialog';
import { ServiceDialog } from '../ServiceDialog';
import { Category } from '@/types/service';

interface CategoryActionsProps {
  categories: Category[] | undefined;
}

export const CategoryActions = ({ categories }: CategoryActionsProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mt-4">
      <div className="flex justify-center items-center gap-4">
        <CategoryDialog categories={categories} />
        <ServiceDialog categories={categories} />
      </div>
    </div>
  );
};
