
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ServiceCardActionsProps {
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
}

export const ServiceCardActions = ({ 
  isSelected, 
  onSelect 
}: ServiceCardActionsProps) => {
  return (
    <div className="flex-1 flex items-end">
      <Button
        size="icon"
        variant="ghost"
        className={cn(
          "h-6 w-6 rounded-full transition-all duration-300",
          isSelected 
            ? "hover:bg-red-100 text-red-500" 
            : "hover:bg-green-100 text-green-500"
        )}
        onClick={onSelect}
      >
        <div className="transition-transform duration-300">
          {isSelected ? (
            <Minus className="h-4 w-4" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
        </div>
      </Button>
    </div>
  );
};
