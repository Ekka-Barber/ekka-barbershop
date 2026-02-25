import { Heart } from "lucide-react";
import { useState } from "react";

import { VersionDialog } from "./VersionDialog";

export const DashboardFooter = () => {
  const [showVersionDialog, setShowVersionDialog] = useState(false);

  return (
    <>
      <div className="mt-12 pt-8 pb-6 border-t border-gray-200">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <span className="font-['Changa'] text-sm">صنع بحب</span>
            <Heart className="h-4 w-4 text-red-500 animate-pulse" />
            <span className="font-['Changa'] text-sm">: إكّــه للعناية بالرجل</span>
          </div>
          
          <button
            onClick={() => setShowVersionDialog(true)}
            className="text-xs text-gray-500 hover:text-ekka-gold transition-colors duration-200 font-['Changa'] underline decoration-dotted underline-offset-2"
          >
            النسخة: v1.2.0
          </button>
          
          <p className="text-xs text-gray-400 font-['Changa']">
            جميع الحقوق محفوظة © 2024
          </p>
        </div>
      </div>

      <VersionDialog 
        open={showVersionDialog} 
        onOpenChange={setShowVersionDialog} 
      />
    </>
  );
}; 
