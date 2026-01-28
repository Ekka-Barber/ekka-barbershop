import { Loader2, ChevronDown } from 'lucide-react';
import React, { useMemo, useCallback, useState, useEffect } from 'react';

import { TIME } from '@shared/constants/time';
import { UI } from '@shared/constants/ui';
import { useIsMobile } from '@shared/hooks/use-mobile';
import { Badge } from '@shared/ui/components/badge';
import { Button } from '@shared/ui/components/button';


import type { EmployeeDocumentWithStatus } from '../types';

import { EmployeeDocumentCard } from './EmployeeDocumentCard';

import type { Employee } from '@/features/owner/employees/types';

interface EmployeeWithBranch extends Employee {
  branch_name?: string;
}

interface EmployeeDocumentsListProps {
  employees: EmployeeWithBranch[];
  documents: EmployeeDocumentWithStatus[];
  selectedDocuments: (string | null)[];
  onDocumentSelect: (documentId: string | null, selected: boolean) => void;
  onDocumentEdit: (document: EmployeeDocumentWithStatus) => void;
  onDocumentDelete: (documentId: string | null) => Promise<void> | void;
  onAddDocument: (employeeId: string) => void;
  isLoading?: boolean;
  className?: string;
}

// Mobile-optimized lazy loading configuration
const MOBILE_LAZY_LOADING_CONFIG = {
  INITIAL_LOAD_SIZE: 5, // Load fewer items initially on mobile
  PAGE_SIZE: 10, // Smaller page size for mobile
  SCROLL_THRESHOLD: 0.9, // Load more when 90% scrolled
};

const DESKTOP_LAZY_LOADING_CONFIG = {
  INITIAL_LOAD_SIZE: 10,
  PAGE_SIZE: UI.SIZE_LG,
  SCROLL_THRESHOLD: 0.8,
};

// Mobile-aware intersection observer
const useIntersectionObserver = (
  callback: () => void,
  options: IntersectionObserverInit = {}
) => {
  const [node, setNode] = useState<Element | null>(null);

  useEffect(() => {
    if (!node) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        callback();
      }
    }, options);

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [node, callback, options]);

  return setNode;
};

