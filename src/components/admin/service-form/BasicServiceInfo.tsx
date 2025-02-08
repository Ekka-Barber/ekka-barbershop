
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

interface BasicServiceInfoProps {
  service: Partial<Service>;
  categories: Category[] | undefined;
  onChange: (service: Partial<Service>) => void;
}

export const BasicServiceInfo = ({ service, categories, onChange }: BasicServiceInfoProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Category</label>
        <Select
          value={service.category_id}
          onValueChange={(value) => onChange({ ...service, category_id: value })}
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
