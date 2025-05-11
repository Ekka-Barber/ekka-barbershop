
import { supabase } from '@/integrations/supabase/client';
import { EmployeeDocument, EmployeeDocumentInput, DocumentType } from '../types/index';

export const documentService = {
  getDocumentsForEmployee: async (employeeId: string): Promise<EmployeeDocument[]> => {
    const { data, error } = await supabase
      .from('employee_documents')
      .select('*')
      .eq('employee_id', employeeId);
      
    if (error) {
      throw new Error(error.message);
    }
    
    return data as EmployeeDocument[];
  },
  
  createDocument: async (document: Partial<EmployeeDocument>): Promise<EmployeeDocument> => {
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
    
    const { data, error } = await supabase
      .from('employee_documents')
      .insert(documentData)
      .select()
      .single();
      
    if (error) {
      throw new Error(error.message);
    }
    
    return data as EmployeeDocument;
  },
  
  updateDocument: async (documentId: string, document: Partial<EmployeeDocumentInput>): Promise<EmployeeDocument> => {
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
    
    const { data, error } = await supabase
      .from('employee_documents')
      .update(documentData)
      .eq('id', documentId)
      .select()
      .single();
      
    if (error) {
      throw new Error(error.message);
    }
    
    return data as EmployeeDocument;
  },
  
  deleteDocument: async (documentId: string): Promise<boolean> => {
    const { error } = await supabase
      .from('employee_documents')
      .delete()
      .eq('id', documentId);
      
    if (error) {
      throw new Error(error.message);
    }
    
    return true; // Return true on successful deletion
  },
  
  getExpiringDocuments: async (thresholdDays: number): Promise<EmployeeDocument[]> => {
    // Implementation would fetch documents expiring soon
    return [];
  },
  
  getExpiredDocuments: async (): Promise<EmployeeDocument[]> => {
    // Implementation would fetch expired documents
    return [];
  }
};
