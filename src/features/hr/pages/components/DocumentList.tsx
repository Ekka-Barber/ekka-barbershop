import { FileText, Trash2, Users } from 'lucide-react';
import React, { useMemo, useState, useCallback } from 'react';

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

import { DocumentFilters, type DocumentStatusFilter, type DocumentTypeFilter } from './DocumentFilters';
import { DocumentStats } from './DocumentStats';
import { EmployeeDocumentsGroup } from './EmployeeDocumentsGroup';

interface DocumentListProps {
  documents: HRDocument[];
  employees: HREmployee[];
  onUpdate: (document: HRDocument) => Promise<void>;
  onDelete: (id: string) => void;
  onAddDocumentForEmployee?: (employeeId: string) => void;
  isLoading?: boolean;
}

const isExpiringSoon = (expiryDate: string) => {
  const expiry = new Date(expiryDate);
  const today = new Date();
  const daysUntilExpiry = Math.ceil(
    (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
};

const isExpired = (expiryDate: string) => new Date(expiryDate) < new Date();

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  employees,
  onUpdate,
  onDelete,
  onAddDocumentForEmployee,
  isLoading = false,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<DocumentStatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<DocumentTypeFilter>('all');
  const [employeeFilter, setEmployeeFilter] = useState<string>('all');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const [editingDocumentId, setEditingDocumentId] = useState<string | null>(null);

  // Filter to only active employees (not archived)
  const activeEmployees = useMemo(() => {
    return employees.filter((e) => !e.is_archived);
  }, [employees]);

  // Filter documents - only from active employees
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      // Only show documents from active employees
      const employee = activeEmployees.find((e) => e.id === doc.employee_id);
      if (!employee) return false;

      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch =
          doc.document_name.toLowerCase().includes(searchLower) ||
          doc.document_number?.toLowerCase().includes(searchLower) ||
          employee.name.toLowerCase().includes(searchLower) ||
          employee.name_ar?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter !== 'all') {
        const docExpired = isExpired(doc.expiry_date);
        const docExpiringSoon = isExpiringSoon(doc.expiry_date);

        if (statusFilter === 'expired' && !docExpired) return false;
        if (statusFilter === 'expiring_soon' && !docExpiringSoon) return false;
        if (statusFilter === 'valid' && (docExpired || docExpiringSoon)) return false;
      }

      // Type filter
      if (typeFilter !== 'all' && doc.document_type !== typeFilter) {
        return false;
      }

      // Employee filter
      if (employeeFilter !== 'all' && doc.employee_id !== employeeFilter) {
        return false;
      }

      return true;
    });
  }, [documents, searchQuery, statusFilter, typeFilter, employeeFilter, activeEmployees]);

  // Group documents by active employee with priority sorting
  const employeeDocumentGroups = useMemo(() => {
    const groups = new Map<string, HRDocument[]>();

    filteredDocuments.forEach((doc) => {
      const existing = groups.get(doc.employee_id) || [];
      existing.push(doc);
      groups.set(doc.employee_id, existing);
    });

    // Convert to array and sort by priority (only active employees)
    const sortedGroups = Array.from(groups.entries())
      .map(([employeeId, docs]) => {
        const employee = activeEmployees.find((e) => e.id === employeeId);
        if (!employee) return null;

        // Calculate priority score
        const priorityScore = docs.reduce((score, doc) => {
          if (isExpired(doc.expiry_date)) return score + 100;
          if (isExpiringSoon(doc.expiry_date)) return score + 50;
          return score + 1;
        }, 0);

        return {
          employee,
          documents: docs,
          priorityScore,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b!.priorityScore - a!.priorityScore);

    return sortedGroups;
  }, [filteredDocuments, activeEmployees]);

  // Statistics
  const stats = useMemo(() => {
    const total = filteredDocuments.length;
    const expired = filteredDocuments.filter((d) => isExpired(d.expiry_date)).length;
    const expiringSoon = filteredDocuments.filter((d) => isExpiringSoon(d.expiry_date)).length;
    const valid = total - expired - expiringSoon;

    return { total, valid, expiringSoon, expired };
  }, [filteredDocuments]);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery) count++;
    if (statusFilter !== 'all') count++;
    if (typeFilter !== 'all') count++;
    if (employeeFilter !== 'all') count++;
    return count;
  }, [searchQuery, statusFilter, typeFilter, employeeFilter]);

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

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setStatusFilter('all');
    setTypeFilter('all');
    setEmployeeFilter('all');
  }, []);

  // Add document handler
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
      <Card className="overflow-hidden border-[#e2ceab] bg-white/90 shadow-[0_20px_42px_-30px_rgba(82,60,28,0.45)]">
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
      <Card className="overflow-hidden border-[#e2ceab] bg-white/90 shadow-[0_20px_42px_-30px_rgba(82,60,28,0.45)]">
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
