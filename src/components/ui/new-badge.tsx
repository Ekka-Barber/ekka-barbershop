
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface NewBadgeProps {
  className?: string;
}

export function NewBadge({ className }: NewBadgeProps) {
  const { language } = useLanguage();
  
  return (
    <div className={cn(
      "absolute -top-2 -right-2 bg-[#C4A484] text-white text-xs font-bold px-2 py-0.5 rounded-full",
      "animate-bounce shadow-lg z-10",
      className
    )}>
      {language === 'ar' ? 'جديد' : 'NEW'}
    </div>
  );
}
