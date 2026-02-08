import { useEffect, useState } from 'react';

import type { HRSponsor, SponsorFormData } from '@shared/types/hr.types';
import { Button } from '@shared/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/components/card';
import { Input } from '@shared/ui/components/input';
import { Label } from '@shared/ui/components/label';

interface SponsorFormProps {
  onSubmit: (data: SponsorFormData) => Promise<void>;
  onCancel: () => void;
  editingSponsor?: HRSponsor | null;
  isSubmitting: boolean;
}

const buildInitialFormData = (editingSponsor: HRSponsor | null): SponsorFormData => ({
  name_ar: editingSponsor?.name_ar ?? '',
  cr_number: editingSponsor?.cr_number ?? '',
  unified_number: editingSponsor?.unified_number ?? '',
});

export const SponsorForm: React.FC<SponsorFormProps> = ({
  onSubmit,
  onCancel,
  editingSponsor = null,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState<SponsorFormData>(() =>
    buildInitialFormData(editingSponsor)
  );

  useEffect(() => {
    setFormData(buildInitialFormData(editingSponsor));
  }, [editingSponsor]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload: SponsorFormData = {
      name_ar: formData.name_ar.trim(),
      cr_number: formData.cr_number.trim(),
      unified_number: formData.unified_number.trim(),
    };

    await onSubmit(payload);
  };

  return (
    <Card className="overflow-hidden border-[#e2ceab] bg-white/90 shadow-[0_20px_40px_-30px_rgba(82,60,28,0.45)]">
      <CardHeader className="border-b border-[#f0e2c8]">
        <CardTitle>{editingSponsor ? 'تعديل بيانات الكفيل' : 'إضافة كفيل جديد'}</CardTitle>
        <CardDescription>
          {editingSponsor ? 'قم بتعديل بيانات الكفيل' : 'أدخل تفاصيل الكفيل الجديد'}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-5 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name_ar">
              اسم الكفيل (العربية)<span className="text-red-500">*</span>
            </Label>
            <Input
              id="name_ar"
              value={formData.name_ar}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, name_ar: event.target.value }))
              }
              required
              dir="rtl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cr_number">
              رقم السجل التجاري<span className="text-red-500">*</span>
            </Label>
            <Input
              id="cr_number"
              value={formData.cr_number}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, cr_number: event.target.value }))
              }
              required
              dir="ltr"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="unified_number">
              الرقم الموحد<span className="text-red-500">*</span>
            </Label>
            <Input
              id="unified_number"
              value={formData.unified_number}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  unified_number: event.target.value,
                }))
              }
              required
              dir="ltr"
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
