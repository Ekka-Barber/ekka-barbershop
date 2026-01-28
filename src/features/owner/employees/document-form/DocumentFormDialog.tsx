import { Loader2 } from 'lucide-react';
import React from 'react';
import type { UseFormReturn } from 'react-hook-form';

import { Button } from '@shared/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
} from '@shared/ui/components/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@shared/ui/components/form';
import { Input } from '@shared/ui/components/input';
import { Textarea } from '@shared/ui/components/textarea';

import { DatePickerField } from './DatePickerField';
import { DocumentTypeSelect } from './DocumentTypeSelect';
import { DurationField } from './DurationField';
import { EmployeeSelect } from './EmployeeSelect';
import { NotificationField } from './NotificationField';
import type { DocumentFormValues } from './types';

import type {
  Employee,
  EmployeeDocumentWithStatus,
  DocumentFormData,
} from '@/features/owner/employees/types';

interface DocumentFormDialogProps {
  employees: Employee[];
  document?: EmployeeDocumentWithStatus | null;
  onSubmit: (data: DocumentFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  open: boolean;
  form: UseFormReturn<DocumentFormValues>;
  handleSubmit: (values: DocumentFormValues) => Promise<void>;
}

export const DocumentFormDialog: React.FC<DocumentFormDialogProps> = ({
  employees,
  document,
  onCancel,
  isLoading = false,
  open,
  form,
  handleSubmit,
}) => {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="max-w-2xl w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {document ? 'Edit Document' : 'Add New Document'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Add or update employee document details.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <EmployeeSelect control={form.control} employees={employees} />
              <DocumentTypeSelect control={form.control} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="document_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter document name"
                        className="h-12"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="document_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter document number (optional)"
                        className="h-12"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <DatePickerField
                control={form.control}
                form={form}
                name="issue_date"
                label="Issue Date"
                placeholder="Pick issue date"
                isRequired
              />
              <DurationField control={form.control} />
              <DatePickerField
                control={form.control}
                form={form}
                name="expiry_date"
                label="Expiry Date"
                placeholder="Pick expiry date"
                isRequired
              />
            </div>

            <NotificationField control={form.control} />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional notes about this document..."
                      className="resize-none min-h-[80px] sm:min-h-[60px]"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="w-full sm:w-auto h-12"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto h-12"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {document ? 'Update Document' : 'Add Document'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
