import { supabase } from '@/integrations/supabase/client';
import { 
  EmployeeDocument, 
  EmployeeDocumentInput,
  DocumentWithStatus, 
  DocumentService 
} from '../types/document-types';

/**
 * Service for managing employee documents through Supabase
 */
export const documentService: DocumentService = {
  /**
   * Get all documents for a specific employee
   */
  async getDocumentsForEmployee(employeeId: string): Promise<EmployeeDocument[]> {
    const { data, error } = await supabase
      .from('employee_documents_with_status')
      .select('*')
      .eq('employee_id', employeeId)
      .order('expiry_date', { ascending: true });
    
    if (error) {
      console.error('Error fetching employee documents:', error);
      throw new Error(`Failed to fetch employee documents: ${error.message}`);
    }
    
    return data as EmployeeDocument[];
  },
  
  /**
   * Create a new document
   */
  async createDocument(document: EmployeeDocumentInput): Promise<EmployeeDocument> {
    const { data, error } = await supabase
      .from('employee_documents')
      .insert(document)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating document:', error);
      throw new Error(`Failed to create document: ${error.message}`);
    }
    
    return data as EmployeeDocument;
  },
  
  /**
   * Update an existing document
   */
  async updateDocument(id: string, document: Partial<EmployeeDocumentInput>): Promise<EmployeeDocument> {
    const { data, error } = await supabase
      .from('employee_documents')
      .update(document)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating document:', error);
      throw new Error(`Failed to update document: ${error.message}`);
    }
    
    return data as EmployeeDocument;
  },
  
  /**
   * Delete a document
   */
  async deleteDocument(id: string): Promise<void> {
    const { error } = await supabase
      .from('employee_documents')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting document:', error);
      throw new Error(`Failed to delete document: ${error.message}`);
    }
  },
  
  /**
   * Get all documents that are expiring soon
   */
  async getExpiringDocuments(thresholdDays: number = 30): Promise<DocumentWithStatus[]> {
    const { data, error } = await supabase
      .from('employee_documents_with_status')
      .select('*')
      .eq('status', 'expiring_soon')
      .lte('days_remaining', thresholdDays)
      .order('days_remaining', { ascending: true });
    
    if (error) {
      console.error('Error fetching expiring documents:', error);
      throw new Error(`Failed to fetch expiring documents: ${error.message}`);
    }
    
    return data as DocumentWithStatus[];
  },
  
  /**
   * Get all expired documents
   */
  async getExpiredDocuments(): Promise<DocumentWithStatus[]> {
    const { data, error } = await supabase
      .from('employee_documents_with_status')
      .select('*')
      .eq('status', 'expired')
      .order('days_remaining', { ascending: true });
    
    if (error) {
      console.error('Error fetching expired documents:', error);
      throw new Error(`Failed to fetch expired documents: ${error.message}`);
    }
    
    return data as DocumentWithStatus[];
  }
}; 