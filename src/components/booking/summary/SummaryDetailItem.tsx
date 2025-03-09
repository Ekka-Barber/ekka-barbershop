
import { motion } from "framer-motion";
import { ReactNode } from "react";
import { PriceDisplay } from "@/components/ui/price-display";

interface SummaryDetailItemProps {
  label: ReactNode;
  value?: ReactNode;
  icon?: ReactNode;
  valueClassName?: string;
  priceValue?: number;
  language?: 'en' | 'ar';
  variant?: 'default' | 'highlight' | 'discount' | 'savings';
  animate?: boolean;
}

export const SummaryDetailItem = ({
  label,
  value,
  icon,
  valueClassName = "",
  priceValue,
  language = 'en',
  variant = 'default',
  animate = false
}: SummaryDetailItemProps) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'highlight':
        return 'font-medium';
      case 'discount':
        return 'text-destructive';
      case 'savings':
        return 'text-green-700';
      default:
        return 'text-muted-foreground';
    }
  };

  const valueComponent = priceValue !== undefined ? (
    <PriceDisplay
      price={priceValue}
      language={language}
      size="sm"
      className={valueClassName}
    />
  ) : (
    value
  );

  const contentWrapper = (content: ReactNode) => {
    if (animate) {
      return (
        <motion.span
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          {content}
        </motion.span>
      );
    }
    return content;
  };

  return (
    <div className={`pt-2 flex justify-between items-center ${getVariantClasses()}`}>
      <span className="flex items-center gap-2">
        {icon}
        {label}
      </span>
      {contentWrapper(valueComponent)}
    </div>
  );
};
