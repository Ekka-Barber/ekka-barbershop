import { Edit, FileText, Trash2 } from 'lucide-react';
import React from 'react';

import { useDocumentTypeMeta } from '@features/hr/hooks/useDocumentTypes';

import { motion, useReducedMotion } from '@shared/lib/motion';
import type { HRDocument } from '@shared/types/hr.types';
import { Badge } from '@shared/ui/components/badge';
import { Button } from '@shared/ui/components/button';
import { Checkbox } from '@shared/ui/components/checkbox';

interface DocumentItemProps {
  document: HRDocument;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const getDaysUntil = (expiryDate: string) => {
  const expiry = new Date(expiryDate);
  const today = new Date();
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

const isExpiringSoon = (expiryDate: string) => {
  const days = getDaysUntil(expiryDate);
  return days <= 30 && days > 0;
};

const isExpired = (expiryDate: string) => new Date(expiryDate) < new Date();

export const DocumentItem: React.FC<DocumentItemProps> = ({
  document,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const daysUntil = getDaysUntil(document.expiry_date);
  const expired = isExpired(document.expiry_date);
  const expiringSoon = isExpiringSoon(document.expiry_date);

  // Get dynamic metadata for document type
  const { nameAr } = useDocumentTypeMeta(document.document_type);

  const getStatusConfig = () => {
    if (expired) {
      return {
        badge: (
          <Badge variant="destructive" className="text-xs">
            منتهي
          </Badge>
        ),
        bgClass: 'bg-red-50/50 border-red-100 hover:bg-red-50',
        daysText: `منذ ${Math.abs(daysUntil)} يوم`,
        daysColor: 'text-red-600',
      };
    }
    if (expiringSoon) {
      return {
        badge: (
          <Badge
            variant="secondary"
            className="text-xs bg-amber-100 text-amber-800 border-amber-200"
          >
            ينتهي قريباً
          </Badge>
        ),
        bgClass: 'bg-amber-50/50 border-amber-100 hover:bg-amber-50',
        daysText: `بعد ${daysUntil} يوم`,
        daysColor: 'text-amber-600',
      };
    }
    return {
      badge: (
        <Badge
          variant="outline"
          className="text-xs border-emerald-200 text-emerald-700 bg-emerald-50"
        >
          ساري
        </Badge>
      ),
      bgClass: 'bg-white border-[#e9e1d5] hover:bg-[#faf8f4]',
      daysText: `بعد ${daysUntil} يوم`,
      daysColor: 'text-emerald-600',
    };
  };

  const statusConfig = getStatusConfig();

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className={`group flex items-center gap-3 rounded-xl border p-3 transition-all duration-200 ${statusConfig.bgClass}`}
    >
      <Checkbox
        checked={isSelected}
        onCheckedChange={(checked) => onSelect(checked === true)}
        className="border-[#d4c4a8] data-[state=checked]:bg-[#e9b353] data-[state=checked]:border-[#e9b353]"
      />

      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white border border-[#e9e1d5] text-[#8b6914]">
        <FileText className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-medium text-[#2f261b] text-sm truncate">
            {document.document_name}
          </h4>
          <span className="text-xs text-[#9a8b6e]">
            {nameAr}
          </span>
        </div>

        <div className="flex items-center gap-3 mt-1 flex-wrap">
          {statusConfig.badge}
          <span className={`text-xs ${statusConfig.daysColor}`}>
            {statusConfig.daysText}
          </span>
          {document.document_number && (
            <span className="text-xs text-[#9a8b6e]">
              رقم: {document.document_number}
            </span>
          )}
        </div>

        {document.notes && (
          <p className="text-xs text-[#7a684e] mt-1 line-clamp-1">
            {document.notes}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="h-8 w-8 rounded-lg text-[#5a4830] hover:bg-white/80"
          aria-label="تعديل"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="h-8 w-8 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700"
          aria-label="حذف"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="hidden sm:block text-xs text-[#9a8b6e] text-left min-w-[100px]">
        <div className="text-[#2f261b] font-medium">
          {formatDate(document.expiry_date)}
        </div>
        <div className="text-[10px]">تاريخ الانتهاء</div>
      </div>
    </motion.div>
  );
};
