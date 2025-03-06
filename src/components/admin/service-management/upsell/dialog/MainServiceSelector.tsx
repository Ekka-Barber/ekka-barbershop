
import { Info } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { Service } from '@/types/service';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MainServiceSelectorProps {
  mainServiceId: string;
  onChange: (value: string) => void;
  allServices: Service[] | undefined;
}

export const MainServiceSelector = ({ 
  mainServiceId, 
  onChange, 
  allServices 
}: MainServiceSelectorProps) => {
  const { language } = useLanguage();
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium flex items-center">
          <span className="flex items-center justify-center w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs mr-2">1</span>
          Select Main Service
        </label>
        <div className="text-xs text-muted-foreground">Required</div>
      </div>
      <Select
        value={mainServiceId}
        onValueChange={onChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select main service" />
        </SelectTrigger>
        <SelectContent className="max-h-80">
          <ScrollArea className="h-80">
            {allServices?.map(service => (
              <SelectItem key={`main-${service.id}`} value={service.id}>
                {language === 'ar' ? service.name_ar : service.name_en}
              </SelectItem>
            ))}
          </ScrollArea>
        </SelectContent>
      </Select>
      <div className="flex items-start text-xs text-muted-foreground bg-muted/30 p-2 rounded border border-muted/50">
        <Info className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
        <p>This is the primary service that customers will purchase first.</p>
      </div>
    </div>
  );
};
