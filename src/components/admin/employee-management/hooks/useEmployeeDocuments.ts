
import { useState, useCallback } from 'react';
import { differenceInDays, parseISO } from 'date-fns';
import { 
  EmployeeDocument, 
  DocumentType, 
  DocumentCalculation,
  DocumentStatus
} from '../types/index';
import { documentService } from '../services/documentService';

export const useEmployeeDocuments = () => {
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  const calculateStatus = useCallback((document: EmployeeDocument): DocumentCalculation => {
    try {
      const currentDate = new Date();
      const expiryDate = parseISO(document.expiry_date as string);
      const daysRemaining = differenceInDays(expiryDate, currentDate);
      
      const isExpired = daysRemaining < 0;
      const isWarning = !isExpired && daysRemaining <= document.notification_threshold_days;
      
      let statusText = '';
      if (isExpired) {
        statusText = `Expired ${Math.abs(daysRemaining)} days ago`;
      } else if (isWarning) {
        statusText = `Expires in ${daysRemaining} days`;
      } else {
        statusText = `Valid for ${daysRemaining} days`;
      }
      
      return {
        days_remaining: daysRemaining,
        status: isExpired ? DocumentStatus.EXPIRED : 
               isWarning ? DocumentStatus.EXPIRING : 
               DocumentStatus.VALID
      };
    } catch (error) {
      console.error('Error calculating document status:', error);
      return {
        days_remaining: null,
        status: DocumentStatus.MISSING
      };
    }
  }, []);

  const fetchDocuments = useCallback(async (employeeId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await documentService.getDocumentsForEmployee(employeeId);
      setDocuments(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred while fetching documents'));
      console.error('Error fetching documents:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add a document
  const addDocument = useCallback(async (document: Partial<EmployeeDocument>) => {
    setError(null);
    
    try {
      if (!document.employee_id) {
        throw new Error('Employee ID is required');
      }
      
      await documentService.createDocument(document);
      await fetchDocuments(document.employee_id);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred while adding document'));
      console.error('Error adding document:', err);
      throw err;
    }
  }, [fetchDocuments]);

  // Update an existing document
  const updateDocument = useCallback(async (id: string, document: Partial<EmployeeDocument>) => {
    setError(null);
    
    try {
      await documentService.updateDocument(id, document);
      
      const existingDocument = documents.find(doc => doc.id === id);
      if (existingDocument?.employee_id) {
        await fetchDocuments(existingDocument.employee_id);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred while updating document'));
      console.error('Error updating document:', err);
      throw err;
    }
  }, [documents, fetchDocuments]);

  // Delete a document
  const deleteDocument = useCallback(async (id: string) => {
    setError(null);
    
    try {
      const documentToDelete = documents.find(doc => doc.id === id);
      
      const success = await documentService.deleteDocument(id);
      
      if (success && documentToDelete?.employee_id) {
        await fetchDocuments(documentToDelete.employee_id);
      } else {
        setDocuments(documents.filter(doc => doc.id !== id));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred while deleting document'));
      console.error('Error deleting document:', err);
      throw err;
    }
  }, [documents, fetchDocuments]);

  return {
    documents,
    isLoading,
    error,
    fetchDocuments,
    addDocument,
    updateDocument,
    deleteDocument,
    calculateStatus
  };
};
