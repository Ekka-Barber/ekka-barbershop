
import { Separator } from "@/components/ui/separator";
import { CategoryDialog } from '../CategoryDialog';
import { ServiceDialog } from '../ServiceDialog';
import { Category } from '@/types/service';

interface CategoryActionsProps {
  categories: Category[] | undefined;
}

export const CategoryActions = ({ categories }: CategoryActionsProps) => {
  return (
    <>
      <Separator className="my-4" />
      <div className="flex flex-col items-center gap-4">
        <CategoryDialog categories={categories} />
        <ServiceDialog categories={categories} />
      </div>
    </>
  );
};
