import { CheckCircle, Clock, AlertTriangle, RefreshCw } from 'lucide-react';

import type {
  EmployeeDocumentWithStatus,
} from '../types';

import type {
  StatusOption,
  StatusStats,
} from './types';

/**
 * Status options for document status updates
 */
export const STATUS_OPTIONS: StatusOption[] = [
  {
    value: 'valid',
    label: 'Valid',
    icon: CheckCircle,
    color: 'text-success',
  },
  {
    value: 'expiring_soon',
    label: 'Expiring Soon',
    icon: Clock,
    color: 'text-warning',
  },
  {
    value: 'expired',
    label: 'Expired',
    icon: AlertTriangle,
    color: 'text-destructive',
  },
  {
    value: 'needs_renewal',
    label: 'Needs Renewal',
    icon: RefreshCw,
    color: 'text-info',
  },
];

/**
 * Calculate status statistics for selected documents
 */
export const getStatusStats = (
  selectedDocuments: string[],
  documents: EmployeeDocumentWithStatus[]
): StatusStats => {
  const selectedDocumentObjects = documents.filter((doc) =>
    doc.id !== null && selectedDocuments.includes(doc.id)
  );

  return selectedDocumentObjects.reduce((acc, doc) => {
    const status = doc.status ?? 'unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as StatusStats);
};

/**
 * Get status option by value
 */
export const getStatusOption = (value: string): StatusOption | undefined => {
  return STATUS_OPTIONS.find((option) => option.value === value);
};

/**
 * Format selected documents count text
 */
export const getSelectionText = (count: number): string => {
  return `${count} document${count > 1 ? 's' : ''} selected`;
};

/**
 * Maximum number of documents to show in preview
 */
export const MAX_DOCUMENTS_PREVIEW = 5;

/**
 * Check if selection should show document preview (≤ 5 documents)
 */
export const shouldShowDocumentPreview = (count: number): boolean => {
  return count <= MAX_DOCUMENTS_PREVIEW;
};

/**
 * Notification threshold options in days
 */
export const NOTIFICATION_THRESHOLD_OPTIONS = [
  { value: 7, label: '7 days' },
  { value: 15, label: '15 days' },
  { value: 30, label: '30 days' },
  { value: 60, label: '60 days' },
  { value: 90, label: '90 days' },
  { value: 120, label: '120 days' },
] as const;
