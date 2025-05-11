
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ServiceWithUpsells } from './types';
import { Input } from '@/components/ui/input';
import { Trash2, Save, Pencil, Check, X } from 'lucide-react';

export interface UpsellServiceListProps {
  servicesWithUpsells: ServiceWithUpsells[];
  onUpdateDiscount: (id: string, discount: number) => void;
  onDeleteUpsell: (id: string) => void;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

export const UpsellServiceList: React.FC<UpsellServiceListProps> = ({
  servicesWithUpsells,
  onUpdateDiscount,
  onDeleteUpsell,
  isUpdating = false,
  isDeleting = false,
}) => {
  const [editingItem, setEditingItem] = React.useState<{id: string, value: number} | null>(null);
  
  const handleEditStart = (id: string, currentValue: number) => {
    setEditingItem({ id, value: currentValue });
  };
  
  const handleEditCancel = () => {
    setEditingItem(null);
  };
  
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
    if (editingItem) {
      setEditingItem({ ...editingItem, value });
    }
  };
  
  const handleSaveDiscount = () => {
    if (editingItem) {
      onUpdateDiscount(editingItem.id, editingItem.value);
      setEditingItem(null);
    }
  };

  if (servicesWithUpsells.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-muted/20">
        <p className="text-muted-foreground">No upsell relationships have been set up yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {servicesWithUpsells.map((service) => (
        <Card key={service.id}>
          <CardHeader>
            <CardTitle>{service.name_en}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground">Upsell Services:</h4>
              
              <div className="space-y-2">
                {service.upsells?.map((upsell) => (
                  <div key={upsell.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div>
                      <p className="font-medium">{upsell.upsell.name_en}</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {editingItem?.id === upsell.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={editingItem.value}
                            onChange={handleValueChange}
                            className="w-16 h-8 text-right"
                            min="0"
                            max="100"
                          />
                          <span className="text-sm">%</span>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={handleSaveDiscount}
                            disabled={isUpdating}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={handleEditCancel}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <span className="font-medium">{upsell.discount_percentage}% discount</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditStart(upsell.id, upsell.discount_percentage)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={isDeleting}
                            onClick={() => onDeleteUpsell(upsell.id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
