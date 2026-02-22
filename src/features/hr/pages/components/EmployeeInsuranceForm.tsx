import { useEffect, useState } from 'react';

import type { EmployeeInsuranceWithCompany, InsuranceCompany } from '@shared/types/domains';
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

export interface EmployeeInsuranceFormData {
  employee_id: string;
  company_id: string;
  expiry_date: string;
}

interface EmployeeInsuranceFormProps {
  onSubmit: (data: EmployeeInsuranceFormData) => Promise<void>;
  onCancel: () => void;
  employeeId: string;
  editingInsurance?: EmployeeInsuranceWithCompany | null;
  companies: InsuranceCompany[];
  isSubmitting: boolean;
}

const buildInitialFormData = (
  employeeId: string,
  editingInsurance: EmployeeInsuranceWithCompany | null
): EmployeeInsuranceFormData => ({
  employee_id: employeeId,
  company_id: editingInsurance?.company_id ?? '',
  expiry_date: editingInsurance?.expiry_date ?? '',
});

export const EmployeeInsuranceForm: React.FC<EmployeeInsuranceFormProps> = ({
  onSubmit,
  onCancel,
  employeeId,
  editingInsurance = null,
  companies,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState<EmployeeInsuranceFormData>(() =>
    buildInitialFormData(employeeId, editingInsurance)
  );

  useEffect(() => {
    setFormData(buildInitialFormData(employeeId, editingInsurance));
  }, [employeeId, editingInsurance]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload: EmployeeInsuranceFormData = {
      employee_id: formData.employee_id,
      company_id: formData.company_id,
      expiry_date: formData.expiry_date,
    };

    await onSubmit(payload);
  };

  return (
    <Card className="overflow-hidden border-[#e2ceab] bg-white/90 shadow-[0_20px_40px_-30px_rgba(82,60,28,0.45)]" dir="rtl">
      <CardHeader className="border-b border-[#f0e2c8]">
        <CardTitle>{editingInsurance ? 'تعديل التأمين الطبي' : 'إضافة تأمين طبي'}</CardTitle>
        <CardDescription>
          {editingInsurance ? 'قم بتعديل بيانات التأمين الطبي للموظف' : 'أدخل بيانات التأمين الطبي للموظف'}
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
                setFormData((prev: EmployeeInsuranceFormData) => ({ ...prev, company_id: value }))
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
            <Label htmlFor="expiry_date">
              تاريخ انتهاء التأمين<span className="text-red-500">*</span>
            </Label>
            <Input
              id="expiry_date"
              type="date"
              value={formData.expiry_date}
              onChange={(event) =>
                setFormData((prev: EmployeeInsuranceFormData) => ({
                  ...prev,
                  expiry_date: event.target.value,
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
