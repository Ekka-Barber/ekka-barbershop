import { useEffect, useState } from 'react';

import {
  useDocumentTypeMeta,
  useDocumentTypeOptions,
} from '@features/hr/hooks/useDocumentTypes';

import type {
  DocumentFormData,
  DocumentType,
  HRDocument,
  HREmployee,
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
import { Skeleton } from '@shared/ui/components/skeleton';

interface DocumentFormProps {
  employees: HREmployee[];
  onSubmit: (data: DocumentFormData) => Promise<void>;
  onCancel: () => void;
  editingDocument?: HRDocument | null;
  defaultEmployeeId?: string | null;
  isSubmitting: boolean;
}

const NO_EMPLOYEE_VALUE = '__no_employee__';

const buildInitialFormData = (
  editingDocument: HRDocument | null,
  defaultEmployeeId: string | null
): DocumentFormData => ({
  employee_id: editingDocument?.employee_id ?? defaultEmployeeId ?? '',
  document_type: editingDocument?.document_type ?? '',
  document_name: editingDocument?.document_name ?? '',
  document_number: editingDocument?.document_number ?? null,
  issue_date:
    editingDocument?.issue_date ?? new Date().toISOString().split('T')[0],
  expiry_date: editingDocument?.expiry_date ?? '',
  duration_months: editingDocument?.duration_months ?? 12,
  notes: editingDocument?.notes ?? null,
});

export const DocumentForm: React.FC<DocumentFormProps> = ({
  employees,
  onSubmit,
  onCancel,
  editingDocument = null,
  defaultEmployeeId = null,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState<DocumentFormData>(() =>
    buildInitialFormData(editingDocument, defaultEmployeeId)
  );

  const { options, isLoading: isLoadingTypes } = useDocumentTypeOptions();
  const { 
    defaultDurationMonths, 
    requiresDocumentNumber,
    nameAr,
  } = useDocumentTypeMeta(formData.document_type);

  // Auto-set document name when type changes
  useEffect(() => {
    if (formData.document_type && !editingDocument && !formData.document_name) {
      setFormData((prev) => ({
        ...prev,
        document_name: nameAr,
      }));
    }
  }, [formData.document_type, editingDocument, formData.document_name, nameAr]);

  // Auto-calculate expiry date when issue date or document type changes
  useEffect(() => {
    if (formData.issue_date && formData.document_type && !editingDocument) {
      const issueDate = new Date(formData.issue_date);
      const expiryDate = new Date(issueDate);
      expiryDate.setMonth(expiryDate.getMonth() + defaultDurationMonths);
      
      setFormData((prev) => ({
        ...prev,
        duration_months: defaultDurationMonths,
        expiry_date: expiryDate.toISOString().split('T')[0],
      }));
    }
  }, [formData.document_type, formData.issue_date, defaultDurationMonths, editingDocument]);

  useEffect(() => {
    setFormData(buildInitialFormData(editingDocument, defaultEmployeeId));
  }, [editingDocument, defaultEmployeeId]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formData.employee_id) {
      return;
    }

    const payload: DocumentFormData = {
      ...formData,
      document_name: formData.document_name.trim(),
      document_number: formData.document_number?.trim() || null,
      notes: formData.notes?.trim() || null,
      duration_months: formData.duration_months || 12,
    };

    await onSubmit(payload);
  };

  const updateField = <K extends keyof DocumentFormData>(
    field: K,
    value: DocumentFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTypeChange = (value: DocumentType) => {
    updateField('document_type', value);
    // Auto-set document name to the type name
    const typeName = options.find((opt) => opt.value === value)?.label || '';
    updateField('document_name', typeName);
  };

  return (
    <div
      className="rounded-2xl border border-[#e2ceab] bg-white/90 p-5 shadow-[0_20px_40px_-30px_rgba(82,60,28,0.45)]"
      dir="rtl"
    >
      <h3 className="mb-4 text-lg font-semibold">
        {editingDocument ? 'تعديل المستند' : 'إضافة مستند جديد'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="employee_id">
            الموظف<span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.employee_id || NO_EMPLOYEE_VALUE}
            onValueChange={(value) =>
              updateField(
                'employee_id',
                value === NO_EMPLOYEE_VALUE ? '' : value
              )
            }
          >
            <SelectTrigger
              id="employee_id"
              className="border-[#dcc49c] bg-[#fffdfa]"
            >
              <SelectValue placeholder="اختر الموظف" />
            </SelectTrigger>
            <SelectContent dir="rtl">
              <SelectItem value={NO_EMPLOYEE_VALUE}>اختر الموظف</SelectItem>
              {employees.map((employee) => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.name_ar || employee.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="document_type">
              نوع المستند<span className="text-red-500">*</span>
            </Label>
            {isLoadingTypes ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select
                value={formData.document_type}
                onValueChange={handleTypeChange}
              >
                <SelectTrigger
                  id="document_type"
                  className="border-[#dcc49c] bg-[#fffdfa]"
                >
                  <SelectValue placeholder="اختر نوع المستند" />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="document_name">
              اسم المستند<span className="text-red-500">*</span>
            </Label>
            <Input
              id="document_name"
              value={formData.document_name}
              onChange={(event) =>
                updateField('document_name', event.target.value)
              }
              required
              dir="rtl"
              className="border-[#dcc49c] bg-[#fffdfa]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {requiresDocumentNumber && (
            <div className="space-y-2">
              <Label htmlFor="document_number">رقم المستند</Label>
              <Input
                id="document_number"
                value={formData.document_number ?? ''}
                onChange={(event) =>
                  updateField('document_number', event.target.value)
                }
                dir="ltr"
                className="border-[#dcc49c] bg-[#fffdfa]"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="duration_months">المدة (بالأشهر)</Label>
            <Input
              id="duration_months"
              type="number"
              min="1"
              value={formData.duration_months ?? 12}
              onChange={(event) => {
                const parsedValue = Number.parseInt(event.target.value, 10);
                updateField(
                  'duration_months',
                  Number.isNaN(parsedValue) ? 12 : parsedValue
                );
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
              onChange={(event) =>
                updateField('issue_date', event.target.value)
              }
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
              onChange={(event) =>
                updateField('expiry_date', event.target.value)
              }
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
            onChange={(event) =>
              updateField('notes', event.target.value)
            }
            placeholder="أضف أي ملاحظات إضافية..."
            dir="rtl"
            className="border-[#dcc49c] bg-[#fffdfa]"
          />
        </div>

        <div className="flex gap-4 pt-4">
          <Button
            type="submit"
            className="flex-1 bg-[#e9b353] text-white hover:bg-[#deaa4f]"
            disabled={isSubmitting || !formData.employee_id}
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