export const EmployeeDocumentsList: React.FC<EmployeeDocumentsListProps> = ({
  employees,
  documents,
  selectedDocuments,
  onDocumentSelect,
  onDocumentEdit,
  onDocumentDelete,
  onAddDocument,
  isLoading = false,
  className,
}) => {
  const isMobile = useIsMobile();
  const config = isMobile
    ? MOBILE_LAZY_LOADING_CONFIG
    : DESKTOP_LAZY_LOADING_CONFIG;

  const [displayedCount, setDisplayedCount] = useState(
    config.INITIAL_LOAD_SIZE
  );
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Group documents by employee with memoization for performance
  const employeeDocumentGroups = useMemo(() => {
    const documentsByEmployee = documents.reduce(
      (acc, doc) => {
        const employeeId = doc.employee_id;
        if (employeeId !== null) {
          if (!acc[employeeId]) {
            acc[employeeId] = [];
          }
          acc[employeeId].push(doc);
        }
        return acc;
      },
      {} as Record<string, EmployeeDocumentWithStatus[]>
    );
    
    // Create employee groups with their documents and sort by priority
    const groups = employees.map((employee) => {
      const employeeDocs = documentsByEmployee[employee.id] || [];

      // Calculate priority score (higher score = more urgent)
      const priorityScore = employeeDocs.reduce((score, doc) => {
        if (doc.status === 'expired') return score + 100;
        if (
          doc.status === 'expiring_soon' &&
          doc.days_remaining !== null &&
          doc.days_remaining <= TIME.DAYS_PER_WEEK
        )
          return score + 50;
        if (doc.status === 'expiring_soon') return score + UI.SIZE_LG;
        return score + 1;
      }, 0);

      return {
        employee,
        documents: employeeDocs,
        priorityScore,
        totalDocuments: employeeDocs.length,
      };
    });

    // Sort by priority (urgent employees first) then by document count
    return groups.sort((a, b) => {
      if (a.priorityScore !== b.priorityScore) {
        return b.priorityScore - a.priorityScore;
      }
      return b.totalDocuments - a.totalDocuments;
    });
  }, [employees, documents]);

  // Load more employees
  const loadMore = useCallback(() => {
    if (isLoadingMore || displayedCount >= employeeDocumentGroups.length)
      return;

    setIsLoadingMore(true);

    // Simulate async operation for smooth UX
    setTimeout(() => {
      setDisplayedCount((prev) =>
        Math.min(prev + config.PAGE_SIZE, employeeDocumentGroups.length)
      );
      setIsLoadingMore(false);
    }, 100);
  }, [
    isLoadingMore,
    displayedCount,
    employeeDocumentGroups.length,
    config.PAGE_SIZE,
  ]);

  // Intersection observer for infinite scroll
  const loadMoreRef = useIntersectionObserver(loadMore, {
    threshold: config.SCROLL_THRESHOLD,
  });

  // Reset displayed count when employees change or mobile state changes
  useEffect(() => {
    setDisplayedCount(config.INITIAL_LOAD_SIZE);
  }, [employees.length, config.INITIAL_LOAD_SIZE]);

  const displayedGroups = employeeDocumentGroups.slice(0, displayedCount);
  const hasMore = displayedCount < employeeDocumentGroups.length;
  const remainingCount = employeeDocumentGroups.length - displayedCount;

  // Performance statistics
  const stats = useMemo(() => {
    const totalDocuments = employeeDocumentGroups.reduce(
      (sum, group) => sum + group.totalDocuments,
      0
    );
    const urgentEmployees = employeeDocumentGroups.filter(
      (group) => group.priorityScore >= 50
    ).length;

    return {
      totalEmployees: employeeDocumentGroups.length,
      totalDocuments,
      displayedEmployees: displayedCount,
      urgentEmployees,
    };
  }, [employeeDocumentGroups, displayedCount]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-sm">Loading employee documents...</span>
        </div>
      </div>
    );
  }

  if (employeeDocumentGroups.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-sm">No employees found.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 sm:space-y-4 ${className}`}>
      {/* Mobile-Optimized Performance Stats */}
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
          <Badge variant="outline" className="text-xs">
            {stats.displayedEmployees} / {stats.totalEmployees} Employees
          </Badge>
          <Badge variant="outline" className="text-xs">
            {stats.totalDocuments} Documents
          </Badge>
          {stats.urgentEmployees > 0 && (
            <Badge variant="destructive" className="text-xs">
              {stats.urgentEmployees} Urgent
            </Badge>
          )}
        </div>
        {hasMore && (
          <div className="text-xs text-gray-500 mt-1">
            {remainingCount} more employees available
          </div>
        )}
      </div>

      {/* Mobile-Optimized Employee Cards */}
      <div className="space-y-3">
        {displayedGroups.map(({ employee, documents: employeeDocs }) => (
          <EmployeeDocumentCard
            key={employee.id}
            employee={employee}
            documents={employeeDocs}
            selectedDocuments={selectedDocuments}
            onDocumentSelect={onDocumentSelect}
            onDocumentEdit={onDocumentEdit}
            onDocumentDelete={onDocumentDelete}
            onAddDocument={onAddDocument}
          />
        ))}
      </div>

      {/* Mobile-Optimized Lazy Loading Controls */}
      {hasMore && (
        <div className="flex flex-col items-center gap-4 py-6">
          {/* Intersection observer trigger */}
          <div ref={loadMoreRef} className="h-4 w-full" />

          {isLoadingMore ? (
            <div className="flex items-center gap-2 text-gray-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading more employees...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 w-full">
              <Button
                variant="outline"
                onClick={loadMore}
                className="flex items-center gap-2 w-full sm:w-auto h-12 sm:h-auto text-base"
                disabled={isLoadingMore}
              >
                <ChevronDown className="h-4 w-4" />
                Load {Math.min(config.PAGE_SIZE, remainingCount)} More Employees
              </Button>
              <div className="text-xs text-gray-500 text-center">
                Showing {displayedCount} of {employeeDocumentGroups.length}{' '}
                employees
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mobile-Aware Performance Notice */}
      {employeeDocumentGroups.length > (isMobile ? UI.SIZE_LG : 50) && (
        <div className="text-center py-4 text-sm text-gray-500 border-t">
          <p>
            📱 {isMobile ? 'Mobile-optimized' : 'Performance optimized'} for
            large datasets • Showing employees by priority • Lazy loading
            enabled
          </p>
        </div>
      )}
    </div>
  );
};
