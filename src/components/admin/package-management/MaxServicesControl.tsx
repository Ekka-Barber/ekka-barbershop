
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PackageSettings } from '@/types/admin';

interface MaxServicesControlProps {
  settings: PackageSettings;
  onChange: (newSettings: Partial<PackageSettings>) => void;
}

export const MaxServicesControl = ({ 
  settings, 
  onChange 
}: MaxServicesControlProps) => {
  const hasLimit = settings.maxServices !== null;
  
  const toggleLimit = (enabled: boolean) => {
    onChange({
      maxServices: enabled ? 5 : null
    });
  };
  
  const handleMaxServicesChange = (value: string) => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue) || numValue < 1) return;
    
    onChange({
      maxServices: numValue
    });
  };
  
  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="limit-services">Limit add-on services</Label>
            <p className="text-xs text-muted-foreground">
              Set maximum number of services that can be added
            </p>
          </div>
          <Switch
            id="limit-services"
            checked={hasLimit}
            onCheckedChange={toggleLimit}
          />
        </div>
        
        {hasLimit && (
          <div className="mt-4">
            <Label htmlFor="max-services">Maximum services</Label>
            <Input
              id="max-services"
              type="number"
              value={settings.maxServices ?? ''}
              onChange={(e) => handleMaxServicesChange(e.target.value)}
              className="w-full mt-1"
              min="1"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
