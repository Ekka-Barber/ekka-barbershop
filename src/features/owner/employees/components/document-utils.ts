import type { EmployeeDocumentWithStatus } from '@/features/owner/employees/types';

/**
 * Formats a date string to a readable format
 */
export const formatDocumentDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Calculates employee status color based on document statuses
 */
export const getEmployeeStatusColor = (
  documents: EmployeeDocumentWithStatus[]
): string => {
  const expiredDocs = documents.filter((doc) => doc.status === 'expired');
  const expiringSoonDocs = documents.filter(
    (doc) => doc.status === 'expiring_soon'
  );
  const needsRenewalDocs = documents.filter(
    (doc) => doc.status === 'needs_renewal'
  );

  if (expiredDocs.length > 0) return 'border-red-200 bg-red-50';
  if (expiringSoonDocs.length > 0) return 'border-yellow-200 bg-yellow-50';
  if (needsRenewalDocs.length > 0) return 'border-orange-200 bg-orange-50';
  return 'border-green-200 bg-green-50';
};

/**
 * Filters documents by status
 */
export const getDocumentsByStatus = (
  documents: EmployeeDocumentWithStatus[]
) => {
  return {
    valid: documents.filter((doc) => doc.status === 'valid'),
    expiringSoon: documents.filter((doc) => doc.status === 'expiring_soon'),
    expired: documents.filter((doc) => doc.status === 'expired'),
    needsRenewal: documents.filter((doc) => doc.status === 'needs_renewal'),
  };
};
