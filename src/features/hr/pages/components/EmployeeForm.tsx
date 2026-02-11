import { useEffect, useState } from 'react';

import type {
  EmployeeFormData,
  EmployeeRole,
  HRBranchOption,
  HREmployee,
  HRSponsor,
} from '@shared/types/hr.types';
import { Avatar } from '@shared/ui/components/avatar';
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

interface EmployeeFormProps {
  branches: HRBranchOption[];
  sponsors: HRSponsor[];
  onSubmit: (data: EmployeeFormData) => Promise<void>;
  onCancel: () => void;
  editingEmployee?: HREmployee | null;
  isSubmitting: boolean;
}

const NO_BRANCH_VALUE = '__no_branch__';
const NO_SPONSOR_VALUE = '__no_sponsor__';

const ROLE_OPTIONS: Array<{ value: EmployeeRole; label: string }> = [
  { value: 'manager', label: 'مدير' },
  { value: 'barber', label: 'حلاق' },
  { value: 'receptionist', label: 'استقبال' },
  { value: 'cleaner', label: 'تنظيف' },
  { value: 'massage_therapist', label: 'معالج مساج' },
  { value: 'hammam_specialist', label: 'متخصص حمام' },
];

const buildInitialFormData = (editingEmployee: HREmployee | null): EmployeeFormData => ({
  name: editingEmployee?.name ?? '',
  name_ar: editingEmployee?.name_ar ?? '',
  branch_id: editingEmployee?.branch_id ?? null,
  email: editingEmployee?.email ?? '',
  role: editingEmployee?.role ?? 'barber',
  nationality: editingEmployee?.nationality ?? '',
  off_days: editingEmployee?.off_days ?? [],
  photo_url: editingEmployee?.photo_url ?? '',
  start_date: editingEmployee?.start_date ?? '',
  end_date: editingEmployee?.end_date ?? '',
  is_archived: editingEmployee?.is_archived ?? false,
  annual_leave_quota: editingEmployee?.annual_leave_quota ?? 21,
  sponsor_id: editingEmployee?.sponsor_id ?? null,
});

