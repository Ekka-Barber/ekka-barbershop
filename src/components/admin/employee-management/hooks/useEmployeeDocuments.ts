
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
      const { data, error: fetchError } = await supabase
        .from('employee_documents')
        .select('*')
        .eq('employee_id', employeeId);
        
      if (fetchError) throw new Error(fetchError.message);
      
      if (data) {
        // Directly use data as it already has the correct property names
        setDocuments(data as EmployeeDocument[]);
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
        employee_id: document.employee_id,
        document_type: document.document_type,
        document_name: document.document_name,
        document_number: document.document_number,
        issue_date: document.issue_date,
        expiry_date: document.expiry_date,
        duration_months: document.duration_months,
        notification_threshold_days: document.notification_threshold_days,
        document_url: document.document_url,
        notes: document.notes
      };
      
      const { error: insertError } = await supabase
        .from('employee_documents')
        .insert(documentData);
        
      if (insertError) throw new Error(insertError.message);
      
      if (document.employee_id) {
        await fetchDocuments(document.employee_id);
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
        document_type: document.document_type,
        document_name: document.document_name,
        document_number: document.document_number,
        issue_date: document.issue_date,
        expiry_date: document.expiry_date,
        duration_months: document.duration_months,
        notification_threshold_days: document.notification_threshold_days,
        document_url: document.document_url,
        notes: document.notes
      };
      
      const { error: updateError } = await supabase
        .from('employee_documents')
        .update(documentData)
        .eq('id', id);
        
      if (updateError) throw new Error(updateError.message);
      
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
      
      const { error: deleteError } = await supabase
        .from('employee_documents')
        .delete()
        .eq('id', id);
        
      if (deleteError) throw new Error(deleteError.message);
      
      if (documentToDelete?.employee_id) {
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

export type { EmployeeDocument, DocumentCalculation, DocumentStatus, DocumentType };
