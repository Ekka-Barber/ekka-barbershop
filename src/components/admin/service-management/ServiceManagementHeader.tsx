
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from '@/contexts/LanguageContext';

interface ServiceManagementHeaderProps {
  totalCategories: number;
  totalServices: number;
  onSearch: (query: string) => void;
  onSort: (value: string) => void;
  onFilter: (value: string) => void;
}

export const ServiceManagementHeader = ({
  totalCategories,
  totalServices,
  onSort,
  onFilter,
}: ServiceManagementHeaderProps) => {
  const { language } = useLanguage();
  
  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold">
            {language === 'ar' ? 'إدارة الخدمات' : 'Service Management'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {totalCategories} {language === 'ar' ? 'فئة' : 'categories'} • {totalServices} {language === 'ar' ? 'خدمة' : 'services'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select onValueChange={onSort} defaultValue="name">
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder={language === 'ar' ? 'ترتيب حسب' : 'Sort by'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">{language === 'ar' ? 'الاسم' : 'Name'}</SelectItem>
              <SelectItem value="newest">{language === 'ar' ? 'الأحدث' : 'Newest'}</SelectItem>
              <SelectItem value="oldest">{language === 'ar' ? 'الأقدم' : 'Oldest'}</SelectItem>
              <SelectItem value="services">{language === 'ar' ? 'الأكثر خدمات' : 'Most Services'}</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={onFilter} defaultValue="all">
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder={language === 'ar' ? 'تصفية' : 'Filter'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{language === 'ar' ? 'كل الفئات' : 'All Categories'}</SelectItem>
              <SelectItem value="active">{language === 'ar' ? 'النشطة' : 'Active'}</SelectItem>
              <SelectItem value="empty">{language === 'ar' ? 'الفئات الفارغة' : 'Empty Categories'}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
