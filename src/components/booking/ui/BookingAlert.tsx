
import React from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, InfoIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type AlertVariant = 'error' | 'success' | 'warning' | 'info';

interface BookingAlertProps {
  title?: string;
  message: string;
  variant: AlertVariant;
  className?: string;
}

export const BookingAlert = ({
  title,
  message,
  variant = 'info',
  className
}: BookingAlertProps) => {
  // Icon and color based on variant
  const variantConfig = {
    error: {
      icon: AlertCircle,
      containerClass: 'border-red-100 bg-red-50 text-red-800',
      iconClass: 'text-red-500'
    },
    success: {
      icon: CheckCircle,
      containerClass: 'border-green-100 bg-green-50 text-green-800',
      iconClass: 'text-green-500'
    },
    warning: {
      icon: AlertTriangle,
      containerClass: 'border-yellow-100 bg-yellow-50 text-yellow-800',
      iconClass: 'text-yellow-500'
    },
    info: {
      icon: InfoIcon, 
      containerClass: 'border-blue-100 bg-blue-50 text-blue-800',
      iconClass: 'text-blue-500'
    }
  };
  
  const IconComponent = variantConfig[variant].icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className={cn(
        'p-4 rounded-lg border flex items-start space-x-3 shadow-sm',
        variantConfig[variant].containerClass,
        className
      )}
    >
      <IconComponent className={cn('w-5 h-5 mt-0.5', variantConfig[variant].iconClass)} />
      <div className="flex-1">
        {title && <p className="font-medium">{title}</p>}
        <p className="text-sm">{message}</p>
      </div>
    </motion.div>
  );
};
