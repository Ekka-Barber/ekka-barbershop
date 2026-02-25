import { Building2, Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import type { InsuranceCompany, InsuranceHospital } from '@shared/types/domains';
import { Button } from '@shared/ui/components/button';
import { Card, CardContent } from '@shared/ui/components/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@shared/ui/components/dialog';
import { Input } from '@shared/ui/components/input';

import {
  useBranchCities,
  useInsuranceCompanies,
  useInsuranceHospitals,
} from '../hooks/useInsuranceManagement';

import { HospitalForm } from './components/HospitalForm';
import type { HospitalFormData } from './components/HospitalForm';
import { InsuranceCompanyCard } from './components/InsuranceCompanyCard';
import { InsuranceCompanyForm } from './components/InsuranceCompanyForm';
import type { InsuranceCompanyFormData } from './components/InsuranceCompanyForm';

export const InsuranceManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState<InsuranceCompany | null>(null);
  const [showHospitalDialog, setShowHospitalDialog] = useState(false);
  const [editingHospital, setEditingHospital] = useState<InsuranceHospital | null>(null);
  const [hospitalCompanyId, setHospitalCompanyId] = useState<string | null>(null);

  const {
    companiesQuery,
    createCompany,
    updateCompany,
    deleteCompany,
  } = useInsuranceCompanies();

  const { hospitalsQuery, createHospital, updateHospital, deleteHospital } = useInsuranceHospitals();

  const { data: branchCities = [] } = useBranchCities();

  const companies = useMemo(() => companiesQuery.data ?? [], [companiesQuery.data]);
  const hospitals = useMemo(() => hospitalsQuery.data ?? [], [hospitalsQuery.data]);

  const filteredCompanies = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return companies;

    return companies.filter(
      (company) =>
        company.name.toLowerCase().includes(query) ||
        company.contact_phone?.toLowerCase().includes(query)
    );
  }, [companies, searchQuery]);

  const handleCompanySubmit = async (data: InsuranceCompanyFormData) => {
    try {
      if (editingCompany) {
        await updateCompany.mutateAsync({ id: editingCompany.id, ...data });
        toast.success('تم تحديث شركة التأمين بنجاح.');
      } else {
        await createCompany.mutateAsync(data);
        toast.success('تمت إضافة شركة التأمين بنجاح.');
      }
      setShowCompanyForm(false);
      setEditingCompany(null);
    } catch {
      toast.error('تعذر حفظ شركة التأمين.');
    }
  };

  const handleCompanyDelete = async (id: string) => {
    try {
      await deleteCompany.mutateAsync(id);
      toast.success('تم حذف شركة التأمين بنجاح.');
    } catch {
      toast.error('تعذر حذف شركة التأمين.');
    }
  };

  const handleHospitalSubmit = async (data: HospitalFormData) => {
    try {
      if (editingHospital) {
        await updateHospital.mutateAsync({ id: editingHospital.id, ...data });
        toast.success('تم تحديث المستشفى بنجاح.');
      } else {
        await createHospital.mutateAsync(data);
        toast.success('تمت إضافة المستشفى بنجاح.');
      }
      setShowHospitalDialog(false);
      setEditingHospital(null);
      setHospitalCompanyId(null);
    } catch {
      toast.error('تعذر حفظ المستشفى.');
    }
  };

  const handleHospitalDelete = async (id: string) => {
    try {
      await deleteHospital.mutateAsync(id);
      toast.success('تم حذف المستشفى بنجاح.');
    } catch {
      toast.error('تعذر حذف المستشفى.');
    }
  };

  const handleAddHospital = (companyId: string) => {
    setHospitalCompanyId(companyId);
    setEditingHospital(null);
    setShowHospitalDialog(true);
  };

  const handleEditHospital = (hospital: InsuranceHospital) => {
    setHospitalCompanyId(hospital.company_id);
    setEditingHospital(hospital);
    setShowHospitalDialog(true);
  };

  const handleEditCompany = (company: InsuranceCompany) => {
    setEditingCompany(company);
    setShowCompanyForm(true);
  };

  const handleAddCompany = () => {
    setEditingCompany(null);
    setShowCompanyForm(true);
  };

  const isSubmitting =
    createCompany.isPending ||
    updateCompany.isPending ||
    deleteCompany.isPending ||
    createHospital.isPending ||
    updateHospital.isPending ||
    deleteHospital.isPending;

  return (
    <div className="space-y-4">
      <Card className="border-[#e2ceab] bg-white/85 shadow-[0_18px_40px_-30px_rgba(80,60,30,0.5)]" dir="rtl">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute inset-y-0 start-3 my-auto h-4 w-4 text-[#92734a]" />
              <Input
                placeholder="ابحث باسم شركة التأمين أو رقم الهاتف..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="h-11 border-[#dcc49c] bg-[#fffdfa] ps-10"
                dir="rtl"
              />
            </div>

            <Button
              onClick={handleAddCompany}
              className="h-11 bg-[#e9b353] text-white hover:bg-[#deaa4f]"
            >
              <Plus className="ms-2 h-4 w-4" />
              إضافة شركة تأمين
            </Button>
          </div>
        </CardContent>
      </Card>

      {showCompanyForm && (
        <InsuranceCompanyForm
          onSubmit={handleCompanySubmit}
          onCancel={() => {
            setShowCompanyForm(false);
            setEditingCompany(null);
          }}
          editingCompany={editingCompany}
          isSubmitting={createCompany.isPending || updateCompany.isPending}
        />
      )}

      {filteredCompanies.length === 0 ? (
        <Card className="border-[#e2ceab] bg-white/80" dir="rtl">
          <CardContent className="py-12 text-center text-[#7a6b55]">
            <Building2 className="mx-auto mb-3 h-12 w-12 text-[#d6c4a8]" />
            <p className="text-lg font-medium">لا توجد شركات تأمين مسجلة</p>
            <p className="mt-1 text-sm">قم بإضافة شركة تأمين جديدة للبدء</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredCompanies.map((company) => (
            <InsuranceCompanyCard
              key={company.id}
              company={company}
              hospitals={hospitals}
              onEdit={handleEditCompany}
              onDelete={handleCompanyDelete}
              onAddHospital={handleAddHospital}
              onEditHospital={handleEditHospital}
              onDeleteHospital={handleHospitalDelete}
              isLoading={isSubmitting}
            />
          ))}
        </div>
      )}

      <Dialog open={showHospitalDialog} onOpenChange={(open) => !open && (setShowHospitalDialog(false), setEditingHospital(null), setHospitalCompanyId(null))}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-[#2f261b]">
              {editingHospital ? 'تعديل المستشفى' : 'إضافة مستشفى جديد'}
            </DialogTitle>
            <DialogDescription className="text-[#6f5b40]">
              {editingHospital ? 'قم بتعديل بيانات المستشفى' : 'أدخل تفاصيل المستشفى الجديد'}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            <HospitalForm
              onSubmit={handleHospitalSubmit}
              onCancel={() => {
                setShowHospitalDialog(false);
                setEditingHospital(null);
                setHospitalCompanyId(null);
              }}
              editingHospital={editingHospital}
              companies={companies}
              cities={branchCities}
              defaultCompanyId={hospitalCompanyId ?? undefined}
              isSubmitting={createHospital.isPending || updateHospital.isPending}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
