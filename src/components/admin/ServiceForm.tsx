import { Service } from '@/types/service';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Category } from '@/types/service';

type ServiceFormProps = {
  categories: Category[] | undefined;
  service: Partial<Service>;
  onChange: (service: Partial<Service>) => void;
};

export const ServiceForm = ({ categories, service, onChange }: ServiceFormProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Category</label>
        <Select
          value={service.category_id}
          onValueChange={(value) => onChange({ ...service, category_id: value })}
        >
          <SelectTrigger>
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
        <label className="text-sm font-medium">English Name</label>
        <Input
          value={service.name_en}
          onChange={(e) => onChange({ ...service, name_en: e.target.value })}
          placeholder="Enter service name in English"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Arabic Name</label>
        <Input
          value={service.name_ar}
          onChange={(e) => onChange({ ...service, name_ar: e.target.value })}
          placeholder="Enter service name in Arabic"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">English Description</label>
        <Textarea
          value={service.description_en || ''}
          onChange={(e) => onChange({ ...service, description_en: e.target.value })}
          placeholder="Enter service description in English"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Arabic Description</label>
        <Textarea
          value={service.description_ar || ''}
          onChange={(e) => onChange({ ...service, description_ar: e.target.value })}
          placeholder="Enter service description in Arabic"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Duration (minutes)</label>
          <Input
            type="number"
            value={service.duration || ''}
            onChange={(e) => onChange({ ...service, duration: parseInt(e.target.value) || 0 })}
            placeholder="Enter duration"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Price</label>
          <Input
            type="number"
            value={service.price || ''}
            onChange={(e) => onChange({ ...service, price: parseFloat(e.target.value) || 0 })}
            placeholder="Enter price"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Discount Type</label>
        <Select
          value={service.discount_type || ''}
          onValueChange={(value: 'percentage' | 'amount' | '') => 
            onChange({ 
              ...service, 
              discount_type: value || null 
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select discount type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">No discount</SelectItem>
            <SelectItem value="percentage">Percentage</SelectItem>
            <SelectItem value="amount">Amount</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {service.discount_type && (
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Discount Value {service.discount_type === 'percentage' ? '(%)' : '($)'}
          </label>
          <Input
            type="number"
            value={service.discount_value || ''}
            onChange={(e) => onChange({ 
              ...service, 
              discount_value: parseFloat(e.target.value) || 0 
            })}
            placeholder={`Enter discount ${service.discount_type === 'percentage' ? 'percentage' : 'amount'}`}
          />
        </div>
      )}
    </div>
  );
};