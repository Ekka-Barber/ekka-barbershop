import { useState, useCallback } from 'react';
import { differenceInDays } from 'date-fns';
import { EmployeeDocument, DocumentCalculation } from '../types/document-types';
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
      // Use the document service to add a document
      const newDocument = await documentService.createDocument({
        employee_id: document.employee_id || '',
        document_type: document.document_type || 'custom',
        document_name: document.document_name || 'Untitled Document',
        document_number: document.document_number || null,
        issue_date: document.issue_date || new Date().toISOString(),
        expiry_date: document.expiry_date || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        duration_months: document.duration_months || 12,
        notification_threshold_days: document.notification_threshold_days || 30,
        document_url: document.document_url || null,
        notes: document.notes || null,
      });
      
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
      // Use the document service to update a document
      const updatedDocument = await documentService.updateDocument(id, document);
      
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
      const expiryDate = new Date(document.expiry_date);
      
      // Check if status is already in the document (from view)
      const isExpired = document.status === 'expired' || today > expiryDate;
      
      // Use days_remaining from the view if available, otherwise calculate
      const daysRemaining = document.days_remaining !== undefined 
        ? document.days_remaining 
        : differenceInDays(expiryDate, today);
      
      const isExpiringSoon = !isExpired && 
        (document.status === 'expiring_soon' || 
         daysRemaining <= document.notification_threshold_days);
      
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
      };
    } catch (error) {
      console.error('Error calculating status details:', error);
      return {
        daysRemaining: 0,
        isExpired: false,
        isExpiringSoon: false,
        statusText: 'Unknown',
        expiryDate: new Date(),
      };
    }
  }, []);

  // Get all documents that are expiring soon
  const getExpiringDocuments = useCallback(async (thresholdDays = 30) => {
    try {
      return await documentService.getExpiringDocuments(thresholdDays);
    } catch (error) {
      console.error('Error fetching expiring documents:', error);
      return [];
    }
  }, []);

  // Get all expired documents
  const getExpiredDocuments = useCallback(async () => {
    try {
      return await documentService.getExpiredDocuments();
    } catch (error) {
      console.error('Error fetching expired documents:', error);
      return [];
    }
  }, []);

  return {
    documents,
    isLoading,
    error,
    fetchDocuments,
    addDocument,
    updateDocument,
    deleteDocument,
    calculateStatus,
    getExpiringDocuments,
    getExpiredDocuments
  };
}; 