export const EmployeeForm: React.FC<EmployeeFormProps> = ({
  branches,
  sponsors,
  onSubmit,
  onCancel,
  editingEmployee = null,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState<EmployeeFormData>(() =>
    buildInitialFormData(editingEmployee)
  );
  const photoPreviewUrl = formData.photo_url?.trim() || undefined;
  const photoPreviewName = formData.name_ar?.trim() || formData.name.trim() || 'الموظف';

  useEffect(() => {
    setFormData(buildInitialFormData(editingEmployee));
  }, [editingEmployee]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload: EmployeeFormData = {
      ...formData,
      name: formData.name.trim(),
      name_ar: formData.name_ar?.trim() || null,
      branch_id: formData.branch_id || null,
      email: formData.email?.trim() || null,
      nationality: formData.nationality?.trim() || null,
      off_days: formData.off_days?.length ? formData.off_days : null,
      photo_url: formData.photo_url?.trim() || null,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      sponsor_id: formData.sponsor_id || null,
      annual_leave_quota: formData.annual_leave_quota ?? 21,
      is_archived: formData.is_archived ?? false,
    };

    await onSubmit(payload);
  };

  return (
    <Card className="overflow-hidden border-[#e2ceab] bg-white/90 shadow-[0_20px_40px_-30px_rgba(82,60,28,0.45)]" dir="rtl">
      <CardHeader className="border-b border-[#f0e2c8]">
        <CardTitle>{editingEmployee ? 'تعديل معلومات الموظف' : 'إضافة موظف جديد'}</CardTitle>
        <CardDescription>
          {editingEmployee ? 'قم بتعديل معلومات الموظف' : 'أدخل تفاصيل الموظف الجديد'}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-5 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name_ar">
                الاسم (العربية)<span className="text-red-500">*</span>
              </Label>
              <Input
                id="name_ar"
                value={formData.name_ar ?? ''}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, name_ar: event.target.value }))
                }
                required
                dir="rtl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">
                الاسم (الإنجليزية)<span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, name: event.target.value }))
                }
                required
                dir="ltr"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="branch_id">الفرع</Label>
              <Select
                value={formData.branch_id ?? NO_BRANCH_VALUE}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    branch_id: value === NO_BRANCH_VALUE ? null : value,
                  }))
                }
              >
                <SelectTrigger id="branch_id" className="border-[#dcc49c] bg-[#fffdfa]">
                  <SelectValue placeholder="اختر الفرع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_BRANCH_VALUE}>بدون فرع</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name_ar || branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                value={formData.email ?? ''}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, email: event.target.value }))
                }
                dir="ltr"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">
                الدور<span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, role: value as EmployeeRole }))
                }
              >
                <SelectTrigger id="role" className="border-[#dcc49c] bg-[#fffdfa]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  {ROLE_OPTIONS.map((roleOption) => (
                    <SelectItem key={roleOption.value} value={roleOption.value}>
                      {roleOption.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nationality">الجنسية</Label>
              <Input
                id="nationality"
                value={formData.nationality ?? ''}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, nationality: event.target.value }))
                }
                dir="rtl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_date">تاريخ البدء</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date ?? ''}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, start_date: event.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">تاريخ الانتهاء</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date ?? ''}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, end_date: event.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="annual_leave_quota">مخصص الإجازة السنوية</Label>
              <Input
                id="annual_leave_quota"
                type="number"
                min="0"
                value={formData.annual_leave_quota ?? 21}
                onChange={(event) => {
                  const parsedValue = Number.parseInt(event.target.value, 10);
                  setFormData((prev) => ({
                    ...prev,
                    annual_leave_quota: Number.isNaN(parsedValue)
                      ? 0
                      : parsedValue,
                  }));
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sponsor_id">الكفيل</Label>
              <Select
                value={formData.sponsor_id ?? NO_SPONSOR_VALUE}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    sponsor_id: value === NO_SPONSOR_VALUE ? null : value,
                  }))
                }
              >
                <SelectTrigger id="sponsor_id" className="border-[#dcc49c] bg-[#fffdfa]">
                  <SelectValue placeholder="اختر الكفيل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_SPONSOR_VALUE}>بدون كفيل</SelectItem>
                  {sponsors.map((sponsor) => (
                    <SelectItem key={sponsor.id} value={sponsor.id}>
                      {sponsor.name_ar}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="off_days">أيام الإجازة الأسبوعية</Label>
            <Input
              id="off_days"
              placeholder="مثال: الجمعة, السبت"
              value={formData.off_days?.join(', ') ?? ''}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  off_days: event.target.value
                    .split(',')
                    .map((day) => day.trim())
                    .filter(Boolean),
                }))
              }
              dir="rtl"
            />
            <p className="text-xs text-muted-foreground">
              أدخل أيام الإجازة مفصولة بفواصل.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 rounded-2xl border border-[#ecd8b4] bg-[#fffaf2] p-4 md:grid-cols-[1fr_auto] md:items-end">
            <div className="space-y-2">
              <Label htmlFor="photo_url">رابط الصورة الشخصية (اختياري)</Label>
              <Input
                id="photo_url"
                type="url"
                value={formData.photo_url ?? ''}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, photo_url: event.target.value }))
                }
                placeholder="https://example.com/employee-photo.jpg"
                dir="ltr"
              />
              <p className="text-xs text-[#7a684e]">
                أضف رابط صورة مباشرة ليتم عرضها في بطاقة الموظف داخل القائمة.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-[#e5cc9e] bg-white px-3 py-2">
              {photoPreviewUrl ? (
                <img
                  src={photoPreviewUrl}
                  alt={`معاينة صورة ${photoPreviewName}`}
                  className="h-12 w-12 rounded-[22%] border border-[#e5cc9e] object-cover shadow-[0_4px_12px_rgba(233,179,83,0.4)]"
                />
              ) : (
                <Avatar
                  name={photoPreviewName}
                  size={48}
                  className="h-12 w-12 border border-[#e5cc9e]"
                />
              )}
              <div className="text-sm">
                <p className="font-medium text-[#2f261b]">
                  {photoPreviewUrl ? 'معاينة الصورة الشخصية' : 'لم يتم إدخال صورة بعد'}
                </p>
                <p className="text-xs text-[#7a684e]">يفضل استخدام صورة واضحة للوجه</p>
              </div>
            </div>
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
