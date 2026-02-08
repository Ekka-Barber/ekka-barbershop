import { useEffect, useState } from 'react';

import type {
  DocumentFormData,
  DocumentType,
  HRDocument,
} from '@shared/types/hr.types';
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

interface InlineDocumentFormProps {
  document: HRDocument;
  onSubmit: (data: DocumentFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const DOCUMENT_TYPE_OPTIONS: Array<{ value: DocumentType; label: string }> = [
  { value: 'health_certificate', label: 'شهادة صحية' },
  { value: 'residency_permit', label: 'بطاقة إقامة' },
  { value: 'work_license', label: 'رخصة عمل' },
  { value: 'custom', label: 'مخصص' },
];

// Format date to YYYY-MM-DD for HTML date input
const formatDateForInput = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  } catch {
    return '';
  }
};

const buildInitialFormData = (document: HRDocument): DocumentFormData => ({
  employee_id: document.employee_id,
  document_type: document.document_type,
  document_name: document.document_name,
  document_number: document.document_number ?? null,
  issue_date: formatDateForInput(document.issue_date),
  expiry_date: formatDateForInput(document.expiry_date),
  duration_months: document.duration_months ?? 12,
  notes: document.notes ?? null,
});

export const InlineDocumentForm: React.FC<InlineDocumentFormProps> = ({
  document,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState<DocumentFormData>(() =>
    buildInitialFormData(document)
  );

  useEffect(() => {
    setFormData(buildInitialFormData(document));
  }, [document]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload: DocumentFormData = {
      ...formData,
      document_name: formData.document_name.trim(),
      document_number: formData.document_number?.trim() || null,
      notes: formData.notes?.trim() || null,
      duration_months: formData.duration_months || 12,
    };

    await onSubmit(payload);
  };

  return (
    <div className="rounded-xl border border-[#e9b353] bg-gradient-to-br from-[#fffbf5] to-[#fff8ea] p-4 shadow-inner">
      <h4 className="mb-3 text-sm font-semibold text-[#2f261b]">
        تعديل المستند
      </h4>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor={`doc-type-${document.id}`} className="text-xs">
              نوع المستند<span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.document_type}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  document_type: value as DocumentType,
                }))
              }
            >
              <SelectTrigger
                id={`doc-type-${document.id}`}
                className="h-9 border-[#dcc49c] bg-white text-sm"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent dir="rtl">
                {DOCUMENT_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`doc-name-${document.id}`} className="text-xs">
              اسم المستند<span className="text-red-500">*</span>
            </Label>
            <Input
              id={`doc-name-${document.id}`}
              value={formData.document_name}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  document_name: event.target.value,
                }))
              }
              required
              dir="rtl"
              className="h-9 border-[#dcc49c] bg-white text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor={`doc-number-${document.id}`} className="text-xs">
              رقم المستند
            </Label>
            <Input
              id={`doc-number-${document.id}`}
              value={formData.document_number ?? ''}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  document_number: event.target.value,
                }))
              }
              dir="ltr"
              className="h-9 border-[#dcc49c] bg-white text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`issue-date-${document.id}`} className="text-xs">
              تاريخ الإصدار<span className="text-red-500">*</span>
            </Label>
            <Input
              id={`issue-date-${document.id}`}
              type="date"
              value={formData.issue_date}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  issue_date: event.target.value,
                }))
              }
              required
              className="h-9 border-[#dcc49c] bg-white text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`expiry-date-${document.id}`} className="text-xs">
              تاريخ الانتهاء<span className="text-red-500">*</span>
            </Label>
            <Input
              id={`expiry-date-${document.id}`}
              type="date"
              value={formData.expiry_date}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  expiry_date: event.target.value,
                }))
              }
              required
              className="h-9 border-[#dcc49c] bg-white text-sm"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`notes-${document.id}`} className="text-xs">
            ملاحظات
          </Label>
          <Input
            id={`notes-${document.id}`}
            value={formData.notes ?? ''}
            onChange={(event) =>
              setFormData((prev) => ({ ...prev, notes: event.target.value }))
            }
            placeholder="أضف أي ملاحظات إضافية..."
            dir="rtl"
            className="h-9 border-[#dcc49c] bg-white text-sm"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            type="submit"
            size="sm"
            className="flex-1 bg-[#e9b353] text-white hover:bg-[#deaa4f] h-9"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'جاري الحفظ...' : 'حفظ'}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="flex-1 border-[#cfb180] bg-white text-[#5a4830] hover:bg-[#fff4df] h-9"
          >
            إلغاء
          </Button>
        </div>
      </form>
    </div>
  );
};
