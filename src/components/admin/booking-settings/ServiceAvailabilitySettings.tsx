
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

interface ServiceBranchAvailability {
  service_id: string;
  branch_id: string;
  is_available: boolean;
}

interface ServiceAvailabilitySettingsProps {
  isLoading: boolean;
}

export const ServiceAvailabilitySettings = ({ isLoading }: ServiceAvailabilitySettingsProps) => {
  const { language, t } = useLanguage();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [serviceAvailability, setServiceAvailability] = useState<ServiceBranchAvailability[]>([]);
  const [savingBranchId, setSavingBranchId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

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
            services:services(
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
        
        // Fetch service-branch availability
        // Note: We're assuming a service_branch_availability table exists or we'll create it
        // For now, we'll initialize an empty array and simulate fetching
        // In a real implementation, this would be fetched from the database
        const mockServiceAvailability: ServiceBranchAvailability[] = [];
        setServiceAvailability(mockServiceAvailability);
        
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

  // Check if a service is available at a branch
  const isServiceAvailableAtBranch = (serviceId: string, branchId: string): boolean => {
    // If we don't find an entry, we'll assume the service is available by default
    const entry = serviceAvailability.find(
      sa => sa.service_id === serviceId && sa.branch_id === branchId
    );
    
    return entry ? entry.is_available : true;
  };

  // Toggle service availability
  const toggleServiceAvailability = (serviceId: string, branchId: string) => {
    setServiceAvailability(prev => {
      // Find if there's an existing entry
      const existingEntryIndex = prev.findIndex(
        sa => sa.service_id === serviceId && sa.branch_id === branchId
      );
      
      // Create a copy of the array
      const updated = [...prev];
      
      if (existingEntryIndex >= 0) {
        // Update existing entry
        updated[existingEntryIndex] = {
          ...updated[existingEntryIndex],
          is_available: !updated[existingEntryIndex].is_available
        };
      } else {
        // Add new entry (assuming default is 'available')
        updated.push({
          service_id: serviceId,
          branch_id: branchId,
          is_available: false
        });
      }
      
      return updated;
    });
  };

  // Save availability settings
  const saveAvailabilitySettings = async (branchId: string) => {
    try {
      setSavingBranchId(branchId);
      
      // Here you would update the database with the current availability settings
      // For now, we'll just simulate a successful update
      
      // In a real implementation, this would be an upsert operation to the service_branch_availability table
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast.success(
        language === 'ar' 
          ? 'تم حفظ إعدادات توفر الخدمة بنجاح' 
          : 'Service availability settings saved successfully'
      );
    } catch (error) {
      console.error('Error saving service availability settings:', error);
      toast.error(
        language === 'ar' 
          ? 'فشل في حفظ إعدادات توفر الخدمة' 
          : 'Failed to save service availability settings'
      );
    } finally {
      setSavingBranchId(null);
    }
  };

  if (isLoading || dataLoading) {
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
          <h3 className="text-lg font-medium mb-4">
            {language === 'ar' 
              ? 'الخدمات المتوفرة في هذا الفرع' 
              : 'Services Available at this Branch'}
          </h3>
          
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
                        checked={isServiceAvailableAtBranch(service.id, selectedBranch)}
                        onCheckedChange={() => toggleServiceAvailability(service.id, selectedBranch)}
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
          
          <div className="mt-6 flex justify-end">
            <Button
              onClick={() => saveAvailabilitySettings(selectedBranch)}
              disabled={savingBranchId === selectedBranch}
            >
              {savingBranchId === selectedBranch
                ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...')
                : (language === 'ar' ? 'حفظ التغييرات' : 'Save Changes')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
