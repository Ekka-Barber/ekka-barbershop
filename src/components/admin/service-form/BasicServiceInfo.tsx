
import { Service } from '@/types/service';
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Category } from '@/types/service';
import { useEffect, useState } from 'react';

interface BasicServiceInfoProps {
  service: Partial<Service>;
  categories: Category[] | undefined;
  onChange: (service: Partial<Service>) => void;
  isMobile?: boolean;
}

export const BasicServiceInfo = ({ service, categories, onChange, isMobile = false }: BasicServiceInfoProps) => {
  // Important: Initialize with the service's category_id if it exists
  const [selectedCategory, setSelectedCategory] = useState<string>(service.category_id || '');

  // When service changes (e.g., when a different service is loaded for editing),
  // update the selectedCategory state
  useEffect(() => {
    if (service.category_id) {
      setSelectedCategory(service.category_id);
      console.log("Category ID set:", service.category_id);
    }
  }, [service]);

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    onChange({ ...service, category_id: value });
  };

  return (
    <div className={`grid grid-cols-1 ${isMobile ? 'gap-3' : 'md:grid-cols-2 gap-6'}`}>
      <div className={`space-y-${isMobile ? '1' : '2'}`}>
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Category</label>
        <Select
          value={selectedCategory}
          onValueChange={handleCategoryChange}
          defaultValue={service.category_id}
        >
          <SelectTrigger className={`w-full ${isMobile ? 'h-8 text-sm' : ''}`}>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories?.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name_en}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className={`space-y-${isMobile ? '1' : '2'}`}>
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Duration (minutes)</label>
        <Input
          type="number"
          value={service.duration || ''}
          onChange={(e) => onChange({ ...service, duration: parseInt(e.target.value) || 0 })}
          placeholder="Enter duration"
          className={`w-full ${isMobile ? 'h-8 text-sm' : ''}`}
        />
      </div>

      <div className={`space-y-${isMobile ? '1' : '2'}`}>
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Name (English)</label>
        <Input
          type="text"
          value={service.name_en || ''}
          onChange={(e) => onChange({ ...service, name_en: e.target.value })}
          placeholder="Service name in English"
          className={`w-full ${isMobile ? 'h-8 text-sm' : ''}`}
        />
      </div>

      <div className={`space-y-${isMobile ? '1' : '2'}`}>
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Name (Arabic)</label>
        <Input
          type="text"
          dir="rtl"
          value={service.name_ar || ''}
          onChange={(e) => onChange({ ...service, name_ar: e.target.value })}
          placeholder="اسم الخدمة بالعربية"
          className={`w-full ${isMobile ? 'h-8 text-sm' : ''}`}
        />
      </div>
    </div>
  );
};
