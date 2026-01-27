import React, { useState } from 'react';

import { Card, CardContent, CardHeader } from '@shared/ui/components/card';

import type { EmployeeDocumentWithStatus } from '../types';

import { getEmployeeStatusColor } from './document-utils';
import { DocumentHeader } from './DocumentHeader';
import { DocumentList } from './DocumentList';

import type { Employee } from '@/features/owner/employees/types';

interface EmployeeWithBranch extends Employee {
  branch_name?: string;
}

interface EmployeeDocumentCardProps {
  employee: EmployeeWithBranch;
  documents: EmployeeDocumentWithStatus[];
  selectedDocuments: string[];
  onDocumentSelect: (documentId: string, selected: boolean) => void;
  onDocumentEdit: (document: EmployeeDocumentWithStatus) => void;
  onDocumentDelete: (documentId: string) => void;
  onAddDocument: (employeeId: string) => void;
  className?: string;
}

export const EmployeeDocumentCard: React.FC<EmployeeDocumentCardProps> = ({
  employee,
  documents,
  selectedDocuments,
  onDocumentSelect,
  onDocumentEdit,
  onDocumentDelete,
  onAddDocument,
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Check if all documents are selected for this employee
  const allDocsSelected =
    documents.length > 0 &&
    documents.every((doc) => selectedDocuments.includes(doc.id));

  const handleSelectAllForEmployee = (checked: boolean) => {
    documents.forEach((doc) => {
      onDocumentSelect(doc.id, checked);
    });
  };

  return (
    <Card className={`${className} ${getEmployeeStatusColor(documents)}`}>
      <CardHeader className="pb-3">
        <DocumentHeader
          employee={employee}
          documents={documents}
          selectedDocuments={selectedDocuments}
          allDocsSelected={allDocsSelected}
          onDocumentSelectAll={handleSelectAllForEmployee}
          onAddDocument={onAddDocument}
          isExpanded={isExpanded}
          onToggleExpanded={() => setIsExpanded(!isExpanded)}
        />
      </CardHeader>

      <CardContent className="pt-0">
        <DocumentList
          documents={documents}
          selectedDocuments={selectedDocuments}
          onDocumentSelect={onDocumentSelect}
          onDocumentEdit={onDocumentEdit}
          onDocumentDelete={onDocumentDelete}
          onAddDocument={onAddDocument}
          employeeId={employee.id}
          isExpanded={isExpanded}
        />
      </CardContent>
    </Card>
  );
};
