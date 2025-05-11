
import { useState, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { differenceInDays, parseISO } from 'date-fns';
import { 
  EmployeeDocument,
  DocumentCalculation,
  DocumentStatus,
  DocumentType
} from '../types/index';

export const useEmployeeDocuments = () => {
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  const calculateDocumentStatus = useCallback((document: EmployeeDocument): DocumentCalculation => {
    try {
      const currentDate = new Date();
      const expiryDate = parseISO(document.expiryDate);
      const daysRemaining = differenceInDays(expiryDate, currentDate);
      
      const isExpired = daysRemaining < 0;
      const isWarning = !isExpired && daysRemaining <= document.notificationThresholdDays;
      
      let statusText = '';
      if (isExpired) {
        statusText = `Expired ${Math.abs(daysRemaining)} days ago`;
      } else if (isWarning) {
        statusText = `Expires in ${daysRemaining} days`;
      } else {
        statusText = `Valid for ${daysRemaining} days`;
      }
      
      return {
        daysRemaining,
        isExpired,
        isWarning,
        statusText,
        expiryDate
      };
    } catch (error) {
      console.error('Error calculating document status:', error);
      return {
        daysRemaining: null,
        isExpired: false,
        isWarning: false,
        statusText: 'Error calculating status'
      };
    }
  }, []);

  const fetchDocuments = useCallback(async (employeeId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('employee_documents')
        .select('*')
        .eq('employee_id', employeeId);
        
      if (fetchError) throw new Error(fetchError.message);
      
      if (data) {
        const processedDocuments = data.map(doc => ({
          id: doc.id,
          employeeId: doc.employee_id,
          documentType: doc.document_type as DocumentType,
          documentName: doc.document_name,
          documentNumber: doc.document_number,
          issueDate: doc.issue_date,
          expiryDate: doc.expiry_date,
          durationMonths: doc.duration_months,
          notificationThresholdDays: doc.notification_threshold_days,
          documentUrl: doc.document_url,
          notes: doc.notes,
          createdAt: doc.created_at,
          updatedAt: doc.updated_at
        })) as EmployeeDocument[];
        
        setDocuments(processedDocuments);
      } else {
        setDocuments([]);
      }
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
      const documentData = {
        employee_id: document.employeeId,
        document_type: document.documentType,
        document_name: document.documentName,
        document_number: document.documentNumber,
        issue_date: document.issueDate,
        expiry_date: document.expiryDate,
        duration_months: document.durationMonths,
        notification_threshold_days: document.notificationThresholdDays,
        document_url: document.documentUrl,
        notes: document.notes
      };
      
      const { error: insertError } = await supabase
        .from('employee_documents')
        .insert(documentData);
        
      if (insertError) throw new Error(insertError.message);
      
      if (document.employeeId) {
        await fetchDocuments(document.employeeId);
      }
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
      const documentData = {
        document_type: document.documentType,
        document_name: document.documentName,
        document_number: document.documentNumber,
        issue_date: document.issueDate,
        expiry_date: document.expiryDate,
        duration_months: document.durationMonths,
        notification_threshold_days: document.notificationThresholdDays,
        document_url: document.documentUrl,
        notes: document.notes
      };
      
      const { error: updateError } = await supabase
        .from('employee_documents')
        .update(documentData)
        .eq('id', id);
        
      if (updateError) throw new Error(updateError.message);
      
      const existingDocument = documents.find(doc => doc.id === id);
      if (existingDocument?.employeeId) {
        await fetchDocuments(existingDocument.employeeId);
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
      
      const { error: deleteError } = await supabase
        .from('employee_documents')
        .delete()
        .eq('id', id);
        
      if (deleteError) throw new Error(deleteError.message);
      
      if (documentToDelete?.employeeId) {
        await fetchDocuments(documentToDelete.employeeId);
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
    calculateDocumentStatus
  };
};

export type { EmployeeDocument, DocumentCalculation, DocumentStatus, DocumentType };
