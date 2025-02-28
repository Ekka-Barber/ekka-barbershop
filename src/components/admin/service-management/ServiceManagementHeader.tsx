
import { useLanguage } from '@/contexts/LanguageContext';

interface ServiceManagementHeaderProps {
  totalCategories: number;
  totalServices: number;
}

export const ServiceManagementHeader = ({
  totalCategories,
  totalServices,
}: ServiceManagementHeaderProps) => {
  const { language } = useLanguage();
  
  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">
            {language === 'ar' ? 'إدارة الخدمات' : 'Service Management'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {totalCategories} {language === 'ar' ? 'فئة' : 'categories'} • {totalServices} {language === 'ar' ? 'خدمة' : 'services'}
          </p>
        </div>
      </div>
    </div>
  );
};
