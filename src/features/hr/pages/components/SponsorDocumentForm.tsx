import { useEffect, useState } from 'react';

import type {
  SponsorDocumentFormData,
  SponsorDocumentUpdatePayload,
} from '@features/hr/hooks/useSponsorDocuments';

import type {
  Sponsor,
  SponsorDocumentType,
  SponsorDocumentWithType,
} from '@shared/types/domains';
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
import { Skeleton } from '@shared/ui/components/skeleton';

interface SponsorDocumentFormProps {
  sponsor: Sponsor;
  documentTypes: SponsorDocumentType[];
  onSubmit: (data: SponsorDocumentFormData) => Promise<void>;
  onUpdate?: (data: SponsorDocumentUpdatePayload) => Promise<void>;
  onCancel: () => void;
  editingDocument?: SponsorDocumentWithType | null;
  isSubmitting: boolean;
  isLoadingTypes: boolean;
}

const buildInitialFormData = (
  sponsorId: string,
  editingDocument: SponsorDocumentWithType | null
): Omit<SponsorDocumentFormData, 'file'> & { file: File | null } => ({
  sponsor_id: sponsorId,
  document_type_id: editingDocument?.document_type_id ?? '',
  file: null,
  issue_date: editingDocument?.issue_date ?? new Date().toISOString().split('T')[0],
  expiry_date: editingDocument?.expiry_date ?? '',
  duration_months: editingDocument?.duration_months ?? 12,
  notification_threshold_days: editingDocument?.notification_threshold_days ?? 30,
  notes: editingDocument?.notes ?? undefined,
});

export const SponsorDocumentForm: React.FC<SponsorDocumentFormProps> = ({
  sponsor,
  documentTypes,
  onSubmit,
  onUpdate,
  onCancel,
  editingDocument = null,
  isSubmitting,
  isLoadingTypes,
}) => {
  const [formData, setFormData] = useState(() =>
    buildInitialFormData(sponsor.id, editingDocument)
  );
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const isEditing = !!editingDocument;

  useEffect(() => {
    if (formData.issue_date && formData.document_type_id && !isEditing) {
      const issueDate = new Date(formData.issue_date);
      const expiryDate = new Date(issueDate);
      expiryDate.setMonth(expiryDate.getMonth() + (formData.duration_months ?? 12));

      setFormData((prev) => ({
        ...prev,
        expiry_date: expiryDate.toISOString().split('T')[0],
      }));
    }
  }, [formData.issue_date, formData.document_type_id, formData.duration_months, isEditing]);

  useEffect(() => {
    setFormData(buildInitialFormData(sponsor.id, editingDocument));
    setSelectedFileName(null);
  }, [editingDocument, sponsor.id]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isEditing && onUpdate) {
      const updatePayload: SponsorDocumentUpdatePayload = {
        id: editingDocument.id,
        issue_date: formData.issue_date,
        expiry_date: formData.expiry_date,
        duration_months: formData.duration_months,
        notification_threshold_days: formData.notification_threshold_days,
        notes: formData.notes,
      };
      await onUpdate(updatePayload);
    } else {
      if (!formData.file || !formData.document_type_id) {
        return;
      }
      await onSubmit(formData as SponsorDocumentFormData);
    }
  };

  const updateField = <K extends keyof typeof formData>(
    field: K,
    value: (typeof formData)[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, file }));
      setSelectedFileName(file.name);
    }
  };

  return (
    <div
      className="rounded-2xl border border-[#e2ceab] bg-white/90 p-5 shadow-[0_20px_40px_-30px_rgba(82,60,28,0.45)]"
      dir="rtl"
    >
      <h3 className="mb-4 text-lg font-semibold text-[#2f261b]">
        {isEditing ? 'تعديل مستند الكفيل' : 'إضافة مستند جديد للكفيل'}
      </h3>
      <p className="mb-4 text-sm text-[#6f5b40]">
        الكفيل: <span className="font-medium">{sponsor.name_ar}</span>
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isEditing && (
          <>
            <div className="space-y-2">
              <Label htmlFor="document_type_id">
                نوع المستند<span className="text-red-500">*</span>
              </Label>
              {isLoadingTypes ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select
                  value={formData.document_type_id}
                  onValueChange={(value) => updateField('document_type_id', value)}
                >
                  <SelectTrigger
                    id="document_type_id"
                    className="border-[#dcc49c] bg-[#fffdfa]"
                  >
                    <SelectValue placeholder="اختر نوع المستند" />
                  </SelectTrigger>
                  <SelectContent dir="rtl">
                    {documentTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name_ar}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">
                الملف<span className="text-red-500">*</span>
              </Label>
              <Input
                id="file"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                required={!isEditing}
                className="border-[#dcc49c] bg-[#fffdfa] file:ms-4 file:rounded-lg file:border-0 file:bg-[#e9b353] file:px-4 file:py-2 file:text-sm file:text-white file:hover:bg-[#deaa4f]"
              />
              {selectedFileName && (
                <p className="text-sm text-[#5a4830]">الملف المحدد: {selectedFileName}</p>
              )}
            </div>
          </>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="duration_months">المدة (بالأشهر)</Label>
            <Input
              id="duration_months"
              type="number"
              min="1"
              value={formData.duration_months ?? 12}
              onChange={(event) => {
                const parsedValue = Number.parseInt(event.target.value, 10);
                updateField('duration_months', Number.isNaN(parsedValue) ? 12 : parsedValue);
              }}
              className="border-[#dcc49c] bg-[#fffdfa]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notification_threshold_days">أيام التنبيه قبل الانتهاء</Label>
            <Input
              id="notification_threshold_days"
              type="number"
              min="1"
              value={formData.notification_threshold_days ?? 30}
              onChange={(event) => {
                const parsedValue = Number.parseInt(event.target.value, 10);
                updateField('notification_threshold_days', Number.isNaN(parsedValue) ? 30 : parsedValue);
              }}
              className="border-[#dcc49c] bg-[#fffdfa]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="issue_date">
              تاريخ الإصدار<span className="text-red-500">*</span>
            </Label>
            <Input
              id="issue_date"
              type="date"
              value={formData.issue_date}
              onChange={(event) => updateField('issue_date', event.target.value)}
              required
              className="border-[#dcc49c] bg-[#fffdfa]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiry_date">
              تاريخ الانتهاء<span className="text-red-500">*</span>
            </Label>
            <Input
              id="expiry_date"
              type="date"
              value={formData.expiry_date}
              onChange={(event) => updateField('expiry_date', event.target.value)}
              required
              className="border-[#dcc49c] bg-[#fffdfa]"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">ملاحظات</Label>
          <Input
            id="notes"
            value={formData.notes ?? ''}
            onChange={(event) => updateField('notes', event.target.value)}
            placeholder="أضف أي ملاحظات إضافية..."
            dir="rtl"
            className="border-[#dcc49c] bg-[#fffdfa]"
          />
        </div>

        <div className="flex gap-4 pt-4">
          <Button
            type="submit"
            className="flex-1 bg-[#e9b353] text-white hover:bg-[#deaa4f]"
            disabled={isSubmitting || (!isEditing && (!formData.file || !formData.document_type_id))}
          >
            {isSubmitting ? 'جاري الحفظ...' : 'حفظ'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1 border-[#cfb180] bg-white text-[#5a4830] hover:bg-[#fff4df]"
          >
            إلغاء
          </Button>
        </div>
      </form>
    </div>
  );
};
