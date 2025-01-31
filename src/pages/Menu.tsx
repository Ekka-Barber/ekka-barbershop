import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Skeleton } from "@/components/ui/skeleton";

const Menu = () => {
  const { t, language } = useLanguage();

  const { data: services, isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          category:service_categories(
            id,
            name_en,
            name_ar,
            display_order
          )
        `)
        .order('display_order');
      
      if (error) throw error;
      return data;
    },
  });

  const groupedServices = services?.reduce((acc: any, service: any) => {
    const categoryId = service.category?.id;
    if (!acc[categoryId]) {
      acc[categoryId] = {
        category: service.category,
        services: []
      };
    }
    acc[categoryId].services.push(service);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      <div className={`max-w-4xl mx-auto ${language === 'ar' ? 'rtl' : 'ltr'}`}>
        <Link to="/customer">
          <img 
            src="/lovable-uploads/8289fb1d-c6e6-4528-980c-6b52313ca898.png"
            alt="Ekka Barbershop Logo" 
            className="h-32 mx-auto mb-6 cursor-pointer hover:opacity-90 transition-opacity"
          />
        </Link>
        <h1 className="text-3xl font-bold text-center text-[#222222] mb-2">
          {t('menu')}
        </h1>
        <div className="h-1 w-24 bg-[#C4A36F] mx-auto mb-8"></div>

        {isLoading ? (
          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-8 w-48 mx-auto" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((j) => (
                    <Skeleton key={j} className="h-24 w-full" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {Object.values(groupedServices || {}).map((group: any) => (
              <div key={group.category.id} className="space-y-4">
                <h2 className="text-2xl font-semibold text-center text-[#222222]">
                  {language === 'ar' ? group.category.name_ar : group.category.name_en}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {group.services.map((service: any) => (
                    <div
                      key={service.id}
                      className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-lg text-[#222222]">
                            {language === 'ar' ? service.name_ar : service.name_en}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {language === 'ar' ? service.description_ar : service.description_en}
                          </p>
                        </div>
                        <div className="text-lg font-semibold text-[#C4A36F]">
                          {service.price} {t('sar')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <LanguageSwitcher />
    </div>
  );
};

export default Menu;