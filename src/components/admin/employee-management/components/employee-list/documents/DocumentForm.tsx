
import React, { useEffect } from 'react';
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { 
  EmployeeDocument, 
  DocumentTypeEnum, 
  DocumentFormProps 
} from '../../../types';
import { addDays, format } from 'date-fns';

export const DocumentForm: React.FC<DocumentFormProps> = ({
  document,
  employeeId,
  onSubmit,
  onCancel,
  isSubmitting
}) => {
  const form = useForm<Partial<EmployeeDocument>>({
    defaultValues: document || {
      employeeId,
      documentType: 'health_certificate' as DocumentTypeEnum,
      documentName: '',
      notificationThresholdDays: 30,
      durationMonths: 12,
    }
  });

  const watchDocumentType = form.watch('documentType');
  const watchIssueDate = form.watch('issueDate');
  const watchDurationMonths = form.watch('durationMonths');

  // Set document name based on document type
  useEffect(() => {
    if (watchDocumentType && watchDocumentType !== 'custom') {
      const documentNames: Record<DocumentTypeEnum, string> = {
        health_certificate: 'Health Certificate',
        residency_permit: 'Residency Permit',
        work_license: 'Work License',
        custom: ''
      };
      form.setValue('documentName', documentNames[watchDocumentType as DocumentTypeEnum]);
    }
  }, [watchDocumentType, form]);

  // Calculate expiry date based on issue date and duration
  useEffect(() => {
    if (watchIssueDate && watchDurationMonths) {
      try {
        const issueDate = new Date(watchIssueDate);
        // Add months by converting to days (approximation)
        const expiryDate = addDays(issueDate, watchDurationMonths * 30);
        form.setValue('expiryDate', format(expiryDate, 'yyyy-MM-dd'));
      } catch (error) {
        console.error('Error calculating expiry date:', error);
      }
    }
  }, [watchIssueDate, watchDurationMonths, form]);

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      await onSubmit({
        ...data,
        employeeId,
      });
      form.reset();
    } catch (error) {
      console.error('Error submitting document:', error);
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          control={form.control}
          name="documentType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Document Type</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value as string}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="health_certificate">Health Certificate</SelectItem>
                  <SelectItem value="residency_permit">Residency Permit</SelectItem>
                  <SelectItem value="work_license">Work License</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {watchDocumentType === 'custom' && (
          <FormField
            control={form.control}
            name="documentName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Document Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="documentNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Document Number</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="issueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Issue Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="durationMonths"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (Months)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    onChange={(e) => field.onChange(parseInt(e.target.value, 10))} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="expiryDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expiry Date</FormLabel>
              <FormControl>
                <Input 
                  type="date" 
                  {...field}
                  disabled 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notificationThresholdDays"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notification Threshold (Days)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value, 10))} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="documentUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Document URL</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : document?.id ? 'Update Document' : 'Add Document'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
