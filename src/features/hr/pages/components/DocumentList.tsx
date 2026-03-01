import { FileText, Trash2, Users } from 'lucide-react';
import React, { useState, useCallback, memo } from 'react';

import { motion, useReducedMotion } from '@shared/lib/motion';
import type { DocumentFormData, HRDocument, HREmployee } from '@shared/types/hr.types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@shared/ui/components/alert-dialog';
import { Badge } from '@shared/ui/components/badge';
import { Button } from '@shared/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/ui/components/card';
import { Skeleton } from '@shared/ui/components/skeleton';

import { DocumentFilters } from './DocumentFilters';
import { DocumentStats } from './DocumentStats';
import { EmployeeDocumentsGroup } from './EmployeeDocumentsGroup';
import { useDocumentFilters, useDocumentStats, useDocumentGrouping } from './useDocumentFilters';

interface DocumentListProps {
  documents: HRDocument[];
  employees: HREmployee[];
  onUpdate: (document: HRDocument) => Promise<void>;
  onDelete: (id: string) => void;
  onAddDocumentForEmployee?: (employeeId: string) => void;
  isLoading?: boolean;
}

const DocumentListComponent: React.FC<DocumentListProps> = ({
  documents,
  employees,
  onUpdate,
  onDelete,
  onAddDocumentForEmployee,
  isLoading = false,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const [editingDocumentId, setEditingDocumentId] = useState<string | null>(null);

  const {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    employeeFilter,
    setEmployeeFilter,
    activeFiltersCount,
    filteredDocuments,
    activeEmployees,
    handleClearFilters,
  } = useDocumentFilters({ documents, employees });

  const employeeDocumentGroups = useDocumentGrouping(filteredDocuments, activeEmployees);

  const stats = useDocumentStats(filteredDocuments);

  // Selection handlers
  const handleDocumentSelect = useCallback((documentId: string, selected: boolean) => {
    setSelectedDocuments((prev) =>
      selected ? [...prev, documentId] : prev.filter((id) => id !== documentId)
    );
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedDocuments([]);
  }, []);

  // Delete handlers
  const handleDeleteClick = useCallback((id: string) => {
    setDocumentToDelete(id);
    setShowDeleteDialog(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (documentToDelete) {
      onDelete(documentToDelete);
      setDocumentToDelete(null);
      setShowDeleteDialog(false);
      // Remove from selection if it was selected
      setSelectedDocuments((prev) => prev.filter((id) => id !== documentToDelete));
    }
  }, [documentToDelete, onDelete]);

  const handleCancelDelete = useCallback(() => {
    setDocumentToDelete(null);
    setShowDeleteDialog(false);
  }, []);

  const handleAddDocument = useCallback((employeeId: string) => {
    onAddDocumentForEmployee?.(employeeId);
  }, [onAddDocumentForEmployee]);

  // Inline edit handlers
  const handleInlineEdit = useCallback((documentId: string | null) => {
    setEditingDocumentId(documentId);
  }, []);

  const handleInlineEditSubmit = useCallback(async (data: DocumentFormData) => {
    // Find the editing document and persist inline updates
    const editingDoc = documents.find((d) => d.id === editingDocumentId);
    if (editingDoc) {
      const updatedDoc: HRDocument = {
        ...editingDoc,
        ...data,
      };

      await onUpdate(updatedDoc);
      setEditingDocumentId(null);
    }
  }, [editingDocumentId, documents, onUpdate]);

  if (isLoading) {
    return (
      <Card className="overflow-hidden border-[#e2ceab] bg-white/90 shadow-[0_20px_42px_-30px_rgba(82,60,28,0.45)]" dir="rtl">
        <CardHeader className="border-b border-[#f0e2c8] px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg text-[#2f261b]">قائمة المستندات</CardTitle>
              <p className="text-sm text-[#7a684e] mt-1">
                تتبع صلاحية المستندات والتنبيهات المهمة لكل موظف.
              </p>
            </div>
            <Skeleton className="h-9 w-24 rounded-xl" />
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 rounded-xl bg-[#f5f0e8]" />
            ))}
          </div>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-[#ead8b8] bg-gradient-to-r from-[#fffdf9] to-[#fff7ea] p-4"
            >
              <div className="flex gap-3">
                <Skeleton className="h-12 w-12 rounded-xl bg-[#d7e4ff]/60" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-44 bg-[#ead4ac]/55" />
                  <Skeleton className="h-3 w-32 bg-[#ead4ac]/45" />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Filters */}
      <DocumentFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        employeeFilter={employeeFilter}
        onEmployeeFilterChange={setEmployeeFilter}
        employees={activeEmployees}
        onClearFilters={handleClearFilters}
        activeFiltersCount={activeFiltersCount}
      />

      {/* Stats */}
      <DocumentStats
        totalDocuments={stats.total}
        validDocuments={stats.valid}
        expiringSoonDocuments={stats.expiringSoon}
        expiredDocuments={stats.expired}
      />

      {/* Bulk Actions */}
      {selectedDocuments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between bg-[#fff8ea] border border-[#e9d5b0] rounded-xl p-3"
        >
          <div className="flex items-center gap-3">
            <Badge className="bg-[#e9b353] text-white">
              {selectedDocuments.length} محدد
            </Badge>
            <span className="text-sm text-[#7a684e]">
              تم اختيار {selectedDocuments.length} مستند
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearSelection}
            className="text-[#7a684e] hover:text-[#2f261b]"
          >
            إلغاء التحديد
          </Button>
        </motion.div>
      )}

      {/* Document List */}
      <Card className="overflow-hidden border-[#e2ceab] bg-white/90 shadow-[0_20px_42px_-30px_rgba(82,60,28,0.45)]" dir="rtl">
        <CardHeader className="border-b border-[#f0e2c8] px-6 py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="text-lg text-[#2f261b]">قائمة المستندات</CardTitle>
              <p className="text-sm text-[#7a684e] mt-1">
                تتبع صلاحية المستندات والتنبيهات المهمة لكل موظف.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-[#dcc49c] bg-[#fffdfa]">
                <Users className="h-3.5 w-3.5 ms-1.5" />
                {employeeDocumentGroups.length} موظف
              </Badge>
              <Badge variant="outline" className="border-[#dcc49c] bg-[#fffdfa]">
                <FileText className="h-3.5 w-3.5 ms-1.5" />
                {stats.total} مستند
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-5">
          {filteredDocuments.length === 0 ? (
            <div className="py-12">
              <div className="mx-auto flex max-w-xl flex-col items-center rounded-3xl border border-dashed border-[#d9dff4] bg-[#f8fbff] px-6 py-10 text-center">
                <div className="mb-3 rounded-full border border-[#cfddff] bg-[#eef4ff] p-3 text-[#365da1]">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-[#2f261b]">
                  لا توجد مستندات مطابقة
                </h3>
                <p className="mt-2 max-w-sm text-sm leading-6 text-[#6f5b40]">
                  {activeFiltersCount > 0
                    ? 'جرب تعديل معايير البحث أو الفلاتر لرؤية المزيد من النتائج.'
                    : 'أضف أول مستند للموظفين لبدء متابعة تواريخ الإصدار والانتهاء والتنبيهات.'}
                </p>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="outline"
                    onClick={handleClearFilters}
                    className="mt-4 h-10 border-[#e9d5b0] text-[#8b6914] hover:bg-[#fff8ea]"
                  >
                    مسح الفلاتر
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {employeeDocumentGroups.map((group) =>
                group ? (
                  <EmployeeDocumentsGroup
                    key={group.employee.id}
                    employee={group.employee}
                    documents={group.documents}
                    selectedDocuments={selectedDocuments}
                    editingDocumentId={editingDocumentId}
                    isSubmitting={false}
                    onDocumentSelect={handleDocumentSelect}
                    onDocumentEdit={handleInlineEdit}
                    onDocumentEditSubmit={handleInlineEditSubmit}
                    onDocumentDelete={handleDeleteClick}
                    onAddDocument={handleAddDocument}
                    expandedByDefault={group.priorityScore >= 50}
                  />
                ) : null
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="border-[#e2ceab] bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#2f261b]">
              تأكيد الحذف
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#7a684e]">
              هل أنت متأكد من حذف هذا المستند؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel
              onClick={handleCancelDelete}
              className="border-[#dcc49c] text-[#5a4830] hover:bg-[#fff8ea]"
            >
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 ms-1.5" />
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export const DocumentList = memo(DocumentListComponent);
