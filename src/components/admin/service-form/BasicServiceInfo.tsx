
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
}

export const BasicServiceInfo = ({ service, categories, onChange }: BasicServiceInfoProps) => {
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Category</label>
        <Select
          value={selectedCategory}
          onValueChange={handleCategoryChange}
          defaultValue={service.category_id}
        >
          <SelectTrigger className="w-full">
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

      <div className="space-y-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Duration (minutes)</label>
        <Input
          type="number"
          value={service.duration || ''}
          onChange={(e) => onChange({ ...service, duration: parseInt(e.target.value) || 0 })}
          placeholder="Enter duration"
          className="w-full"
        />
      </div>
    </div>
  );
};
