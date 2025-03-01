
import * as React from "react";
import { formatDuration } from "@/utils/formatters";

interface ServiceCardHeaderProps {
  serviceName: string;
  duration: number;
  language: string;
}

export const ServiceCardHeader = ({ 
  serviceName, 
  duration, 
  language 
}: ServiceCardHeaderProps) => {
  return (
    <div>
      <h3 className="font-medium text-base mb-2">{serviceName}</h3>
      <div className="text-sm text-muted-foreground">
        {formatDuration(duration, language)}
      </div>
    </div>
  );
};
