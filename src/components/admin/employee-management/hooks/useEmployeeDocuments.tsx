import { useState, useCallback } from 'react';
import { addDays, differenceInDays } from 'date-fns';
import { EmployeeDocument, DocumentCalculation, DocumentStatus } from '../types';

// DO NOT CHANGE API LOGIC
// IMPORTANT: This is a temporary implementation using local state
// In the final implementation, this will use the API
export const useEmployeeDocuments = () => {
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // DO NOT CHANGE API LOGIC
  const fetchDocuments = useCallback(async (employeeId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // IMPORTANT: In the final implementation, this would be an API call
      // The API endpoint would be:
      // GET /api/employees/{employeeId}/documents
      console.log('Fetching documents for employee:', employeeId);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // For now, return the documents from local state
      // filtered by employee ID
      const employeeDocuments = documents.filter(doc => doc.employeeId === employeeId);
      setDocuments(employeeDocuments);
      
      setIsLoading(false);
      return employeeDocuments;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      setIsLoading(false);
      throw error;
    }
  }, [documents]);

  // DO NOT CHANGE API LOGIC
  const addDocument = useCallback(async (document: Partial<EmployeeDocument>) => {
    try {
      // IMPORTANT: In the final implementation, this would be an API call
      // The API endpoint would be:
      // POST /api/employees/{employeeId}/documents
      console.log('Adding document:', document);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Create a new document with fake ID and timestamps
      const newDocument: EmployeeDocument = {
        id: `doc_${Date.now()}`,
        employeeId: document.employeeId || '',
        documentType: document.documentType || 'custom',
        documentName: document.documentName || 'Untitled Document',
        documentNumber: document.documentNumber,
        issueDate: document.issueDate || new Date().toISOString(),
        expiryDate: document.expiryDate || addDays(new Date(), 365).toISOString(),
        durationMonths: document.durationMonths || 12,
        status: calculateDocumentStatus(document.expiryDate || addDays(new Date(), 365).toISOString(), document.notificationThresholdDays || 30),
        notificationThresholdDays: document.notificationThresholdDays || 30,
        documentUrl: document.documentUrl,
        notes: document.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      setDocuments(prevDocuments => [...prevDocuments, newDocument]);
      return newDocument;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to add document');
      console.error(error);
      throw error;
    }
  }, []);

  // DO NOT CHANGE API LOGIC
  const updateDocument = useCallback(async (id: string, document: Partial<EmployeeDocument>) => {
    try {
      // IMPORTANT: In the final implementation, this would be an API call
      // The API endpoint would be:
      // PUT /api/documents/{id}
      console.log('Updating document:', id, document);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setDocuments(prevDocuments => {
        return prevDocuments.map(doc => {
          if (doc.id === id) {
            // Calculate status for updated document
            const expiryDate = document.expiryDate || doc.expiryDate;
            const notificationThreshold = document.notificationThresholdDays || doc.notificationThresholdDays;
            const status = calculateDocumentStatus(expiryDate, notificationThreshold);
            
            return {
              ...doc,
              ...document,
              status,
              updatedAt: new Date().toISOString(),
            };
          }
          return doc;
        });
      });
      
      return id;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update document');
      console.error(error);
      throw error;
    }
  }, []);

  // DO NOT CHANGE API LOGIC
  const deleteDocument = useCallback(async (id: string) => {
    try {
      // IMPORTANT: In the final implementation, this would be an API call
      // The API endpoint would be:
      // DELETE /api/documents/{id}
      console.log('Deleting document:', id);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setDocuments(prevDocuments => 
        prevDocuments.filter(doc => doc.id !== id)
      );
      
      return id;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete document');
      console.error(error);
      throw error;
    }
  }, []);

  // Calculate document status based on expiry date and notification threshold
  const calculateDocumentStatus = (expiryDate: string, notificationThresholdDays: number): DocumentStatus => {
    try {
      const today = new Date();
      const expiry = new Date(expiryDate);
      
      if (today > expiry) {
        return 'expired';
      }
      
      const daysUntilExpiry = differenceInDays(expiry, today);
      if (daysUntilExpiry <= notificationThresholdDays) {
        return 'expiring_soon';
      }
      
      return 'valid';
    } catch (error) {
      console.error('Error calculating document status:', error);
      return 'valid'; // Default to valid on error
    }
  };

  // Calculate detailed status information for display
  const calculateStatus = useCallback((document: EmployeeDocument): DocumentCalculation => {
    try {
      const today = new Date();
      const expiryDate = new Date(document.expiryDate);
      const isExpired = today > expiryDate;
      const daysRemaining = differenceInDays(expiryDate, today);
      const isExpiringSoon = !isExpired && daysRemaining <= document.notificationThresholdDays;
      
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

  return {
    documents,
    isLoading,
    error,
    fetchDocuments,
    addDocument,
    updateDocument,
    deleteDocument,
    calculateStatus,
  };
}; 