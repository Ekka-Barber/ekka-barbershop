import { ChevronDown, ChevronUp, FileText, Plus, User } from 'lucide-react';
import React, { useMemo, useState } from 'react';

import { motion, useReducedMotion } from '@shared/lib/motion';
import type { DocumentFormData, HRDocument, HREmployee } from '@shared/types/hr.types';
import { Badge } from '@shared/ui/components/badge';
import { Button } from '@shared/ui/components/button';
import {
  Card,
  CardContent,
  CardHeader,
} from '@shared/ui/components/card';
import { Checkbox } from '@shared/ui/components/checkbox';

import { DocumentItem } from './DocumentItem';
import { InlineDocumentForm } from './InlineDocumentForm';

interface EmployeeDocumentsGroupProps {
  employee: HREmployee;
  documents: HRDocument[];
  selectedDocuments: string[];
  editingDocumentId: string | null;
  isSubmitting: boolean;
  onDocumentSelect: (documentId: string, selected: boolean) => void;
  onDocumentEdit: (documentId: string | null) => void;
  onDocumentEditSubmit: (data: DocumentFormData) => Promise<void>;
  onDocumentDelete: (documentId: string) => void;
  onAddDocument: (employeeId: string) => void;
  expandedByDefault?: boolean;
}

const getEmployeeStatusColor = (documents: HRDocument[]) => {
  const hasExpired = documents.some((doc) => isExpired(doc.expiry_date));
  const hasExpiringSoon = documents.some((doc) => isExpiringSoon(doc.expiry_date));

  if (hasExpired) {
    return 'border-l-4 border-l-red-500';
  }
  if (hasExpiringSoon) {
    return 'border-l-4 border-l-amber-500';
  }
  return 'border-l-4 border-l-emerald-500';
};

