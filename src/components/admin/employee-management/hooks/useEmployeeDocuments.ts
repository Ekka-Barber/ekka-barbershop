import { useState, useCallback } from 'react';
import { differenceInDays } from 'date-fns';
import { 
  EmployeeDocument, 
  DocumentCalculation,
  DocumentTypeEnum,
  DocumentStatus
} from '../types';
import { documentService } from '../services/documentService';

// Use the real API implementation with Supabase
export const useEmployeeDocuments = () => {
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch documents for an employee
  const fetchDocuments = useCallback(async (employeeId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use the document service to fetch documents
      const employeeDocuments = await documentService.getDocumentsForEmployee(employeeId);
      setDocuments(employeeDocuments);
      
      setIsLoading(false);
      return employeeDocuments;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      setIsLoading(false);
      throw error;
    }
  }, []);

  // Add a new document
  const addDocument = useCallback(async (document: Partial<EmployeeDocument>) => {
    try {
      // Prepare the document for the API
      const docInput = {
        employee_id: document.employeeId || '',
        document_type: document.documentType || 'custom' as DocumentTypeEnum,
        document_name: document.documentName || 'Untitled Document',
        document_number: document.documentNumber || null,
        issue_date: document.issueDate || new Date().toISOString(),
        expiry_date: document.expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        duration_months: document.durationMonths || 12,
        notification_threshold_days: document.notificationThresholdDays || 30,
        document_url: document.documentUrl || null,
        notes: document.notes || null,
      };
      
      // Use the document service to add a document
      const newDocument = await documentService.createDocument(docInput);
      
      // Update the local state
      setDocuments(prevDocuments => [...prevDocuments, newDocument]);
      return newDocument;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to add document');
      console.error(error);
      throw error;
    }
  }, []);

  // Update an existing document
  const updateDocument = useCallback(async (id: string, document: Partial<EmployeeDocument>) => {
    try {
      // Prepare the document for the API
      const docInput = {
        document_type: document.documentType as DocumentTypeEnum,
        document_name: document.documentName,
        document_number: document.documentNumber,
        issue_date: document.issueDate,
        expiry_date: document.expiryDate,
        duration_months: document.durationMonths,
        notification_threshold_days: document.notificationThresholdDays,
        document_url: document.documentUrl,
        notes: document.notes,
      };
      
      // Use the document service to update a document
      const updatedDocument = await documentService.updateDocument(id, docInput);
      
      // Update the local state
      setDocuments(prevDocuments => {
        return prevDocuments.map(doc => {
          if (doc.id === id) {
            return updatedDocument;
          }
          return doc;
        });
      });
      
      return updatedDocument;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update document');
      console.error(error);
      throw error;
    }
  }, []);

  // Delete a document
  const deleteDocument = useCallback(async (id: string) => {
    try {
      // Use the document service to delete a document
      await documentService.deleteDocument(id);
      
      // Update the local state
      setDocuments(prevDocuments => 
        prevDocuments.filter(doc => doc.id !== id)
      );
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete document');
      console.error(error);
      throw error;
    }
  }, []);

  // Calculate detailed status information for display
  const calculateStatus = useCallback((document: EmployeeDocument): DocumentCalculation => {
    try {
      const today = new Date();
      const expiryDate = new Date(document.expiryDate || '');
      
      // Check if status is already in the document
      let isExpired = document.status === 'expired' || today > expiryDate;
      
      // Calculate days remaining
      const daysRemaining = differenceInDays(expiryDate, today);
      
      // Determine if expiring soon
      const isExpiringSoon = !isExpired && 
        (document.status === 'expiring_soon' || 
         daysRemaining <= document.notificationThresholdDays);
      
      // Determine status
      let status: DocumentStatus = 'valid';
      if (isExpired) {
        status = 'expired';
      } else if (isExpiringSoon) {
        status = 'expiring_soon';
      }
      
      // Set status text
      let statusText = '';
      if (isExpired) {
        statusText = 'Expired';
      } else if (isExpiringSoon) {
        statusText = `Expires in ${daysRemaining} days`;
      } else {
        statusText = 'Valid';
      }
      
      return {
        daysRemaining,
        isExpired,
        isExpiringSoon,
        statusText,
        expiryDate,
        status
      };
    } catch (error) {
      console.error('Error calculating status details:', error);
      return {
        daysRemaining: 0,
        isExpired: false,
        isExpiringSoon: false,
        statusText: 'Unknown',
        expiryDate: new Date(),
        status: 'valid'
      };
    }
  }, []);

  // Memoize the computed document status information
  const documentStatusInfo = useMemo(() => {
    return documents.map(doc => ({
      id: doc.id,
      status: calculateStatus(doc)
    }));
  }, [documents, calculateStatus]);

  return {
    documents,
    isLoading,
    error,
    fetchDocuments,
    addDocument,
    updateDocument,
    deleteDocument,
    calculateStatus,
    documentStatusInfo
  };
};
