import { Edit, Calendar, FileX } from 'lucide-react';
import React from 'react';

import { Button } from '@shared/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@shared/ui/components/dialog';
import { Label } from '@shared/ui/components/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/ui/components/select';
import { Textarea } from '@shared/ui/components/textarea';

import type { BulkEditFormData } from './types';
import { NOTIFICATION_THRESHOLD_OPTIONS } from './utils';


interface BulkEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  formData: BulkEditFormData;
  onFormDataChange: (updates: Partial<BulkEditFormData>) => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const BulkEditDialog: React.FC<BulkEditDialogProps> = ({
  open,
  onOpenChange,
  selectedCount,
  formData,
  onFormDataChange,
  onConfirm,
  isLoading = false,
}) => {
  const handleActionChange = (
    value: 'update_notifications' | 'add_notes' | 'replace_notes'
  ) => {
    onFormDataChange({ action: value });
  };

  const handleThresholdChange = (value: string) => {
    onFormDataChange({
      notification_threshold_days: parseInt(value),
    });
  };

  const handleNotesChange = (value: string) => {
    onFormDataChange({ notes: value });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Multiple Documents</DialogTitle>
          <DialogDescription>
            Make changes to {selectedCount} selected documents
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Action Type</Label>
            <Select value={formData.action} onValueChange={handleActionChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="update_notifications">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Update Notification Days
                  </div>
                </SelectItem>
                <SelectItem value="add_notes">
                  <div className="flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    Add Notes
                  </div>
                </SelectItem>
                <SelectItem value="replace_notes">
                  <div className="flex items-center gap-2">
                    <FileX className="h-4 w-4" />
                    Replace Notes
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.action === 'update_notifications' && (
            <div className="space-y-2">
              <Label>Notification Threshold (days before expiry)</Label>
              <Select
                value={formData.notification_threshold_days?.toString() || ''}
                onValueChange={handleThresholdChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select notification days" />
                </SelectTrigger>
                <SelectContent>
                  {NOTIFICATION_THRESHOLD_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value.toString()}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {(formData.action === 'add_notes' ||
            formData.action === 'replace_notes') && (
            <div className="space-y-2">
              <Label>
                {formData.action === 'add_notes' ? 'Notes to Add' : 'New Notes'}
              </Label>
              <Textarea
                value={formData.notes || ''}
                onChange={(e) => handleNotesChange(e.target.value)}
                placeholder={
                  formData.action === 'add_notes'
                    ? 'Enter additional notes...'
                    : 'Enter new notes (will replace existing notes)...'
                }
                rows={3}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isLoading}>
            Update {selectedCount} Documents
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
