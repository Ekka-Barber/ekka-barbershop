import { useEffect, useState } from 'react';

import type { InsuranceCompany } from '@shared/types/domains';
import { Button } from '@shared/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/components/card';
import { Input } from '@shared/ui/components/input';
import { Label } from '@shared/ui/components/label';

export interface InsuranceCompanyFormData {
  name: string;
  contact_phone?: string;
}

interface InsuranceCompanyFormProps {
  onSubmit: (data: InsuranceCompanyFormData) => Promise<void>;
  onCancel: () => void;
  editingCompany?: InsuranceCompany | null;
  isSubmitting: boolean;
}

const buildInitialFormData = (editingCompany: InsuranceCompany | null): InsuranceCompanyFormData => ({
  name: editingCompany?.name ?? '',
  contact_phone: editingCompany?.contact_phone ?? '',
});

export const InsuranceCompanyForm: React.FC<InsuranceCompanyFormProps> = ({
  onSubmit,
  onCancel,
  editingCompany = null,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState<InsuranceCompanyFormData>(() =>
    buildInitialFormData(editingCompany)
  );

  useEffect(() => {
    setFormData(buildInitialFormData(editingCompany));
  }, [editingCompany]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload: InsuranceCompanyFormData = {
      name: formData.name.trim(),
      contact_phone: formData.contact_phone?.trim() || undefined,
    };

    await onSubmit(payload);
  };

  return (
    <Card className="overflow-hidden border-[#e2ceab] bg-white/90 shadow-[0_20px_40px_-30px_rgba(82,60,28,0.45)]" dir="rtl">
      <CardHeader className="border-b border-[#f0e2c8]">
        <CardTitle>{editingCompany ? 'تعديل شركة التأمين' : 'إضافة شركة تأمين جديدة'}</CardTitle>
        <CardDescription>
          {editingCompany ? 'قم بتعديل بيانات شركة التأمين' : 'أدخل تفاصيل شركة التأمين الجديدة'}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-5 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              اسم شركة التأمين<span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(event) =>
                setFormData((prev: InsuranceCompanyFormData) => ({ ...prev, name: event.target.value }))
              }
              required
              dir="rtl"
              placeholder="مثال: بوبا، التعاونية، ميدغلف"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_phone">رقم الهاتف</Label>
            <Input
              id="contact_phone"
              value={formData.contact_phone ?? ''}
              onChange={(event) =>
                setFormData((prev: InsuranceCompanyFormData) => ({
                  ...prev,
                  contact_phone: event.target.value,
                }))
              }
              dir="ltr"
              placeholder="920XXXXXX"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-[#e9b353] text-white hover:bg-[#deaa4f]"
              disabled={isSubmitting}
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
      </CardContent>
    </Card>
  );
};
