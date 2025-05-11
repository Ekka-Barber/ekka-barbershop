
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PencilIcon, TrashIcon, FileIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { 
  DocumentCalculation,
  EmployeeDocument,
  DocumentStatus
} from '../../../types';
import { DocumentType } from '../../../types/document-types';

interface DocumentItemProps {
  document: EmployeeDocument;
  statusDetails: DocumentCalculation;
  onEdit: () => void;
  onDelete: () => void;
}

export const DocumentItem: React.FC<DocumentItemProps> = ({ 
  document, 
  statusDetails,
  onEdit, 
  onDelete 
}) => {
  const getStatusColor = (status: 'valid' | 'expiring_soon' | 'expired') => {
    switch (status) {
      case 'valid': return 'bg-green-100 text-green-800';
      case 'expiring_soon': return 'bg-amber-100 text-amber-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDocumentStatus = (): 'valid' | 'expiring_soon' | 'expired' => {
    if (statusDetails.isExpired) return 'expired';
    if (statusDetails.isWarning) return 'expiring_soon';
    return 'valid';
  };

  const documentTypeLabels: Record<string, string> = {
    [DocumentType.HEALTH_CERTIFICATE]: 'Health Certificate',
    [DocumentType.RESIDENCY_PERMIT]: 'Residency Permit',
    [DocumentType.WORK_LICENSE]: 'Work License',
    [DocumentType.PASSPORT]: 'Passport',
    [DocumentType.ID_CARD]: 'ID Card',
    [DocumentType.DRIVING_LICENSE]: 'Driving License',
    [DocumentType.WORK_PERMIT]: 'Work Permit',
    [DocumentType.RESIDENCE_PERMIT]: 'Residence Permit',
    [DocumentType.INSURANCE]: 'Insurance',
    [DocumentType.CONTRACT]: 'Contract',
    [DocumentType.CUSTOM]: document.documentName || 'Custom Document',
    [DocumentType.OTHER]: 'Other Document'
  };

  const formattedIssueDate = document.issueDate 
    ? format(new Date(document.issueDate), 'MMM d, yyyy')
    : 'N/A';
    
  const formattedExpiryDate = document.expiryDate
    ? format(new Date(document.expiryDate), 'MMM d, yyyy')
    : 'N/A';

  const statusText = statusDetails.statusText || (
    statusDetails.isExpired ? 'Expired' : 
    statusDetails.isWarning ? `Expires in ${statusDetails.daysRemaining} days` : 
    'Valid'
  );

  return (
    <Card className="border overflow-hidden">
      <div className={`h-2 ${getStatusColor(getDocumentStatus()).split(' ')[0]}`} />
      <CardContent className="p-4">
        <div className="flex justify-between">
          <div>
            <div className="font-medium">
              <FileIcon className="inline-block w-4 h-4 mr-2" />
              {documentTypeLabels[document.documentType]}
            </div>
            {document.documentNumber && (
              <div className="text-sm text-muted-foreground mt-1">
                #{document.documentNumber}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={onEdit}>
              <PencilIcon className="w-4 h-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete}>
              <TrashIcon className="w-4 h-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">Issue Date:</span>
            <div>{formattedIssueDate}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Expiry Date:</span>
            <div>{formattedExpiryDate}</div>
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <Badge className={getStatusColor(getDocumentStatus())}>
            {statusText}
          </Badge>
          {document.documentUrl && (
            <Button variant="link" size="sm" asChild>
              <a href={document.documentUrl} target="_blank" rel="noopener noreferrer">
                View Document
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
