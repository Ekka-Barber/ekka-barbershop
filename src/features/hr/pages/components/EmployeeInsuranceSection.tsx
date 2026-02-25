import { HeartPulse, Plus, MapPin, Shield, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { useBranches } from '@shared/hooks/useBranches';
import { Badge } from '@shared/ui/components/badge';
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
import { Skeleton } from '@shared/ui/components/skeleton';

import {
  useEmployeeInsurance,
  useInsuranceCompanies,
  useInsuranceHospitals,
} from '../../hooks/useInsuranceManagement';

interface EmployeeInsuranceSectionProps {
  employeeId: string;
  branchId?: string | null;
  employeeName?: string;
}

export const EmployeeInsuranceSection: React.FC<EmployeeInsuranceSectionProps> = ({
  employeeId,
  branchId,
  employeeName,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');

  const {
    insuranceQuery,
    createInsurance,
    updateInsurance,
    deleteInsurance,
  } = useEmployeeInsurance(employeeId);

  const { companiesQuery } = useInsuranceCompanies();
  const { data: branches = [], isLoading: isLoadingBranches } = useBranches();

  const branch = branches.find(b => b.id === branchId);
  const branchCity = branch?.address || null;

  const { hospitalsQuery } = useInsuranceHospitals(selectedCompanyId, branchCity);

  const companies = companiesQuery.data ?? [];
  const hospitals = hospitalsQuery.data ?? [];
  const isLoadingCompanies = companiesQuery.isLoading;
  const isLoadingHospitals = hospitalsQuery.isLoading;

  const currentInsurance = insuranceQuery.data;

  const isLoading = insuranceQuery.isLoading || isLoadingCompanies || isLoadingHospitals || isLoadingBranches;

  const filteredHospitals = hospitals.filter(hospital => 
    !branchCity || hospital.city === branchCity
  );

  useEffect(() => {
    if (currentInsurance?.company_id) {
      setSelectedCompanyId(currentInsurance.company_id);
    }
  }, [currentInsurance]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const companyId = formData.get('company_id') as string;
    const expiryDate = formData.get('expiry_date') as string;

    if (!companyId || !expiryDate) return;

    const payload = {
      employee_id: employeeId,
      company_id: companyId,
      expiry_date: expiryDate,
    };

    try {
      if (currentInsurance) {
        await updateInsurance.mutateAsync({ id: currentInsurance.id, ...payload });
      } else {
        await createInsurance.mutateAsync(payload);
      }
      setShowForm(false);
    } catch (_error) {
      toast.error('فشل في حفظ التأمين');
    }
  };

  const handleDelete = async () => {
    if (!currentInsurance || !window.confirm('هل أنت متأكد من حذف التأمين الطبي لهذا الموظف؟')) return;
    try {
      await deleteInsurance.mutateAsync(currentInsurance.id);
    } catch (_error) {
      toast.error('فشل في حذف التأمين');
    }
  };

  const getInsuranceStatus = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysRemaining = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (daysRemaining < 0) return { status: 'منتهي', variant: 'destructive' as const };
    if (daysRemaining <= 30) return { status: 'ينتهي قريباً', variant: 'outline' as const };
    return { status: 'ساري', variant: 'default' as const };
  };

  if (isLoading) {
    return (
      <Card className="mt-4 border-[#e2ceab] bg-white/80" dir="rtl">
        <CardHeader className="border-b border-[#f0e2c8]">
          <CardTitle className="text-base">التأمين الطبي</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-3">
            <Skeleton className="h-4 w-32 bg-[#ead4ac]/55" />
            <Skeleton className="h-10 w-full bg-[#ead4ac]/45" />
            <Skeleton className="h-20 w-full bg-[#ead4ac]/40" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-4 border-[#e2ceab] bg-white/80" dir="rtl">
      <CardHeader className="border-b border-[#f0e2c8]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeartPulse className="h-5 w-5 text-[#e9b353]" />
            <CardTitle className="text-base">التأمين الطبي</CardTitle>
          </div>
          <div className="flex gap-2">
            {currentInsurance && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowForm(!showForm)}
                className="h-8 border-[#cfb180] text-[#5a4830]"
              >
                {showForm ? 'إغلاق التعديل' : 'تعديل التأمين'}
              </Button>
            )}
            {!currentInsurance && (
              <Button
                size="sm"
                onClick={() => setShowForm(!showForm)}
                className="h-8 bg-[#e9b353] text-white hover:bg-[#deaa4f]"
              >
                <Plus className="ms-1 h-3.5 w-3.5" />
                إضافة تأمين
              </Button>
            )}
          </div>
        </div>
        <CardDescription>
          {employeeName ? `إدارة التأمين الطبي للموظف ${employeeName}` : 'إدارة التأمين الطبي'}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4">
        {!currentInsurance && !showForm && (
          <div className="py-6 text-center">
            <Shield className="mx-auto mb-3 h-10 w-10 text-[#c9a66b]/60" />
            <p className="text-sm text-[#7a684e]">لا يوجد تأمين طبي مسجل لهذا الموظف</p>
            <Button
              onClick={() => setShowForm(true)}
              className="mt-3 bg-[#e9b353] text-white hover:bg-[#deaa4f]"
            >
              <Plus className="ms-2 h-4 w-4" />
              إضافة تأمين طبي
            </Button>
          </div>
        )}

        {currentInsurance && !showForm && (
          <div className="space-y-4">
            <div className="rounded-xl border border-[#ebdcc2] bg-white/80 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-[#e9b353]/20 p-2">
                    <HeartPulse className="h-5 w-5 text-[#9a6d2d]" />
                  </div>
                  <div>
                    <h4 className="font-medium text-[#3e3020]">{currentInsurance.company.name}</h4>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant={getInsuranceStatus(currentInsurance.expiry_date).variant}>
                        {getInsuranceStatus(currentInsurance.expiry_date).status}
                      </Badge>
                      <span className="text-sm text-[#78654c]">
                        ينتهي: {new Date(currentInsurance.expiry_date).toLocaleDateString('ar-SA')}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  className="h-8 text-red-600 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {branchCity && (
              <div className="rounded-xl border border-[#ebdcc2] bg-white/80 p-4">
                <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#3e3020]">
                  <MapPin className="h-4 w-4 text-[#e9b353]" />
                  المستشفيات المعتمدة في {branchCity}
                </h4>
                {filteredHospitals.length === 0 ? (
                  <p className="text-sm text-[#7a684e]">لا توجد مستشفيات معتمدة في هذه المدينة</p>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {filteredHospitals.slice(0, 4).map((hospital) => (
                      <div
                        key={hospital.id}
                        className="flex items-center justify-between rounded-lg border border-[#e8dcc4] bg-[#fffbf4] p-3"
                      >
                        <div>
                          <p className="font-medium text-[#3a3020]">{hospital.name}</p>
                          <Badge variant="outline" className="mt-1 border-[#d6c4a8] bg-[#fff8e8] text-[#6a5a40]">
                            <MapPin className="me-1 h-3 w-3" />
                            {hospital.city}
                          </Badge>
                        </div>
                        {hospital.google_maps_url && (
                          <a
                            href={hospital.google_maps_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-md p-1.5 text-[#2563eb] hover:bg-blue-50"
                          >
                            الخريطة
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company_id">
                شركة التأمين<span className="text-red-500">*</span>
              </Label>
              <Select
                name="company_id"
                value={selectedCompanyId}
                onValueChange={setSelectedCompanyId}
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
                name="expiry_date"
                type="date"
                defaultValue={currentInsurance?.expiry_date || ''}
                required
                dir="ltr"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-[#e9b353] text-white hover:bg-[#deaa4f]"
                disabled={createInsurance.isPending || updateInsurance.isPending}
              >
                {(createInsurance.isPending || updateInsurance.isPending) ? 'جاري الحفظ...' : 'حفظ'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
                className="flex-1 border-[#cfb180] bg-white text-[#5a4830] hover:bg-[#fff4df]"
              >
                إلغاء
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
};