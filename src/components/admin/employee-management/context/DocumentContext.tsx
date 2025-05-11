
import React, { createContext, useContext, useMemo } from 'react';
import { 
  DocumentCalculation, 
  EmployeeDocument 
} from '../types';
import { useEmployeeDocuments } from '../hooks/useEmployeeDocuments';

// Create the DocumentContext type
export interface DocumentContextType {
  documents: EmployeeDocument[];
  isLoading: boolean;
  error: Error | null;
  fetchDocuments: (employeeId: string) => Promise<void>;
  addDocument: (document: Partial<EmployeeDocument>) => Promise<void>;
  updateDocument: (id: string, document: Partial<EmployeeDocument>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  calculateStatus: (document: EmployeeDocument) => DocumentCalculation;
}

// Create the DocumentContext
const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

// Create the DocumentProvider component
export const DocumentProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  // Use the hook to get document management functionality
  const documentManager = useEmployeeDocuments();
  
  // Memoize the context value to prevent unnecessary re-renders
  const memoizedValue = useMemo<DocumentContextType>(() => ({
    documents: documentManager.documents,
    isLoading: documentManager.isLoading,
    error: documentManager.error,
    fetchDocuments: async (employeeId: string) => {
      await documentManager.fetchDocuments(employeeId);
    },
    addDocument: async (document: Partial<EmployeeDocument>) => {
      await documentManager.addDocument(document);
    },
    updateDocument: async (id: string, document: Partial<EmployeeDocument>) => {
      await documentManager.updateDocument(id, document);
    },
    deleteDocument: async (id: string) => {
      await documentManager.deleteDocument(id);
    },
    calculateStatus: documentManager.calculateStatus,
  }), [
    documentManager.documents,
    documentManager.isLoading,
    documentManager.error,
    documentManager.fetchDocuments,
    documentManager.addDocument,
    documentManager.updateDocument,
    documentManager.deleteDocument,
    documentManager.calculateStatus,
  ]);

  return (
    <DocumentContext.Provider value={memoizedValue}>
      {children}
    </DocumentContext.Provider>
  );
};

// Create the hook to use the context
export const useDocumentContext = () => {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error('useDocumentContext must be used within a DocumentProvider');
  }
  return context;
}; 
