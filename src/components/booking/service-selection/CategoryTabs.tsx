
import { Language } from "@/types/language";

interface CategoryTabsProps {
  categories: Array<{
    id: string;
    name_ar: string;
    name_en: string;
  }>;
  activeCategory: string | null;
  onCategoryChange: (categoryId: string) => void;
  language: Language;
}

export const CategoryTabs = ({
  categories,
  activeCategory,
  onCategoryChange,
  language
}: CategoryTabsProps) => {
  return (
    <div className={`w-full sticky top-0 z-10 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className="bg-gradient-to-b from-white to-gray-50 shadow-sm border-b border-gray-100">
        <div className="max-w-full overflow-x-auto hide-scrollbar px-4 py-3 mx-auto">
          <div className="flex gap-2 min-w-max">
            {categories?.map((category) => (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={`shrink-0 px-4 py-2 rounded-full transition-all duration-200 ${
                  activeCategory === category.id
                    ? 'bg-[#C4A484] text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-700'
                }`}
              >
                {language === 'ar' ? category.name_ar : category.name_en}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
