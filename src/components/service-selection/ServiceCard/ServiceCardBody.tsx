
import { Timer } from "lucide-react";
import { formatDuration } from "@/utils/formatting/time";

interface ServiceCardBodyProps {
  duration: number;
  language: string;
}

export const ServiceCardBody = ({ duration, language }: ServiceCardBodyProps) => {
  return (
    <div className="flex items-center text-sm text-gray-500">
      <Timer className="w-4 h-4 mr-1" />
      <span>{formatDuration(duration, language)}</span>
    </div>
  );
};
