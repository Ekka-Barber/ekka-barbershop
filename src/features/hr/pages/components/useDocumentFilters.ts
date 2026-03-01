import { useState, useMemo, useCallback } from 'react';

import type { HREmployee, HRDocument } from '@shared/types/hr.types';

export type DocumentStatusFilter = 'all' | 'valid' | 'expiring_soon' | 'expired';
export type DocumentTypeFilter = 'all' | string;

interface UseDocumentFiltersProps {
  documents: HRDocument[];
  employees: HREmployee[];
}

interface UseDocumentFiltersReturn {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: DocumentStatusFilter;
  setStatusFilter: (status: DocumentStatusFilter) => void;
  typeFilter: DocumentTypeFilter;
  setTypeFilter: (type: DocumentTypeFilter) => void;
  employeeFilter: string;
  setEmployeeFilter: (employeeId: string) => void;
  activeFiltersCount: number;
  filteredDocuments: HRDocument[];
  activeEmployees: HREmployee[];
  handleClearFilters: () => void;
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

export const useDocumentFilters = ({
  documents,
  employees,
}: UseDocumentFiltersProps): UseDocumentFiltersReturn => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<DocumentStatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<DocumentTypeFilter>('all');
  const [employeeFilter, setEmployeeFilter] = useState<string>('all');

  const activeEmployees = useMemo(() => {
    return employees.filter((e) => !e.is_archived);
  }, [employees]);

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const employee = activeEmployees.find((e) => e.id === doc.employee_id);
      if (!employee) return false;

      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch =
          doc.document_name.toLowerCase().includes(searchLower) ||
          doc.document_number?.toLowerCase().includes(searchLower) ||
          employee.name.toLowerCase().includes(searchLower) ||
          employee.name_ar?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      if (statusFilter !== 'all') {
        const docExpired = isExpired(doc.expiry_date);
        const docExpiringSoon = isExpiringSoon(doc.expiry_date);

        if (statusFilter === 'expired' && !docExpired) return false;
        if (statusFilter === 'expiring_soon' && !docExpiringSoon) return false;
        if (statusFilter === 'valid' && (docExpired || docExpiringSoon)) return false;
      }

      if (typeFilter !== 'all' && doc.document_type !== typeFilter) {
        return false;
      }

      if (employeeFilter !== 'all' && doc.employee_id !== employeeFilter) {
        return false;
      }

      return true;
    });
  }, [documents, searchQuery, statusFilter, typeFilter, employeeFilter, activeEmployees]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery) count++;
    if (statusFilter !== 'all') count++;
    if (typeFilter !== 'all') count++;
    if (employeeFilter !== 'all') count++;
    return count;
  }, [searchQuery, statusFilter, typeFilter, employeeFilter]);

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setStatusFilter('all');
    setTypeFilter('all');
    setEmployeeFilter('all');
  }, []);

  return {
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
  };
};

export const useDocumentStats = (documents: HRDocument[]) => {
  return useMemo(() => {
    const total = documents.length;
    const expired = documents.filter((d) => isExpired(d.expiry_date)).length;
    const expiringSoon = documents.filter((d) => isExpiringSoon(d.expiry_date)).length;
    const valid = total - expired - expiringSoon;

    return { total, valid, expiringSoon, expired };
  }, [documents]);
};

export const useDocumentGrouping = (documents: HRDocument[], employees: HREmployee[]) => {
  return useMemo(() => {
    const groups = new Map<string, HRDocument[]>();

    documents.forEach((doc) => {
      const existing = groups.get(doc.employee_id) || [];
      existing.push(doc);
      groups.set(doc.employee_id, existing);
    });

    const sortedGroups = Array.from(groups.entries())
      .map(([employeeId, docs]) => {
        const employee = employees.find((e) => e.id === employeeId);
        if (!employee) return null;

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
  }, [documents, employees]);
};
