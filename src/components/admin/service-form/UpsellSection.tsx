
import { Service } from '@/types/service';
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface UpsellSectionProps {
  service: Partial<Service>;
  availableServices: Service[];
  selectedUpsells: Array<{ serviceId: string; discountPercentage: number }>;
  onUpsellsChange: (upsells: Array<{ serviceId: string; discountPercentage: number }>) => void;
  language: string;
  isMobile?: boolean;
}

export const UpsellSection = ({ 
  service, 
  availableServices, 
  selectedUpsells, 
  onUpsellsChange,
  language,
  isMobile = false
}: UpsellSectionProps) => {
  // Don't show upsell section for new services
  if (!service.id) return null;

  const filteredServices = availableServices.filter(s => 
    s.id !== service.id && 
    !selectedUpsells.some(upsell => upsell.serviceId === s.id)
  );

  const handleAddUpsell = () => {
    if (filteredServices.length > 0) {
      const newUpsells = [
        ...selectedUpsells,
        { serviceId: filteredServices[0].id, discountPercentage: 10 }
      ];
      onUpsellsChange(newUpsells);
    }
  };

  const handleRemoveUpsell = (index: number) => {
    const newUpsells = [...selectedUpsells];
    newUpsells.splice(index, 1);
    onUpsellsChange(newUpsells);
  };

  const handleUpsellChange = (index: number, serviceId: string) => {
    const newUpsells = [...selectedUpsells];
    newUpsells[index].serviceId = serviceId;
    onUpsellsChange(newUpsells);
  };

  const handleDiscountChange = (index: number, discountPercentage: number) => {
    const newUpsells = [...selectedUpsells];
    newUpsells[index].discountPercentage = discountPercentage;
    onUpsellsChange(newUpsells);
  };

  const getServiceName = (serviceId: string) => {
    const foundService = availableServices.find(s => s.id === serviceId);
    return language === 'ar' ? foundService?.name_ar : foundService?.name_en;
  };

  return (
    <div className={`space-y-${isMobile ? '3' : '4'}`}>
      <div className={`flex justify-between items-center ${isMobile ? 'mb-1' : 'mb-2'}`}>
        <h3 className={`font-medium ${isMobile ? 'text-sm' : 'text-base'}`}>Upsell Services</h3>
        <Button 
          type="button" 
          variant="outline" 
          size={isMobile ? "sm" : "default"}
          onClick={handleAddUpsell}
          disabled={filteredServices.length === 0}
          className={isMobile ? "h-7 px-2 text-xs" : ""}
        >
          <Plus className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} mr-1`} />
          Add Upsell
        </Button>
      </div>

      {selectedUpsells.length > 0 ? (
        <div className={`space-y-${isMobile ? '2' : '3'}`}>
          {selectedUpsells.map((upsell, index) => (
            <div key={index} className={`grid grid-cols-${isMobile ? '7' : '8'} gap-2 items-center`}>
              <div className={`col-span-${isMobile ? '4' : '5'}`}>
                <Select
                  value={upsell.serviceId}
                  onValueChange={(value) => handleUpsellChange(index, value)}
                >
                  <SelectTrigger className={isMobile ? "h-8 text-xs" : ""}>
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={upsell.serviceId}>
                      {getServiceName(upsell.serviceId)}
                    </SelectItem>
                    {filteredServices.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {language === 'ar' ? service.name_ar : service.name_en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className={`col-span-${isMobile ? '2' : '2'}`}>
                <Input
                  type="number"
                  value={upsell.discountPercentage}
                  onChange={(e) => handleDiscountChange(index, parseInt(e.target.value) || 0)}
                  min="0"
                  max="100"
                  className={isMobile ? "h-8 text-xs" : ""}
                />
              </div>
              <div className="col-span-1 flex items-center">
                <span className={`${isMobile ? 'text-xs' : 'text-sm'}`}>%</span>
              </div>
              <div className="col-span-1 flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveUpsell(index)}
                  className={isMobile ? "h-6 w-6" : "h-8 w-8"}
                >
                  <X className={isMobile ? "h-3 w-3" : "h-4 w-4"} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
          Add upsell services to offer discounted complementary services.
        </p>
      )}
    </div>
  );
};
