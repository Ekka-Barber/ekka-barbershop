import { useCallback } from 'react';

import type { SponsorDocumentType } from '@shared/types/domains';
import { Button } from '@shared/ui/components/button';
import { Input } from '@shared/ui/components/input';
import { Label } from '@shared/ui/components/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/ui/components/select';

interface SponsorDocumentUploadFormProps {
  documentTypes: SponsorDocumentType[];
  formData: {
    document_type_id: string;
    file: File | null;
    issue_date: string;
    expiry_date: string;
    duration_months: number;
  };
  onFormDataChange: (data: SponsorDocumentUploadFormProps['formData']) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isUploading: boolean;
}

const updateExpiryDate = (issueDate: string, months: number) => {
  const issue = new Date(issueDate);
  const expiry = new Date(issue);
  expiry.setMonth(expiry.getMonth() + months);
  return expiry.toISOString().split('T')[0];
};

export const SponsorDocumentUploadForm = ({
  documentTypes,
  formData,
  onFormDataChange,
  onSubmit,
  onCancel,
  isUploading,
}: SponsorDocumentUploadFormProps) => {
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFormDataChange({ ...formData, file });
    }
  }, [formData, onFormDataChange]);

  const handleDocumentTypeChange = useCallback((value: string) => {
    onFormDataChange({
      ...formData,
      document_type_id: value,
      duration_months: 12,
      expiry_date: updateExpiryDate(formData.issue_date, 12),
    });
  }, [formData, onFormDataChange]);

  const handleIssueDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    onFormDataChange({
      ...formData,
      issue_date: newDate,
      expiry_date: updateExpiryDate(newDate, formData.duration_months),
    });
  }, [formData, onFormDataChange]);

  const handleExpiryDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onFormDataChange({ ...formData, expiry_date: e.target.value });
  }, [formData, onFormDataChange]);

  return (
    <div className="mb-4 rounded-xl border border-[#d4c4a5] bg-white/60 p-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs text-[#5a4830]">نوع المستند</Label>
          <Select
            value={formData.document_type_id}
            onValueChange={handleDocumentTypeChange}
          >
            <SelectTrigger className="h-9 border-[#dcc49c] bg-white text-sm">
              <SelectValue placeholder="اختر النوع" />
            </SelectTrigger>
            <SelectContent dir="rtl">
              {documentTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name_ar}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-[#5a4830]">الملف</Label>
          <Input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            className="h-9 border-[#dcc49c] bg-white text-sm file:ms-2 file:h-7 file:rounded-lg file:border-0 file:bg-[#e9b353] file:px-3 file:text-xs file:text-white"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-[#5a4830]">تاريخ الإصدار</Label>
          <Input
            type="date"
            value={formData.issue_date}
            onChange={handleIssueDateChange}
            className="h-9 border-[#dcc49c] bg-white text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-[#5a4830]">تاريخ الانتهاء</Label>
          <Input
            type="date"
            value={formData.expiry_date}
            onChange={handleExpiryDateChange}
            className="h-9 border-[#dcc49c] bg-white text-sm"
          />
        </div>
      </div>

      <div className="mt-3 flex justify-end gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={onCancel}
          className="h-8 border-[#cfb180] text-[#5a4830]"
        >
          إلغاء
        </Button>
        <Button
          size="sm"
          onClick={onSubmit}
          disabled={!formData.file || !formData.document_type_id || isUploading}
          className="h-8 bg-[#e9b353] text-white hover:bg-[#deaa4f]"
        >
          {isUploading ? 'جاري...' : 'رفع'}
        </Button>
      </div>
    </div>
  );
};
