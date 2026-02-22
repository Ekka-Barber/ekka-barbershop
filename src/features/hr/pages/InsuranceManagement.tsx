import { ArrowRight, Building2, FileClock, HeartPulse, Phone, Plus, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import type { InsuranceCompany, InsuranceHospital } from '@shared/types/domains';
import { Badge } from '@shared/ui/components/badge';
import { Button } from '@shared/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/components/card';
import { Input } from '@shared/ui/components/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@shared/ui/components/dialog';

import {
  useBranchCities,
  useInsuranceCompanies,
  useInsuranceHospitals,
} from '../hooks/useInsuranceManagement';

import type { InsuranceCompanyFormData } from './components/InsuranceCompanyForm';
import { InsuranceCompanyForm } from './components/InsuranceCompanyForm';
import { InsuranceCompaniesTable } from './components/InsuranceCompaniesTable';
import type { HospitalFormData } from './components/HospitalForm';
import { HospitalForm } from './components/HospitalForm';
import { HospitalTable } from './components/HospitalTable';

export const InsuranceManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState<InsuranceCompany | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<InsuranceCompany | null>(null);
  const [showHospitalForm, setShowHospitalForm] = useState(false);
  const [editingHospital, setEditingHospital] = useState<InsuranceHospital | null>(null);

  const {
    companiesQuery,
    createCompany,
    updateCompany,
    deleteCompany,
  } = useInsuranceCompanies();

  const { hospitalsQuery, createHospital, updateHospital, deleteHospital } = useInsuranceHospitals(
    selectedCompany?.id
  );

  const { data: branchCities = [] } = useBranchCities();

  const companies = companiesQuery.data ?? [];
  const hospitals = hospitalsQuery.data ?? [];

  const filteredCompanies = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return companies;

    return companies.filter(
      (company) =>
        company.name.toLowerCase().includes(query) ||
        company.contact_phone?.toLowerCase().includes(query)
    );
  }, [companies, searchQuery]);

  useEffect(() => {
    if (!selectedCompany) return;

    setEditingHospital(null);
    setShowHospitalForm(false);
  }, [selectedCompany]);

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
      if (selectedCompany?.id === id) {
        setSelectedCompany(null);
      }
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
      setShowHospitalForm(false);
      setEditingHospital(null);
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

  const handleViewHospitals = (company: InsuranceCompany) => {
    setSelectedCompany(company);
  };

  const handleEditCompany = (company: InsuranceCompany) => {
    setEditingCompany(company);
    setShowCompanyForm(true);
  };

  const handleAddCompany = () => {
    setEditingCompany(null);
    setShowCompanyForm(true);
  };

  const handleEditHospital = (hospital: InsuranceHospital) => {
    setEditingHospital(hospital);
    setShowHospitalForm(true);
  };

  const handleAddHospital = () => {
    setEditingHospital(null);
    setShowHospitalForm(true);
  };

  const handleCloseHospitalDialog = () => {
    setSelectedCompany(null);
    setShowHospitalForm(false);
    setEditingHospital(null);
  };

  const isCompanyLoading = companiesQuery.isLoading;
  const isHospitalLoading = hospitalsQuery.isLoading;
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

      <InsuranceCompaniesTable
        companies={filteredCompanies}
        onEdit={handleEditCompany}
        onDelete={handleCompanyDelete}
        onViewHospitals={handleViewHospitals}
        isLoading={isCompanyLoading || isSubmitting}
      />

      <Dialog open={!!selectedCompany} onOpenChange={(open) => !open && handleCloseHospitalDialog()}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#2f261b]">
              <HeartPulse className="h-5 w-5 text-[#e9b353]" />
              مستشفيات {selectedCompany?.name}
            </DialogTitle>
            <DialogDescription className="text-[#6f5b40]">
              إدارة المستشفيات المعتمدة لشركة {selectedCompany?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            {selectedCompany?.contact_phone && (
              <div className="flex items-center gap-2 rounded-lg border border-[#e8dcc4] bg-[#fffbf4] p-3">
                <Phone className="h-4 w-4 text-[#e9b353]" />
                <span className="text-sm text-[#5a4a30]">رقم الهاتف:</span>
                <span className="font-medium text-[#3a3020]" dir="ltr">
                  {selectedCompany.contact_phone}
                </span>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                onClick={handleAddHospital}
                className="h-10 bg-[#e9b353] text-white hover:bg-[#deaa4f]"
              >
                <Plus className="ms-2 h-4 w-4" />
                إضافة مستشفى
              </Button>
            </div>

            {showHospitalForm && (
              <HospitalForm
                onSubmit={handleHospitalSubmit}
                onCancel={() => {
                  setShowHospitalForm(false);
                  setEditingHospital(null);
                }}
                editingHospital={editingHospital}
                companies={companies}
                cities={branchCities}
                defaultCompanyId={selectedCompany?.id}
                isSubmitting={createHospital.isPending || updateHospital.isPending}
              />
            )}

            <HospitalTable
              hospitals={hospitals}
              onEdit={handleEditHospital}
              onDelete={handleHospitalDelete}
              isLoading={isHospitalLoading || isSubmitting}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