const isExpiringSoon = (expiryDate: string) => {
  const expiry = new Date(expiryDate);
  const today = new Date();
  const daysUntilExpiry = Math.ceil(
    (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
};

const isExpired = (expiryDate: string) => new Date(expiryDate) < new Date();

const getPriorityScore = (documents: HRDocument[]): number => {
  return documents.reduce((score, doc) => {
    if (isExpired(doc.expiry_date)) return score + 100;
    if (isExpiringSoon(doc.expiry_date)) return score + 50;
    return score + 1;
  }, 0);
};

export const EmployeeDocumentsGroup: React.FC<EmployeeDocumentsGroupProps> = ({
  employee,
  documents,
  selectedDocuments,
  editingDocumentId,
  isSubmitting,
  onDocumentSelect,
  onDocumentEdit,
  onDocumentEditSubmit,
  onDocumentDelete,
  onAddDocument,
  expandedByDefault = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(expandedByDefault);
  const shouldReduceMotion = useReducedMotion();

  const priorityScore = useMemo(() => getPriorityScore(documents), [documents]);
  const hasUrgentDocs = priorityScore >= 50;

  const allDocsSelected =
    documents.length > 0 &&
    documents.every((doc) => selectedDocuments.includes(doc.id));

  const handleSelectAll = (newSelected: boolean) => {
    documents.forEach((doc) => {
      onDocumentSelect(doc.id, newSelected);
    });
  };

  const documentCounts = useMemo(() => {
    const expired = documents.filter((d) => isExpired(d.expiry_date)).length;
    const expiringSoon = documents.filter((d) => isExpiringSoon(d.expiry_date)).length;
    const valid = documents.length - expired - expiringSoon;
    return { expired, expiringSoon, valid };
  }, [documents]);

  // Find the editing document
  const editingDocument = useMemo(() => {
    return editingDocumentId ? documents.find((d) => d.id === editingDocumentId) : null;
  }, [editingDocumentId, documents]);

  // Auto-expand when editing
  const effectiveIsExpanded = isExpanded || !!editingDocument;

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <Card
        className={`overflow-hidden bg-white/95 shadow-[0_4px_20px_-8px_rgba(82,60,28,0.3)] transition-all duration-300 hover:shadow-[0_8px_30px_-12px_rgba(82,60,28,0.4)] ${getEmployeeStatusColor(documents)}`}
        dir="rtl"
      >
        <CardHeader className="pb-3 pt-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Checkbox
                checked={allDocsSelected}
                onCheckedChange={(checked) => handleSelectAll(checked === true)}
                className="border-[#d4c4a8] data-[state=checked]:bg-[#e9b353] data-[state=checked]:border-[#e9b353]"
              />

              {employee.photo_url ? (
                <img
                  src={employee.photo_url}
                  alt={`صورة الموظف ${employee.name_ar || employee.name}`}
                  className="h-11 w-11 flex-shrink-0 rounded-xl border border-[#e5cc9e] object-cover shadow-[0_4px_12px_rgba(233,179,83,0.4)]"
                />
              ) : (
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#fff8ea] to-[#f5e7ce] border border-[#e9d5b0]">
                  <User className="h-5 w-5 text-[#8b6914]" />
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-[#2f261b] truncate">
                    {employee.name_ar || employee.name}
                  </h3>
                  {hasUrgentDocs && (
                    <Badge
                      variant={documentCounts.expired > 0 ? 'destructive' : 'secondary'}
                      className="text-xs px-2 py-0.5"
                    >
                      {documentCounts.expired > 0
                        ? `${documentCounts.expired} منتهي`
                        : `${documentCounts.expiringSoon} ينتهي قريباً`}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-[#7a684e] truncate">
                  {employee.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2">
                {documentCounts.expired > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {documentCounts.expired} منتهي
                  </Badge>
                )}
                {documentCounts.expiringSoon > 0 && (
                  <Badge
                    variant="secondary"
                    className="text-xs bg-amber-100 text-amber-800 border-amber-200"
                  >
                    {documentCounts.expiringSoon} ينتهي قريباً
                  </Badge>
                )}
                {documentCounts.valid > 0 && (
                  <Badge
                    variant="outline"
                    className="text-xs border-emerald-200 text-emerald-700 bg-emerald-50"
                  >
                    {documentCounts.valid} ساري
                  </Badge>
                )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAddDocument(employee.id)}
                className="h-9 w-9 rounded-xl text-[#5a4830] hover:bg-[#f5e7ce]"
                aria-label="إضافة مستند"
              >
                <Plus className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-9 w-9 rounded-xl text-[#5a4830] hover:bg-[#f5e7ce]"
                aria-label={effectiveIsExpanded ? 'طي' : 'توسيع'}
              >
                {effectiveIsExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        <motion.div
          initial={false}
          animate={{
            height: effectiveIsExpanded ? 'auto' : 0,
            opacity: effectiveIsExpanded ? 1 : 0,
          }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.2,
            ease: 'easeInOut',
          }}
          style={{ overflow: 'hidden' }}
        >
          <CardContent className="pt-0">
            {documents.length === 0 ? (
              <div className="py-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f5f0e8] mb-3">
                  <FileText className="h-5 w-5 text-[#9a8b6e]" />
                </div>
                <p className="text-sm text-[#7a684e]">لا توجد مستندات لهذا الموظف</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAddDocument(employee.id)}
                  className="mt-3 h-9 border-[#e9d5b0] text-[#8b6914] hover:bg-[#fff8ea]"
                >
                  <Plus className="h-3.5 w-3.5 ms-1.5" />
                  إضافة مستند
                </Button>
              </div>
            ) : (
              <div className="space-y-2 pt-2">
                {documents.map((document) => (
                  <React.Fragment key={document.id}>
                    {editingDocumentId === document.id && editingDocument ? (
                      <InlineDocumentForm
                        key={editingDocument.id}
                        document={editingDocument}
                        onSubmit={onDocumentEditSubmit}
                        onCancel={() => onDocumentEdit(null)}
                        isSubmitting={isSubmitting}
                      />
                    ) : (
                      <DocumentItem
                        document={document}
                        isSelected={selectedDocuments.includes(document.id)}
                        onSelect={(selected) => onDocumentSelect(document.id, selected)}
                        onEdit={() => onDocumentEdit(document.id)}
                        onDelete={() => onDocumentDelete(document.id)}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}
          </CardContent>
        </motion.div>
      </Card>
    </motion.div>
  );
};
