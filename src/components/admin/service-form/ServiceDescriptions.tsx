
import { Service } from '@/types/service';
import { Textarea } from "@/components/ui/textarea";

interface ServiceDescriptionsProps {
  service: Partial<Service>;
  onChange: (service: Partial<Service>) => void;
  isMobile?: boolean;
}

export const ServiceDescriptions = ({ service, onChange, isMobile = false }: ServiceDescriptionsProps) => {
  return (
    <div className={`grid grid-cols-1 ${isMobile ? 'gap-3' : 'md:grid-cols-2 gap-6'}`}>
      <div className={`space-y-${isMobile ? '1' : '2'}`}>
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Description (English)</label>
        <Textarea
          value={service.description_en || ''}
          onChange={(e) => onChange({ ...service, description_en: e.target.value })}
          placeholder="Service description in English (optional)"
          className={`w-full ${isMobile ? 'text-sm min-h-[60px]' : 'min-h-[80px]'}`}
        />
      </div>

      <div className={`space-y-${isMobile ? '1' : '2'}`}>
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Description (Arabic)</label>
        <Textarea
          dir="rtl"
          value={service.description_ar || ''}
          onChange={(e) => onChange({ ...service, description_ar: e.target.value })}
          placeholder="وصف الخدمة بالعربية (اختياري)"
          className={`w-full ${isMobile ? 'text-sm min-h-[60px]' : 'min-h-[80px]'}`}
        />
      </div>
    </div>
  );
};
