
import { useState, useCallback, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { EmployeeDocument, DocumentStatus, DocumentCalculation } from '../types';
import { differenceInDays, parseISO } from 'date-fns';

export const useEmployeeDocuments = () => {
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Calculate status for a document
  const calculateStatus = useCallback((document: EmployeeDocument): DocumentCalculation => {
    // Default values
    let status: DocumentStatus = 'valid';
    let statusText = 'Valid';
    let daysRemaining = 0;

    if (document.expiryDate) {
      const today = new Date();
      const expiryDate = parseISO(document.expiryDate);
      daysRemaining = differenceInDays(expiryDate, today);

      // Determine status based on days remaining and notification threshold
      if (daysRemaining <= 0) {
        status = 'expired';
        statusText = 'Expired';
      } else if (daysRemaining <= document.notificationThresholdDays) {
        status = 'expiring_soon';
        statusText = `Expires in ${daysRemaining} days`;
      } else {
        status = 'valid';
        statusText = `Valid (${daysRemaining} days left)`;
      }
    }

    return { status, statusText, daysRemaining };
  }, []);

  // Map database document format to our frontend format
  const mapDbDocumentToEmployeeDocument = useCallback((dbDoc: any): EmployeeDocument => {
    const employeeDoc: EmployeeDocument = {
      id: dbDoc.id,
      employeeId: dbDoc.employee_id,
      documentType: dbDoc.document_type,
      documentName: dbDoc.document_name,
      documentNumber: dbDoc.document_number,
      issueDate: dbDoc.issue_date,
      expiryDate: dbDoc.expiry_date,
      durationMonths: dbDoc.duration_months,
      notificationThresholdDays: dbDoc.notification_threshold_days,
      documentUrl: dbDoc.document_url,
      notes: dbDoc.notes,
    };
    
    // Calculate status
    const statusDetails = calculateStatus(employeeDoc);
    employeeDoc.status = statusDetails.status;
    
    return employeeDoc;
  }, [calculateStatus]);

  // Map frontend document format back to database format
  const mapEmployeeDocumentToDb = useCallback((doc: Partial<EmployeeDocument>): any => {
    return {
      employee_id: doc.employeeId,
      document_type: doc.documentType,
      document_name: doc.documentName,
      document_number: doc.documentNumber,
      issue_date: doc.issueDate,
      expiry_date: doc.expiryDate,
      duration_months: doc.durationMonths,
      notification_threshold_days: doc.notificationThresholdDays,
      document_url: doc.documentUrl,
      notes: doc.notes,
    };
  }, []);

  // Fetch documents for employee
  const fetchDocuments = useCallback(async (employeeId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('employee_documents')
        .select('*')
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false });

      if (fetchError) throw new Error(fetchError.message);

      const mappedDocuments = data ? data.map(mapDbDocumentToEmployeeDocument) : [];
      setDocuments(mappedDocuments);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error fetching documents'));
      console.error('Error fetching documents:', err);
    } finally {
      setIsLoading(false);
    }
  }, [mapDbDocumentToEmployeeDocument]);

  // Add new document
  const addDocument = useCallback(async (document: Partial<EmployeeDocument>) => {
    try {
      setError(null);
      const dbDocument = mapEmployeeDocumentToDb(document);
      
      const { data, error: insertError } = await supabase
        .from('employee_documents')
        .insert(dbDocument)
        .select()
        .single();
        
      if (insertError) throw new Error(insertError.message);
      
      // Add new document to state
      if (data) {
        const newDocument = mapDbDocumentToEmployeeDocument(data);
        setDocuments(prev => [newDocument, ...prev]);
      }
      
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error adding document'));
      console.error('Error adding document:', err);
      throw err;
    }
  }, [mapEmployeeDocumentToDb, mapDbDocumentToEmployeeDocument]);

  // Update existing document
  const updateDocument = useCallback(async (id: string, document: Partial<EmployeeDocument>) => {
    try {
      setError(null);
      const dbDocument = mapEmployeeDocumentToDb(document);
      
      const { data, error: updateError } = await supabase
        .from('employee_documents')
        .update(dbDocument)
        .eq('id', id)
        .select()
        .single();
        
      if (updateError) throw new Error(updateError.message);
      
      // Update document in state
      if (data) {
        const updatedDocument = mapDbDocumentToEmployeeDocument(data);
        setDocuments(prev => 
          prev.map(doc => doc.id === id ? updatedDocument : doc)
        );
      }
      
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error updating document'));
      console.error('Error updating document:', err);
      throw err;
    }
  }, [mapEmployeeDocumentToDb, mapDbDocumentToEmployeeDocument]);

  // Delete document
  const deleteDocument = useCallback(async (id: string) => {
    try {
      setError(null);
      const { error: deleteError } = await supabase
        .from('employee_documents')
        .delete()
        .eq('id', id);
        
      if (deleteError) throw new Error(deleteError.message);
      
      // Remove document from state
      setDocuments(prev => prev.filter(doc => doc.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error deleting document'));
      console.error('Error deleting document:', err);
      throw err;
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
