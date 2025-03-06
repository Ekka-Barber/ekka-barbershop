
import React from 'react';
import { cn } from "@/lib/utils";
import { formatDuration } from "@/utils/formatters";
import { Clock } from 'lucide-react';

interface DurationDisplayProps {
  duration: number;
  language: string;
  isRTL: boolean;
}

/**
 * Component that displays the total duration of selected services
 * with proper RTL support and formatted duration
 */
export const DurationDisplay = ({
  duration,
  language,
  isRTL
}: DurationDisplayProps) => {
  return (
    <div className={cn(
      "flex justify-between items-center text-sm text-muted-foreground py-2",
      isRTL && "flex-row-reverse"
    )}>
      <span className="font-medium">
        {formatDuration(duration, language as 'en' | 'ar')}
      </span>
      <div className={cn(
        "flex items-center gap-1.5",
        isRTL && "flex-row-reverse"
      )}>
        <Clock className="h-4 w-4" />
        {isRTL ? "المدة الإجمالية:" : "Total Duration:"}
      </div>
    </div>
  );
};
