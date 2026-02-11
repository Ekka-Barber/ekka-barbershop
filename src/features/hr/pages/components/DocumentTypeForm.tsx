import { useState } from 'react';

import type { DocumentTypeConfig } from '@shared/types/hr.types';
import { Button } from '@shared/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/ui/components/card';
import { Input } from '@shared/ui/components/input';
import { Label } from '@shared/ui/components/label';
import { Switch } from '@shared/ui/components/switch';

interface DocumentTypeFormProps {
  initialData?: Partial<DocumentTypeConfig>;
  onSubmit: (data: Omit<DocumentTypeConfig, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const COLOR_OPTIONS = [
  { value: 'emerald', label: 'أخضر', class: 'bg-emerald-500' },
  { value: 'blue', label: 'أزرق', class: 'bg-blue-500' },
  { value: 'amber', label: 'برتقالي', class: 'bg-amber-500' },
  { value: 'red', label: 'أحمر', class: 'bg-red-500' },
  { value: 'purple', label: 'بنفسجي', class: 'bg-purple-500' },
  { value: 'gray', label: 'رمادي', class: 'bg-gray-500' },
];

export const DocumentTypeForm: React.FC<DocumentTypeFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState({
    code: initialData?.code || '',
    name_ar: initialData?.name_ar || '',
    name_en: initialData?.name_en || '',
    default_duration_months: initialData?.default_duration_months || 12,
    notification_threshold_days: initialData?.notification_threshold_days || 30,
    is_active: initialData?.is_active ?? true,
    requires_document_number: initialData?.requires_document_number ?? true,
    color: initialData?.color || 'blue',
    display_order: initialData?.display_order || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateField = <K extends keyof typeof formData>(
    field: K,
    value: typeof formData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="border-[#e2ceab] bg-white/90" dir="rtl">
      <CardHeader className="border-b border-[#f0e2c8]">
        <CardTitle className="text-lg text-[#2f261b]">
          {initialData?.id ? 'تعديل نوع المستند' : 'إضافة نوع مستند جديد'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Code - readonly if editing */}
          <div className="space-y-2">
            <Label htmlFor="code">
              الكود (Code) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => updateField('code', e.target.value)}
              placeholder="مثال: health_certificate"
              disabled={!!initialData?.id}
              required
              dir="ltr"
              className="border-[#dcc49c] bg-[#fffdfa]"
            />
            <p className="text-xs text-[#7a684e]">
              كود فريد يستخدم في النظام (بدون مسافات، بالإنجليزية)
            </p>
          </div>

          {/* Arabic Name */}
          <div className="space-y-2">
            <Label htmlFor="name_ar">
              الاسم بالعربية <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name_ar"
              value={formData.name_ar}
              onChange={(e) => updateField('name_ar', e.target.value)}
              placeholder="مثال: الشهادة الصحية"
              required
              dir="rtl"
              className="border-[#dcc49c] bg-[#fffdfa]"
            />
          </div>

          {/* English Name */}
          <div className="space-y-2">
            <Label htmlFor="name_en">الاسم بالإنجليزية</Label>
            <Input
              id="name_en"
              value={formData.name_en}
              onChange={(e) => updateField('name_en', e.target.value)}
              placeholder="مثال: Health Certificate"
              dir="ltr"
              className="border-[#dcc49c] bg-[#fffdfa]"
            />
          </div>

          {/* Duration and Notification - Side by Side */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="default_duration_months">
                مدة الصلاحية الافتراضية (شهر)
              </Label>
              <Input
                id="default_duration_months"
                type="number"
                min={1}
                max={120}
                value={formData.default_duration_months}
                onChange={(e) =>
                  updateField('default_duration_months', parseInt(e.target.value) || 12)
                }
                className="border-[#dcc49c] bg-[#fffdfa]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notification_threshold_days">
                أيام التنبيه قبل الانتهاء
              </Label>
              <Input
                id="notification_threshold_days"
                type="number"
                min={1}
                max={365}
                value={formData.notification_threshold_days}
                onChange={(e) =>
                  updateField('notification_threshold_days', parseInt(e.target.value) || 30)
                }
                className="border-[#dcc49c] bg-[#fffdfa]"
              />
            </div>
          </div>

          {/* Color Selection */}
          <div className="space-y-2">
            <Label>اللون</Label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => updateField('color', color.value)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                    formData.color === color.value
                      ? 'border-[#e9b353] bg-[#fff8ea]'
                      : 'border-[#dcc49c] bg-white hover:bg-[#fffdfa]'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full ${color.class}`} />
                  <span className="text-sm">{color.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Display Order */}
          <div className="space-y-2">
            <Label htmlFor="display_order">ترتيب العرض</Label>
            <Input
              id="display_order"
              type="number"
              min={0}
              value={formData.display_order}
              onChange={(e) =>
                updateField('display_order', parseInt(e.target.value) || 0)
              }
              className="border-[#dcc49c] bg-[#fffdfa]"
            />
          </div>

          {/* Toggles */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="requires_document_number" className="cursor-pointer">
                يتطلب رقم المستند
              </Label>
              <Switch
                id="requires_document_number"
                checked={formData.requires_document_number}
                onCheckedChange={(checked) =>
                  updateField('requires_document_number', checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="is_active" className="cursor-pointer">
                نشط
              </Label>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => updateField('is_active', checked)}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t border-[#f0e2c8]">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#e9b353] text-white hover:bg-[#deaa4f]"
            >
              {isSubmitting
                ? 'جاري الحفظ...'
                : initialData?.id
                  ? 'حفظ التغييرات'
                  : 'إضافة نوع المستند'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="border-[#dcc49c] text-[#5a4830] hover:bg-[#fff8ea]"
            >
              إلغاء
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
