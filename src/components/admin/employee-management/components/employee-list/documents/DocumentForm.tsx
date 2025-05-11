
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, addMonths } from "date-fns";
import { DocumentType, DocumentFormProps } from "../../../types/document-types";
import { cn } from "@/lib/utils";

export const DocumentForm = ({ 
  onSubmit, 
  defaultValues = {}, 
  documentType,
  isSubmitting = false,
  onCancel
}: DocumentFormProps) => {
  const [issueDate, setIssueDate] = useState<Date | undefined>(
    defaultValues.issue_date ? new Date(defaultValues.issue_date) : undefined
  );
  
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(
    defaultValues.expiry_date ? new Date(defaultValues.expiry_date) : undefined
  );
  
  const [durationMonths, setDurationMonths] = useState<number>(
    defaultValues.duration_months || 12
  );
  
  const [notificationDays, setNotificationDays] = useState<number>(
    defaultValues.notification_threshold_days || 30
  );
  
  const [selectedDocType, setSelectedDocType] = useState<DocumentType>(
    defaultValues.document_type || documentType || DocumentType.OTHER
  );
  
  const [documentName, setDocumentName] = useState<string>(
    defaultValues.document_name || getDefaultDocumentName(selectedDocType)
  );
  
  const [documentNumber, setDocumentNumber] = useState<string>(
    defaultValues.document_number || ""
  );
  
  const [documentUrl, setDocumentUrl] = useState<string>(
    defaultValues.document_url || ""
  );
  
  const [notes, setNotes] = useState<string>(
    defaultValues.notes || ""
  );

  function getDefaultDocumentName(type: DocumentType): string {
    switch (type) {
      case DocumentType.PASSPORT:
        return "Passport";
      case DocumentType.NATIONAL_ID:
        return "National ID";
      case DocumentType.RESIDENCE_PERMIT:
        return "Residence Permit (Iqama)";
      case DocumentType.WORK_PERMIT:
        return "Work Permit";
      case DocumentType.INSURANCE:
        return "Health Insurance";
      case DocumentType.CONTRACT:
        return "Employment Contract";
      case DocumentType.CERTIFICATE:
        return "Certificate";
      case DocumentType.LICENSE:
        return "License";
      case DocumentType.TAX_DOCUMENT:
        return "Tax Document";
      case DocumentType.MEDICAL_TEST:
        return "Medical Test";
      case DocumentType.EDUCATION:
        return "Education Certificate";
      case DocumentType.REFERENCE:
        return "Reference Letter";
      case DocumentType.VISA:
        return "Visa";
      case DocumentType.OTHER:
      default:
        return "Other Document";
    }
  }

  const handleDocTypeChange = (value: string) => {
    const newType = value as DocumentType;
    setSelectedDocType(newType);
    
    // If the document name is empty or was a default name, update it
    if (!documentName || documentName === getDefaultDocumentName(selectedDocType)) {
      setDocumentName(getDefaultDocumentName(newType));
    }
  };

  const handleIssueDateChange = (date: Date | undefined) => {
    setIssueDate(date);
    
    if (date && durationMonths) {
      // Auto calculate expiry date based on issue date and duration
      setExpiryDate(addMonths(date, durationMonths));
    }
  };

  const handleDurationChange = (value: string) => {
    const months = parseInt(value);
    setDurationMonths(months);
    
    // Update expiry date based on new duration
    if (issueDate) {
      setExpiryDate(addMonths(issueDate, months));
    }
  };

  const handleExpiryDateChange = (date: Date | undefined) => {
    setExpiryDate(date);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!issueDate || !expiryDate || !documentName) {
      return;
    }
    
    onSubmit({
      document_type: selectedDocType,
      document_name: documentName,
      document_number: documentNumber,
      document_url: documentUrl,
      issue_date: issueDate,
      expiry_date: expiryDate,
      duration_months: durationMonths,
      notification_threshold_days: notificationDays,
      notes: notes
    });
  };

  return (
    <Card className="p-4 border rounded-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Document Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="document-type">Document Type</Label>
            <Select
              value={selectedDocType}
              onValueChange={handleDocTypeChange}
              disabled={!!documentType}
            >
              <SelectTrigger id="document-type">
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(DocumentType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {getDefaultDocumentName(type as DocumentType)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Document Name */}
          <div className="space-y-2">
            <Label htmlFor="document-name">Document Name</Label>
            <Input
              id="document-name"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              placeholder="Document Name"
              required
            />
          </div>

          {/* Document Number */}
          <div className="space-y-2">
            <Label htmlFor="document-number">Document Number/ID</Label>
            <Input
              id="document-number"
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              placeholder="Document Number (Optional)"
            />
          </div>

          {/* Document URL */}
          <div className="space-y-2">
            <Label htmlFor="document-url">Document URL</Label>
            <Input
              id="document-url"
              value={documentUrl}
              onChange={(e) => setDocumentUrl(e.target.value)}
              placeholder="Link to Document (Optional)"
              type="url"
            />
          </div>

          {/* Issue Date */}
          <div className="space-y-2">
            <Label>Issue Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !issueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {issueDate ? format(issueDate, "PPP") : <span>Select Issue Date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={issueDate}
                  onSelect={handleIssueDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (Months)</Label>
            <Select
              value={durationMonths.toString()}
              onValueChange={handleDurationChange}
            >
              <SelectTrigger id="duration">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {[1, 3, 6, 12, 24, 36, 60, 120].map((month) => (
                  <SelectItem key={month} value={month.toString()}>
                    {month === 1 ? "1 Month" : `${month} Months`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Expiry Date */}
          <div className="space-y-2">
            <Label>Expiry Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !expiryDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {expiryDate ? format(expiryDate, "PPP") : <span>Select Expiry Date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={expiryDate}
                  onSelect={handleExpiryDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Notification Threshold */}
          <div className="space-y-2">
            <Label htmlFor="notification">Notification Threshold (Days)</Label>
            <Select
              value={notificationDays.toString()}
              onValueChange={(val) => setNotificationDays(parseInt(val))}
            >
              <SelectTrigger id="notification">
                <SelectValue placeholder="Select notification threshold" />
              </SelectTrigger>
              <SelectContent>
                {[7, 14, 30, 60, 90].map((days) => (
                  <SelectItem key={days} value={days.toString()}>
                    {days} Days Before Expiry
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional Notes (Optional)"
            rows={3}
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : defaultValues.id ? "Update Document" : "Add Document"}
          </Button>
        </div>
      </form>
    </Card>
  );
};
