
import React from 'react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { usePackageManagement } from '@/hooks/usePackageManagement';
import { BaseServiceCard } from './BaseServiceCard';
import { DraggableServiceGrid } from './DraggableServiceGrid';
import { DiscountPyramid } from './DiscountPyramid';
import { MaxServicesControl } from './MaxServicesControl';
import { AlertTriangle, Save } from 'lucide-react';

export const PackageManagement = () => {
  const {
    services,
    baseService,
    packageSettings,
    isLoading,
    isSaving,
    updatePackageSettings,
    toggleService,
    reorderServices,
    saveSettings,
    isBaseService,
    isServiceEnabled
  } = usePackageManagement();
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">
            Package Management
          </h2>
          <p className="text-muted-foreground">
            Configure service packages and discounts
          </p>
        </div>
        <Button 
          onClick={saveSettings} 
          disabled={isLoading || isSaving}
          className="self-start"
        >
          {isSaving ? (
            <>Saving...</>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Package Settings
            </>
          )}
        </Button>
      </div>
      
      <Separator />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold mb-3">Base Service</h3>
          <BaseServiceCard 
            service={baseService} 
            isLoading={isLoading} 
          />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-3">Package Limits</h3>
          <MaxServicesControl 
            settings={packageSettings}
            onChange={updatePackageSettings}
          />
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-3">Available Add-on Services</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Toggle services to enable them as add-ons for the package. Drag enabled services to reorder how they appear to customers.
        </p>
        <DraggableServiceGrid 
          services={services}
          isLoading={isLoading}
          isBaseService={isBaseService}
          isServiceEnabled={isServiceEnabled}
          onToggleService={toggleService}
          onReorderServices={reorderServices}
        />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-3">Discount Structure</h3>
        <DiscountPyramid 
          settings={packageSettings}
          onChange={updatePackageSettings}
          isLoading={isLoading}
        />
      </div>

      <div className="bg-yellow-50 border border-yellow-300 rounded-md p-4 flex gap-3">
        <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-medium text-yellow-800">Implementation Note</h4>
          <p className="text-yellow-700 text-sm mt-1">
            After configuring your package settings, you'll need to update the booking system to apply 
            these discounts. The discounts will only apply to add-on services, not the base service.
          </p>
        </div>
      </div>
    </div>
  );
};
