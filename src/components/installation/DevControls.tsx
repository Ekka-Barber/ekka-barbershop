
import React from 'react';
import { Button } from "@/components/ui/button";
import { setDeviceOverride, setInstalledOverride } from "@/services/platformDetection";

export function DevControls() {
  if (!import.meta.env.DEV) return null;

  return (
    <div className="fixed top-0 right-0 p-2 bg-black/80 text-white rounded-bl-lg z-50 text-sm">
      <div className="space-y-2">
        <p className="font-bold">Dev Controls</p>
        <div className="space-x-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => {
              setDeviceOverride('ios');
              setInstalledOverride(false);
              window.location.reload();
            }}
          >
            Test iOS
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => {
              setDeviceOverride('android');
              setInstalledOverride(false);
              window.location.reload();
            }}
          >
            Test Android
          </Button>
        </div>
        <div className="space-x-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => {
              setDeviceOverride(null);
              setInstalledOverride(null);
              window.location.reload();
            }}
          >
            Reset
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => {
              setInstalledOverride(true);
              window.location.reload();
            }}
          >
            Set Installed
          </Button>
        </div>
      </div>
    </div>
  );
}
