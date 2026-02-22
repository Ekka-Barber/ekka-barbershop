import { useEffect, useState } from 'react';

import type { InsuranceCompany, InsuranceHospital } from '@shared/types/domains';
import { Button } from '@shared/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/components/card';
import { Input } from '@shared/ui/components/input';
import { Label } from '@shared/ui/components/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/ui/components/select';

export interface HospitalFormData {
  company_id: string;
  name: string;
  city: string;
  google_maps_url?: string;
}

interface HospitalFormProps {
  onSubmit: (data: HospitalFormData) => Promise<void>;
  onCancel: () => void;
  editingHospital?: InsuranceHospital | null;
  companies: InsuranceCompany[];
  cities: string[];
  defaultCompanyId?: string;
  isSubmitting: boolean;
}

const buildInitialFormData = (
  editingHospital: InsuranceHospital | null,
  defaultCompanyId?: string
): HospitalFormData => ({
  company_id: editingHospital?.company_id ?? defaultCompanyId ?? '',
  name: editingHospital?.name ?? '',
  city: editingHospital?.city ?? '',
  google_maps_url: editingHospital?.google_maps_url ?? '',
});

export const HospitalForm: React.FC<HospitalFormProps> = ({
  onSubmit,
  onCancel,
  editingHospital = null,
  companies,
  cities,
  defaultCompanyId,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState<HospitalFormData>(() =>
    buildInitialFormData(editingHospital, defaultCompanyId)
  );

  useEffect(() => {
    setFormData(buildInitialFormData(editingHospital, defaultCompanyId));
  }, [editingHospital, defaultCompanyId]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload: HospitalFormData = {
      company_id: formData.company_id,
      name: formData.name.trim(),
      city: formData.city,
      google_maps_url: formData.google_maps_url?.trim() || undefined,
    };

    await onSubmit(payload);
  };

  return (
    <Card className="overflow-hidden border-[#e2ceab] bg-white/90 shadow-[0_20px_40px_-30px_rgba(82,60,28,0.45)]" dir="rtl">
      <CardHeader className="border-b border-[#f0e2c8]">
        <CardTitle>{editingHospital ? 'تعديل المستشفى' : 'إضافة مستشفى جديد'}</CardTitle>
        <CardDescription>
          {editingHospital ? 'قم بتعديل بيانات المستشفى' : 'أدخل تفاصيل المستشفى الجديد'}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-5 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company_id">
              شركة التأمين<span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.company_id}
              onValueChange={(value) =>
                setFormData((prev: HospitalFormData) => ({ ...prev, company_id: value }))
              }
              required
            >
              <SelectTrigger className="border-[#dcc49c] bg-[#fffdfa]">
                <SelectValue placeholder="اختر شركة التأمين" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">
              اسم المستشفى<span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(event) =>
                setFormData((prev: HospitalFormData) => ({ ...prev, name: event.target.value }))
              }
              required
              dir="rtl"
              placeholder="مثال: مستشفى الملك فهد"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">
              المدينة<span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.city}
              onValueChange={(value) =>
                setFormData((prev: HospitalFormData) => ({ ...prev, city: value }))
              }
              required
            >
              <SelectTrigger className="border-[#dcc49c] bg-[#fffdfa]">
                <SelectValue placeholder="اختر المدينة" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="google_maps_url">رابط خرائط جوجل</Label>
            <Input
              id="google_maps_url"
              value={formData.google_maps_url ?? ''}
              onChange={(event) =>
                setFormData((prev: HospitalFormData) => ({
                  ...prev,
                  google_maps_url: event.target.value,
                }))
              }
              dir="ltr"
              placeholder="https://maps.google.com/..."
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
