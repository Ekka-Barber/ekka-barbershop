
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  EmployeeDocument, 
  DocumentType, 
  DocumentCalculation 
} from '../types/document-types';

export const useEmployeeDocuments = (employeeId: string) => {
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDocuments = useCallback(async () => {
    if (!employeeId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('employee_documents')
        .select('*')
        .eq('employee_id', employeeId);
        
      if (fetchError) throw new Error(fetchError.message);
      
      if (data) {
        // Transform data to match the EmployeeDocument type
        const mappedDocuments = data.map(mapDatabaseDocumentToEmployeeDocument);
        setDocuments(mappedDocuments);
      }
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error('An unexpected error occurred'));
    } finally {
      setIsLoading(false);
    }
  }, [employeeId]);

  const addDocument = useCallback(async (documentData: Partial<EmployeeDocument>) => {
    try {
      // Transform to database format
      const dbDocument = {
        employee_id: documentData.employeeId,
        document_type: documentData.documentType,
        document_name: documentData.documentName,
        document_number: documentData.documentNumber,
        issue_date: documentData.issueDate,
        expiry_date: documentData.expiryDate,
        duration_months: documentData.durationMonths,
        notification_threshold_days: documentData.notificationThresholdDays,
        document_url: documentData.documentUrl,
        notes: documentData.notes,
      };
      
      const { data, error: insertError } = await supabase
        .from('employee_documents')
        .insert(dbDocument)
        .select();
        
      if (insertError) throw new Error(insertError.message);
      
      if (data && data[0]) {
        const newDocument = mapDatabaseDocumentToEmployeeDocument(data[0]);
        setDocuments(prevDocuments => [...prevDocuments, newDocument]);
      }
      
      return data;
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error('Failed to add document'));
      throw err;
    }
  }, []);

  const updateDocument = useCallback(async (id: string, documentData: Partial<EmployeeDocument>) => {
    try {
      // Transform to database format
      const dbDocument = {
        document_type: documentData.documentType,
        document_name: documentData.documentName,
        document_number: documentData.documentNumber,
        issue_date: documentData.issueDate,
        expiry_date: documentData.expiryDate,
        duration_months: documentData.durationMonths,
        notification_threshold_days: documentData.notificationThresholdDays,
        document_url: documentData.documentUrl,
        notes: documentData.notes,
      };
      
      const { data, error: updateError } = await supabase
        .from('employee_documents')
        .update(dbDocument)
        .eq('id', id)
        .select();
        
      if (updateError) throw new Error(updateError.message);
      
      if (data && data[0]) {
        const updatedDocument = mapDatabaseDocumentToEmployeeDocument(data[0]);
        setDocuments(prevDocuments => 
          prevDocuments.map(doc => 
            doc.id === id ? updatedDocument : doc
          )
        );
      }
      
      return data;
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error('Failed to update document'));
      throw err;
    }
  }, []);

  const deleteDocument = useCallback(async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('employee_documents')
        .delete()
        .eq('id', id);
        
      if (deleteError) throw new Error(deleteError.message);
      
      setDocuments(prevDocuments => 
        prevDocuments.filter(doc => doc.id !== id)
      );
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error('Failed to delete document'));
      throw err;
    }
  }, []);

  const calculateDocumentStatus = useCallback((document: EmployeeDocument): DocumentCalculation => {
    if (!document.expiryDate) {
      return {
        daysRemaining: null,
        isExpired: false,
        isWarning: false,
      };
    }

    const today = new Date();
    const expiryDate = new Date(document.expiryDate);
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return {
      daysRemaining: diffDays,
      isExpired: diffDays < 0,
      isWarning: diffDays >= 0 && diffDays <= document.notificationThresholdDays,
    };
  }, []);

  const documentStatuses = useMemo(() => {
    return documents.map(doc => {
      const calculation = calculateDocumentStatus(doc);
      return { ...doc, status: calculation };
    });
  }, [documents, calculateDocumentStatus]);
  
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return {
    documents: documentStatuses,
    isLoading,
    error,
    fetchDocuments,
    addDocument,
    updateDocument,
    deleteDocument,
    calculateDocumentStatus
  };
};

// Helper function to map database document to EmployeeDocument type
function mapDatabaseDocumentToEmployeeDocument(dbDoc: any): EmployeeDocument {
  return {
    id: dbDoc.id,
    employeeId: dbDoc.employee_id,
    documentType: dbDoc.document_type as DocumentType,
    documentName: dbDoc.document_name,
    documentNumber: dbDoc.document_number,
    issueDate: dbDoc.issue_date,
    expiryDate: dbDoc.expiry_date,
    durationMonths: dbDoc.duration_months,
    notificationThresholdDays: dbDoc.notification_threshold_days,
    documentUrl: dbDoc.document_url,
    notes: dbDoc.notes,
    createdAt: dbDoc.created_at,
    updatedAt: dbDoc.updated_at,
  };
}
