
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { DocumentWithStatus, DocumentType, DocumentStatus, DocumentCalculation } from "../../../types/index";
import { format } from "date-fns";
import { CalendarIcon, FileIcon, Trash2, Edit, ExternalLink } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

interface DocumentItemProps {
  document: DocumentWithStatus;
  statusDetails: DocumentCalculation;
  onEdit: (document: DocumentWithStatus) => void;
  onDelete: (documentId: string) => void;
}

export const DocumentItem = ({ document, statusDetails, onEdit, onDelete }: DocumentItemProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const getStatusColor = (status: DocumentStatus) => {
    switch (status) {
      case DocumentStatus.VALID:
        return "bg-green-500 hover:bg-green-600";
      case DocumentStatus.EXPIRING:
        return "bg-amber-500 hover:bg-amber-600";
      case DocumentStatus.EXPIRED:
        return "bg-red-500 hover:bg-red-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  const getDocumentTypeIcon = (type: DocumentType) => {
    switch (type) {
      case DocumentType.PASSPORT:
        return "🛂";
      case DocumentType.NATIONAL_ID:
        return "🪪";
      case DocumentType.RESIDENCE_PERMIT:
        return "📄";
      case DocumentType.WORK_PERMIT:
        return "📋";
      case DocumentType.INSURANCE:
        return "🏥";
      case DocumentType.CONTRACT:
        return "📝";
      case DocumentType.CERTIFICATE:
        return "🎓";
      case DocumentType.LICENSE:
        return "🔑";
      case DocumentType.TAX_DOCUMENT:
        return "💰";
      case DocumentType.MEDICAL_TEST:
        return "🩺";
      case DocumentType.EDUCATION:
        return "🎓";
      case DocumentType.REFERENCE:
        return "📄";
      case DocumentType.VISA:
        return "🛂";
      default:
        return "📄";
    }
  };

  return (
    <>
      <Card className="border rounded-md shadow-sm hover:shadow transition-shadow">
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xl" role="img" aria-label={document.document_type}>
                  {getDocumentTypeIcon(document.document_type)}
                </span>
                <h3 className="font-medium text-lg">{document.document_name}</h3>
              </div>
              {document.document_number && (
                <p className="text-sm text-gray-600">ID: {document.document_number}</p>
              )}
            </div>
            <Badge className={getStatusColor(document.status)}>
              {document.status}
              {statusDetails.days_remaining !== undefined
                ? document.status === DocumentStatus.EXPIRED
                  ? ` (${Math.abs(statusDetails.days_remaining)} days ago)`
                  : ` (${statusDetails.days_remaining} days left)`
                : ""}
            </Badge>
          </div>

          <div className="mt-3 space-y-1">
            <div className="flex items-center text-sm text-gray-600">
              <CalendarIcon className="h-4 w-4 mr-2" />
              <span>
                Issue: {format(new Date(document.issue_date), "PP")}
              </span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <CalendarIcon className="h-4 w-4 mr-2" />
              <span>
                Expiry: {format(new Date(document.expiry_date), "PP")}
              </span>
            </div>
            {document.notes && (
              <p className="text-sm text-gray-600 italic mt-2">{document.notes}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between bg-gray-50 p-2 border-t">
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => onEdit(document)}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
          {document.document_url && (
            <Button variant="outline" size="sm" asChild>
              <a href={document.document_url} target="_blank" rel="noopener noreferrer">
                <FileIcon className="h-4 w-4 mr-1" />
                View
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </Button>
          )}
        </CardFooter>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this document? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={() => {
                onDelete(document.id);
                setIsDeleteDialogOpen(false);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
