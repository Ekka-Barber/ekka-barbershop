
interface CategoryTabsProps {
  categories: Array<{
    id: string;
    name_ar: string;
    name_en: string;
  }>;
  activeCategory: string | null;
  onCategoryChange: (categoryId: string) => void;
  language: string;
}

export const CategoryTabs = ({
  categories,
  activeCategory,
  onCategoryChange,
  language
}: CategoryTabsProps) => {
  return (
    <div className="flex overflow-x-auto pb-2 hide-scrollbar sticky top-11 bg-white z-10 pt-4">
      {categories?.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={`flex-shrink-0 px-6 py-2 rounded-full mx-1 transition-all ${
            activeCategory === category.id
              ? 'bg-[#e7bd71] text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {language === 'ar' ? category.name_ar : category.name_en}
        </button>
      ))}
    </div>
  );
};
