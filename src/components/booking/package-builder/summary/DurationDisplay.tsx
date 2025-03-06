
import React from 'react';
import { cn } from "@/lib/utils";
import { formatDuration } from "@/utils/formatters";

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
      "flex justify-between text-sm text-muted-foreground",
      isRTL && "flex-row-reverse"
    )}>
      <span>
        {formatDuration(duration, language as 'en' | 'ar')}
      </span>
      <div className={cn(
        "flex items-center gap-1.5",
        isRTL && "flex-row-reverse"
      )}>
        {isRTL ? "المدة الإجمالية:" : "Total Duration:"}
      </div>
    </div>
  );
};
