import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Branch } from '@/hooks/useBranchManagement';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const branchFormSchema = z.object({
  name: z.string().min(1, 'Branch name is required'),
  name_ar: z.string().optional(),
  address: z.string().optional(),
  address_ar: z.string().optional(),
  is_main: z.boolean().default(false),
  whatsapp_number: z.string().optional(),
  google_maps_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  google_place_id: z.string().optional(),
});

interface BranchFormProps {
  branchData?: Branch;
  onSubmit: (data: z.infer<typeof branchFormSchema>) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  formType: 'create' | 'edit';
}

export const BranchForm = ({ 
  branchData, 
  onSubmit, 
  onCancel, 
  isSubmitting,
  formType 
}: BranchFormProps) => {
  const form = useForm<z.infer<typeof branchFormSchema>>({
    resolver: zodResolver(branchFormSchema),
    defaultValues: {
      name: branchData?.name || '',
      name_ar: branchData?.name_ar || '',
      address: branchData?.address || '',
      address_ar: branchData?.address_ar || '',
      is_main: branchData ? branchData.is_main : false,
      whatsapp_number: branchData?.whatsapp_number || '',
      google_maps_url: branchData?.google_maps_url || '',
      google_place_id: branchData?.google_place_id || '',
    },
  });

  const handleSubmit = (values: z.infer<typeof branchFormSchema>) => {
    const submitData = {
      ...values,
      whatsapp_number: values.whatsapp_number || null,
      google_maps_url: values.google_maps_url || null,
      google_place_id: values.google_place_id || null,
    };
    
    onSubmit(submitData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Basic Information */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Branch Name (English)</FormLabel>
                <FormControl>
                  <Input placeholder="Main Branch" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="name_ar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Branch Name (Arabic)</FormLabel>
                <FormControl>
                  <Input placeholder="الفرع الرئيسي" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address (English)</FormLabel>
                <FormControl>
                  <Input placeholder="123 Main St, City" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="address_ar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address (Arabic)</FormLabel>
                <FormControl>
                  <Input placeholder="123 الشارع الرئيسي، المدينة" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="whatsapp_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>WhatsApp Number</FormLabel>
                <FormControl>
                  <Input placeholder="+966501234567" {...field} />
                </FormControl>
                <FormDescription>
                  Include country code (e.g., +966)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="is_main"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Main Branch</FormLabel>
                  <FormDescription>
                    Set this as the main branch of your business
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="google_maps_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Google Maps URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://goo.gl/maps/example" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="google_place_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Google Place ID</FormLabel>
                <FormControl>
                  <Input placeholder="ChIJ..." {...field} />
                </FormControl>
                <FormDescription>
                  Used for fetching Google reviews and data
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : formType === 'create' ? 'Create Branch' : 'Update Branch'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
