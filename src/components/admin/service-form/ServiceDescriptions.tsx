
import { Service } from '@/types/service';
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface ServiceDescriptionsProps {
  service: Partial<Service>;
  onChange: (service: Partial<Service>) => void;
}

export const ServiceDescriptions = ({ service, onChange }: ServiceDescriptionsProps) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">English Name</label>
          <Input
            value={service.name_en}
            onChange={(e) => onChange({ ...service, name_en: e.target.value })}
            placeholder="Enter service name in English"
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Arabic Name</label>
          <Input
            value={service.name_ar}
            onChange={(e) => onChange({ ...service, name_ar: e.target.value })}
            placeholder="Enter service name in Arabic"
            className="w-full"
            dir="rtl"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">English Description</label>
        <Textarea
          value={service.description_en || ''}
          onChange={(e) => onChange({ ...service, description_en: e.target.value })}
          placeholder="Enter service description in English"
          className="min-h-[100px] resize-none"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Arabic Description</label>
        <Textarea
          value={service.description_ar || ''}
          onChange={(e) => onChange({ ...service, description_ar: e.target.value })}
          placeholder="Enter service description in Arabic"
          className="min-h-[100px] resize-none"
          dir="rtl"
        />
      </div>
    </>
  );
};
