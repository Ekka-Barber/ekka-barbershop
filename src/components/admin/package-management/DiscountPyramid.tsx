
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PackageSettings } from '@/types/admin';

interface DiscountPyramidProps {
  settings: PackageSettings;
  onChange: (newSettings: Partial<PackageSettings>) => void;
  isLoading: boolean;
}

export const DiscountPyramid = ({ 
  settings, 
  onChange,
  isLoading
}: DiscountPyramidProps) => {
  
  const handleDiscountChange = (
    level: 'oneService' | 'twoServices' | 'threeOrMore', 
    value: string
  ) => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue) || numValue < 0 || numValue > 100) return;
    
    onChange({
      discountTiers: {
        ...settings.discountTiers,
        [level]: numValue
      }
    });
  };
  
  const pyramidLevels = [
    {
      key: 'base',
      label: 'Base Service',
      discountLabel: 'No Discount',
      height: 'h-16',
      width: 'w-3/4',
      color: 'bg-primary/80 text-white',
      isEditable: false
    },
    {
      key: 'oneService',
      label: '+ 1 Service',
      discountLabel: `${settings.discountTiers.oneService}% off add-on`,
      height: 'h-16',
      width: 'w-4/5',
      color: 'bg-primary/60 text-white',
      isEditable: true,
      value: settings.discountTiers.oneService
    },
    {
      key: 'twoServices',
      label: '+ 2 Services',
      discountLabel: `${settings.discountTiers.twoServices}% off add-ons`,
      height: 'h-16',
      width: 'w-11/12',
      color: 'bg-primary/40 text-black',
      isEditable: true,
      value: settings.discountTiers.twoServices
    },
    {
      key: 'threeOrMore',
      label: '+ 3 Services or more',
      discountLabel: `${settings.discountTiers.threeOrMore}% off add-ons`,
      height: 'h-16',
      width: 'w-full',
      color: 'bg-primary/20 text-black',
      isEditable: true,
      value: settings.discountTiers.threeOrMore
    }
  ];
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center space-y-2">
        {[...Array(4)].map((_, i) => (
          <div 
            key={i} 
            className={`animate-pulse bg-gray-200 rounded ${
              i === 0 ? 'w-3/4' : i === 1 ? 'w-4/5' : i === 2 ? 'w-11/12' : 'w-full'
            } h-16`}
          ></div>
        ))}
      </div>
    );
  }
  
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-center">
          Discount Tiers
        </h3>
        <div className="flex flex-col items-center space-y-2">
          {pyramidLevels.map((level, index) => (
            <div
              key={level.key}
              className={`${level.height} ${level.width} ${level.color} rounded-md flex items-center justify-between px-4 transition-all`}
            >
              <span className="font-medium">{level.label}</span>
              {level.isEditable ? (
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    value={level.value}
                    onChange={(e) => handleDiscountChange(
                      level.key as 'oneService' | 'twoServices' | 'threeOrMore',
                      e.target.value
                    )}
                    className="w-16 h-8 text-black bg-white/80"
                    min="0"
                    max="100"
                  />
                  <span>%</span>
                </div>
              ) : (
                <span className="font-medium">{level.discountLabel}</span>
              )}
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-4 text-center">
          Set the discount percentage for each tier of additional services
        </p>
      </CardContent>
    </Card>
  );
};
