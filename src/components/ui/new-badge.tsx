
import { cn } from "@/lib/utils";

interface NewBadgeProps {
  className?: string;
}

export function NewBadge({ className }: NewBadgeProps) {
  return (
    <div className={cn(
      "absolute -top-2 -right-2 bg-[#C4A36F] text-white text-xs font-bold px-2 py-0.5 rounded-full",
      "animate-bounce shadow-lg",
      className
    )}>
      NEW
    </div>
  );
}
