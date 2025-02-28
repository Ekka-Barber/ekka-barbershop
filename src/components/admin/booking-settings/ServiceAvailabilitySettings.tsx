
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Category, Service } from '@/types/service';
import { Branch } from '@/types/booking';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useServiceAvailability } from '@/hooks/useServiceAvailability';

interface ServiceAvailabilitySettingsProps {
  isLoading: boolean;
}

export const ServiceAvailabilitySettings = ({ isLoading }: ServiceAvailabilitySettingsProps) => {
  const { language, t } = useLanguage();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  
  // Use our custom hook for service availability management
  const {
    availabilityData,
    isLoading: availabilityLoading,
    updatingServiceIds,
    toggleServiceAvailability,
    getServiceAvailability
  } = useServiceAvailability(selectedBranch);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setDataLoading(true);
        
        // Fetch branches
        const { data: branchData, error: branchError } = await supabase
          .from('branches')
          .select('*')
          .order('name', { ascending: true });
          
        if (branchError) throw branchError;
        setBranches(branchData as Branch[]);
        
        // Set default selected branch if available
        if (branchData.length > 0) {
          setSelectedBranch(branchData[0].id);
        }
        
        // Fetch categories with their services
        const { data: categoryData, error: categoryError } = await supabase
          .from('service_categories')
          .select(`
            id,
            name_en,
            name_ar,
            display_order,
            created_at,
            services(
              id, 
              name_en, 
              name_ar, 
              price, 
              duration, 
              category_id,
              display_order
            )
          `)
          .order('display_order', { ascending: true });
          
        if (categoryError) throw categoryError;
        
        // Sort services within each category
        const categoriesWithSortedServices = categoryData.map((category: any) => ({
          ...category,
          services: [...category.services].sort((a, b) => a.display_order - b.display_order)
        }));
        
        setCategories(categoriesWithSortedServices);
        
        // Set default selected category if available
        if (categoriesWithSortedServices.length > 0) {
          setSelectedCategory(categoriesWithSortedServices[0].id);
        }
        
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error(language === 'ar' ? 'فشل في تحميل البيانات' : 'Failed to load data');
      } finally {
        setDataLoading(false);
      }
    };
    
    fetchData();
  }, [language]);

  // Get services for the selected category
  const getServicesForCategory = (categoryId: string | null): Service[] => {
    if (!categoryId) return [];
    
    const category = categories.find(c => c.id === categoryId);
    return category?.services || [];
  };

  // Handle toggling a service's availability
  const handleToggleAvailability = async (serviceId: string) => {
    if (!selectedBranch) return;
    
    const isCurrentlyAvailable = getServiceAvailability(serviceId);
    
    try {
      await toggleServiceAvailability(serviceId, !isCurrentlyAvailable);
      
      toast.success(
        language === 'ar' 
          ? 'تم تحديث توفر الخدمة بنجاح' 
          : 'Service availability updated successfully'
      );
    } catch (error) {
      console.error('Error updating service availability:', error);
      toast.error(
        language === 'ar' 
          ? 'فشل في تحديث توفر الخدمة' 
          : 'Failed to update service availability'
      );
    }
  };

  // Bulk actions: enable or disable all services in a category
  const handleBulkAction = async (enable: boolean) => {
    if (!selectedBranch || !selectedCategory) return;
    
    try {
      const services = getServicesForCategory(selectedCategory);
      
      for (const service of services) {
        await toggleServiceAvailability(service.id, enable);
      }
      
      toast.success(
        language === 'ar' 
          ? 'تم تحديث توفر الخدمات بنجاح' 
          : 'Services availability updated successfully'
      );
    } catch (error) {
      console.error('Error updating services availability:', error);
      toast.error(
        language === 'ar' 
          ? 'فشل في تحديث توفر الخدمات' 
          : 'Failed to update services availability'
      );
    }
  };

  if (isLoading || dataLoading || availabilityLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="branch-select">
            {language === 'ar' ? 'اختر الفرع' : 'Select Branch'}
          </Label>
          <Select 
            value={selectedBranch || ''} 
            onValueChange={setSelectedBranch}
          >
            <SelectTrigger id="branch-select" className="w-full">
              <SelectValue placeholder={language === 'ar' ? 'اختر الفرع' : 'Select a branch'} />
            </SelectTrigger>
            <SelectContent>
              {branches.map(branch => (
                <SelectItem key={branch.id} value={branch.id}>
                  {language === 'ar' ? branch.name_ar : branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="category-select">
            {language === 'ar' ? 'اختر فئة الخدمة' : 'Select Service Category'}
          </Label>
          <Select 
            value={selectedCategory || ''} 
            onValueChange={setSelectedCategory}
          >
            <SelectTrigger id="category-select" className="w-full">
              <SelectValue placeholder={language === 'ar' ? 'اختر فئة' : 'Select a category'} />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {language === 'ar' ? category.name_ar : category.name_en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {selectedBranch && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">
              {language === 'ar' 
                ? 'الخدمات المتوفرة في هذا الفرع' 
                : 'Services Available at this Branch'}
            </h3>
            
            <div className="flex space-x-2 rtl:space-x-reverse">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction(true)}
                className="text-sm"
              >
                {language === 'ar' ? 'تمكين الكل' : 'Enable All'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction(false)}
                className="text-sm"
              >
                {language === 'ar' ? 'تعطيل الكل' : 'Disable All'}
              </Button>
            </div>
          </div>
          
          <div className="border rounded-md">
            {getServicesForCategory(selectedCategory).length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                {language === 'ar' 
                  ? 'لا توجد خدمات في هذه الفئة' 
                  : 'No services in this category'}
              </div>
            ) : (
              <div className="divide-y">
                {getServicesForCategory(selectedCategory).map(service => (
                  <div 
                    key={service.id} 
                    className="flex items-center justify-between p-4 hover:bg-muted/50"
                  >
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <Checkbox 
                        id={`service-${service.id}`}
                        checked={getServiceAvailability(service.id)}
                        onCheckedChange={() => handleToggleAvailability(service.id)}
                        disabled={updatingServiceIds.includes(service.id)}
                      />
                      <Label 
                        htmlFor={`service-${service.id}`}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {language === 'ar' ? service.name_ar : service.name_en}
                      </Label>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {service.price} {language === 'ar' ? 'ريال' : 'SAR'} • {service.duration} {language === 'ar' ? 'دقيقة' : 'min'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
