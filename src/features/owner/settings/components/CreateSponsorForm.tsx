import { PlusCircle, X } from 'lucide-react';
import { useState } from 'react';

import { supabase } from '@shared/lib/supabase/client';
import { Button } from '@shared/ui/components/button';
import { Input } from '@shared/ui/components/input';
import { Label } from '@shared/ui/components/label';
import { useToast } from '@shared/ui/components/use-toast';

interface CreateSponsorFormProps {
  onSuccess: () => void;
}

export const CreateSponsorForm = ({ onSuccess }: CreateSponsorFormProps) => {
  const { toast } = useToast();
  const [nameAr, setNameAr] = useState('');
  const [crNumber, setCrNumber] = useState('');
  const [unifiedNumber, setUnifiedNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const resetFormFields = () => {
    setNameAr('');
    setCrNumber('');
    setUnifiedNumber('');
  };

  const handleCreateSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);

      const { error } = await supabase.from('sponsors').insert({
        name_ar: nameAr,
        cr_number: crNumber,
        unified_number: unifiedNumber,
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Sponsor created successfully',
      });

      resetFormFields();
      onSuccess();
      setIsExpanded(false);
    } catch (error: unknown) {
      let message = 'An unknown error occurred';
      if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === 'string') {
        message = error;
      }
      toast({
        variant: 'destructive',
        title: 'Error',
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    resetFormFields();
    setIsExpanded(false);
  };

  if (!isExpanded) {
    return (
      <Button
        onClick={() => setIsExpanded(true)}
        className="w-full sm:w-auto flex items-center justify-center mb-4"
        variant="outline"
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Add New Sponsor
      </Button>
    );
  }

  return (
    <div className="p-4 border rounded-md mb-6">
      <h4 className="text-md font-semibold mb-4">Add New Sponsor</h4>
      <form onSubmit={handleCreateSponsor} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-start">
          <div className="space-y-2">
            <Label htmlFor="nameAr">اسم الكفيل</Label>
            <Input
              id="nameAr"
              placeholder="أدخل اسم الكفيل بالعربية"
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
              required
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="crNumber">رقم السجل التجاري</Label>
            <Input
              id="crNumber"
              placeholder="أدخل رقم السجل التجاري"
              value={crNumber}
              onChange={(e) => setCrNumber(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="unifiedNumber">الرقم الموحد</Label>
            <Input
              id="unifiedNumber"
              placeholder="أدخل الرقم الموحد"
              value={unifiedNumber}
              onChange={(e) => setUnifiedNumber(e.target.value)}
              required
              className="w-full"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={handleCancel}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            <X className="mr-2 h-4 w-4" />
            إلغاء
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto order-1 sm:order-2"
          >
            {isLoading ? 'جارٍ الإضافة...' : 'إضافة الكفيل'}
          </Button>
        </div>
      </form>
    </div>
  );
};
