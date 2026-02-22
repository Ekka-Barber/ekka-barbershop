import {
  AlertTriangle,
  Archive,
  FileClock,
  FileText,
  HeartPulse,
  Search,
  ShieldCheck,
  UserPlus,
  Users,
  FileCheck,
} from 'lucide-react';
import { useEffect, useMemo, useState, useTransition } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

import { useBranches } from '@shared/hooks/useBranches';
import { motion, useReducedMotion } from '@shared/lib/motion';
import type { SponsorDocumentWithStatus } from '@shared/types/domains';
import type {
  DocumentFormData,
  DocumentUpdatePayload,
  EmployeeFormData,
  EmployeeUpdatePayload,
  HRBranchOption,
  HRDocument,
  HREmployee,
  HRSponsor,
  SponsorFormData,
  SponsorUpdatePayload,
} from '@shared/types/hr.types';
import { Badge } from '@shared/ui/components/badge';
import { Button } from '@shared/ui/components/button';
import { Card, CardContent } from '@shared/ui/components/card';
import { Input } from '@shared/ui/components/input';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@shared/ui/components/tabs';

import {
  useDocumentManagement,
  useEmployeeManagement,
  useSponsorManagement,
} from '../hooks/useHRManagement';
import { useExpiringInsurance } from '../hooks/useInsuranceManagement';
import {
  useExpiringSponsorDocuments,
  useSponsorDocumentTypes,
  useSponsorDocumentsWithStatus,
} from '../hooks/useSponsorDocuments';
import type { SponsorDocumentFormData } from '../hooks/useSponsorDocuments';

import { DocumentForm } from './components/DocumentForm';
import { DocumentList } from './components/DocumentList';
import { EmployeeForm } from './components/EmployeeForm';
import { EmployeeTable } from './components/EmployeeTable';
import { SponsorForm } from './components/SponsorForm';
import { SponsorTable } from './components/SponsorTable';
import { DocumentTypesSettings } from './DocumentTypesSettings';
import { InsuranceManagement } from './InsuranceManagement';

type HRTab = 'employees' | 'documents' | 'sponsors' | 'insurance' | 'settings';

const isHRTab = (value: string | null): value is HRTab => {
  return value === 'employees' || value === 'documents' || value === 'sponsors' || value === 'insurance' || value === 'settings';
};

const getActiveTab = (tab: string | null): HRTab => {
  if (isHRTab(tab)) {
    return tab;
  }

  return 'employees';
};

const normalizeSearchText = (text: string) => text.trim().toLowerCase();

const getDaysUntil = (dateValue: string) => {
  const today = new Date();
  const targetDate = new Date(dateValue);
  return Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

export const HRManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [_isPending, startTransition] = useTransition();

  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [showDocumentForm, setShowDocumentForm] = useState(false);
  const [showSponsorForm, setShowSponsorForm] = useState(false);
  const [showArchivedEmployees, setShowArchivedEmployees] = useState(false);

  const [editingEmployee, setEditingEmployee] = useState<HREmployee | null>(null);
  const [editingDocument, setEditingDocument] = useState<HRDocument | null>(null);
  const [editingSponsor, setEditingSponsor] = useState<HRSponsor | null>(null);
  const [documentDefaultEmployeeId, setDocumentDefaultEmployeeId] = useState<string | null>(null);

  const [employeeSearch, setEmployeeSearch] = useState('');
  const [sponsorSearch, setSponsorSearch] = useState('');
  const shouldReduceMotion = useReducedMotion();

  const activeTab = getActiveTab(searchParams.get('tab'));

  useEffect(() => {
    const currentTab = searchParams.get('tab');
    if (isHRTab(currentTab)) {
      return;
    }

    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set('tab', 'employees');
    setSearchParams(nextSearchParams, { replace: true });
  }, [searchParams, setSearchParams]);

  const { data: branchData = [] } = useBranches();
  const branches = branchData as HRBranchOption[];

  const {
    employeesQuery,
    archivedQuery,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    restoreEmployee,
  } = useEmployeeManagement();

  const {
    documentsQuery,
    createDocument,
    updateDocument,
    deleteDocument,
  } = useDocumentManagement();

  const {
    sponsorsQuery,
    createSponsor,
    updateSponsor,
    deleteSponsor,
  } = useSponsorManagement();

  const { expiringQuery: expiringInsuranceQuery } = useExpiringInsurance(30);
  const { data: expiringSponsorDocs = [] } = useExpiringSponsorDocuments(30);

  const { data: sponsorDocTypes = [] } = useSponsorDocumentTypes();
  const {
    documentsQuery: sponsorDocsQuery,
    createDocument: createSponsorDoc,
    deleteDocument: deleteSponsorDoc,
  } = useSponsorDocumentsWithStatus();

  const employees = useMemo(() => employeesQuery.data ?? [], [employeesQuery.data]);
  const archivedEmployees = useMemo(
    () => archivedQuery.data ?? [],
    [archivedQuery.data]
  );
  const documents = useMemo(() => documentsQuery.data ?? [], [documentsQuery.data]);
  const sponsors = useMemo(() => sponsorsQuery.data ?? [], [sponsorsQuery.data]);

  const allEmployees = useMemo(
    () => [...employees, ...archivedEmployees],
    [employees, archivedEmployees]
  );

  const filteredEmployees = useMemo(() => {
    const query = normalizeSearchText(employeeSearch);
    const sourceEmployees = showArchivedEmployees ? allEmployees : employees;

    if (!query) {
      return sourceEmployees;
    }

    return sourceEmployees.filter((employee) => {
      const searchableValues = [employee.name, employee.name_ar ?? '', employee.email ?? ''];
      return searchableValues.some((value) => normalizeSearchText(value).includes(query));
    });
  }, [allEmployees, employeeSearch, employees, showArchivedEmployees]);

  const activeEmployeeIds = useMemo(() => {
    return new Set(employees.map((employee) => employee.id));
  }, [employees]);

  const visibleDocuments = useMemo(() => {
    return documents.filter((document) => activeEmployeeIds.has(document.employee_id));
  }, [documents, activeEmployeeIds]);

  const filteredSponsors = useMemo(() => {
    const query = normalizeSearchText(sponsorSearch);
    if (!query) {
      return sponsors;
    }

    return sponsors.filter((sponsor) => {
      const searchableValues = [
        sponsor.name_ar,
        sponsor.cr_number,
        sponsor.unified_number,
      ];
      return searchableValues.some((value) => normalizeSearchText(value).includes(query));
    });
  }, [sponsorSearch, sponsors]);

  const expiringDocumentsCount = useMemo(() => {
    return visibleDocuments.filter((document) => {
      const remainingDays = getDaysUntil(document.expiry_date);
      return remainingDays > 0 && remainingDays <= 30;
    }).length;
  }, [visibleDocuments]);

  const expiredDocumentsCount = useMemo(() => {
    return visibleDocuments.filter((document) => getDaysUntil(document.expiry_date) < 0).length;
  }, [visibleDocuments]);

  const isEmployeeLoading =
    employeesQuery.isLoading || archivedQuery.isLoading || restoreEmployee.isPending;

  const isDocumentLoading = documentsQuery.isLoading;
  const isSponsorLoading = sponsorsQuery.isLoading;

const handleTabChange = (nextTab: string) => {
    if (!isHRTab(nextTab)) {
      return;
    }

    startTransition(() => {
      const nextSearchParams = new URLSearchParams(searchParams);
      nextSearchParams.set('tab', nextTab);
      setSearchParams(nextSearchParams, { replace: true });
    });
  };

  const handleEmployeeSubmit = async (data: EmployeeFormData) => {
    try {
      if (editingEmployee) {
        const payload: EmployeeUpdatePayload = {
          ...data,
          id: editingEmployee.id,
        };

        await updateEmployee.mutateAsync(payload);
        toast.success('تم تحديث بيانات الموظف بنجاح.');
      } else {
        await createEmployee.mutateAsync(data);
        toast.success('تمت إضافة الموظف بنجاح.');
      }

      setShowEmployeeForm(false);
      setEditingEmployee(null);
    } catch {
      toast.error('تعذر حفظ بيانات الموظف.');
    }
  };

  const handleDocumentSubmit = async (data: DocumentFormData) => {
    try {
      if (editingDocument) {
        const payload: DocumentUpdatePayload = {
          ...data,
          id: editingDocument.id,
        };

        await updateDocument.mutateAsync(payload);
        toast.success('تم تحديث المستند بنجاح.');
      } else {
        await createDocument.mutateAsync(data);
        toast.success('تمت إضافة المستند بنجاح.');
      }

      setShowDocumentForm(false);
      setEditingDocument(null);
      setDocumentDefaultEmployeeId(null);
    } catch {
      toast.error('تعذر حفظ بيانات المستند.');
    }
  };

  const handleSponsorSubmit = async (data: SponsorFormData) => {
    try {
      if (editingSponsor) {
        const payload: SponsorUpdatePayload = {
          ...data,
          id: editingSponsor.id,
        };

        await updateSponsor.mutateAsync(payload);
        toast.success('تم تحديث بيانات الكفيل بنجاح.');
      } else {
        await createSponsor.mutateAsync(data);
        toast.success('تمت إضافة الكفيل بنجاح.');
      }

      setShowSponsorForm(false);
      setEditingSponsor(null);
    } catch {
      toast.error('تعذر حفظ بيانات الكفيل.');
    }
  };

  const handleEmployeeDelete = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من أرشفة هذا الموظف؟')) {
      return;
    }

    try {
      await deleteEmployee.mutateAsync(id);
      toast.success('تمت أرشفة الموظف بنجاح.');
    } catch {
      toast.error('تعذرت أرشفة الموظف.');
    }
  };

  const handleEmployeeRestore = async (id: string) => {
    try {
      await restoreEmployee.mutateAsync(id);
      toast.success('تمت استعادة الموظف بنجاح.');
    } catch {
      toast.error('تعذرت استعادة الموظف.');
    }
  };

  const handleDocumentDelete = async (id: string) => {
    try {
      await deleteDocument.mutateAsync(id);
      toast.success('تم حذف المستند بنجاح.');
    } catch {
      toast.error('تعذر حذف المستند.');
    }
  };

  const handleInlineDocumentUpdate = async (document: HRDocument) => {
    try {
      const { id, created_at: _created_at, updated_at: _updated_at, ...payload } = document;
      await updateDocument.mutateAsync({
        id,
        ...payload,
      });
      toast.success('تم تحديث المستند بنجاح.');
    } catch {
      toast.error('تعذر تحديث المستند.');
      throw new Error('DOCUMENT_UPDATE_FAILED');
    }
  };

  const handleAddDocumentForEmployee = (employeeId: string) => {
    setEditingDocument(null);
    setDocumentDefaultEmployeeId(employeeId);
    setShowDocumentForm(true);
  };

  const handleSponsorDelete = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الكفيل؟')) {
      return;
    }

    try {
      await deleteSponsor.mutateAsync(id);
      toast.success('تم حذف الكفيل بنجاح.');
    } catch {
      toast.error('تعذر حذف الكفيل.');
    }
  };

  const handleSponsorDocUpload = async (sponsorId: string, formData: FormData) => {
    try {
      const docFormData: SponsorDocumentFormData = {
        sponsor_id: sponsorId,
        document_type_id: formData.get('document_type_id') as string,
        file: formData.get('file') as File,
        issue_date: formData.get('issue_date') as string,
        expiry_date: formData.get('expiry_date') as string,
        duration_months: Number(formData.get('duration_months')) || 12,
      };
      await createSponsorDoc.mutateAsync(docFormData);
      toast.success('تم رفع المستند بنجاح.');
    } catch {
      toast.error('تعذر رفع المستند.');
    }
  };

  const handleSponsorDocDelete = async (doc: SponsorDocumentWithStatus) => {
    try {
      await deleteSponsorDoc.mutateAsync(doc);
      toast.success('تم حذف المستند بنجاح.');
    } catch {
      toast.error('تعذر حذف المستند.');
    }
  };

  const summaryCards: Array<{
    id: string;
    label: string;
    value: number;
    icon: React.ComponentType<{ className?: string }>;
    tone: string;
  }> = [
    {
      id: 'active-employees',
      label: 'الموظفون النشطون',
      value: employees.length,
      icon: Users,
      tone: 'from-[#fff3db] to-[#fff9ef] text-[#7a5621]',
    },
    {
      id: 'archived-employees',
      label: 'الموظفون المؤرشفون',
      value: archivedEmployees.length,
      icon: Archive,
      tone: 'from-[#f4efe7] to-[#fffaf2] text-[#64513a]',
    },
    {
      id: 'expiring-documents',
      label: 'تنتهي خلال 30 يوما',
      value: expiringDocumentsCount,
      icon: FileClock,
      tone: 'from-[#eef9f6] to-[#f6fffc] text-[#1f6d60]',
    },
    {
      id: 'expired-documents',
      label: 'مستندات منتهية',
      value: expiredDocumentsCount,
      icon: AlertTriangle,
      tone: 'from-[#fff0ed] to-[#fff8f6] text-[#a73f2f]',
    },
    {
      id: 'sponsors-count',
      label: 'عدد الكفلاء',
      value: sponsors.length,
      icon: ShieldCheck,
      tone: 'from-[#eef4ff] to-[#f9fbff] text-[#2d4f8f]',
    },
    {
      id: 'expiring-insurance',
      label: 'تأمين ينتهي خلال 30 يوما',
      value: expiringInsuranceQuery.data?.length ?? 0,
      icon: HeartPulse,
      tone: 'from-[#fce7f3] to-[#fdf2f8] text-[#be185d]',
    },
    {
      id: 'expiring-sponsor-docs',
      label: 'مستندات كفلاء تنتهي قريبا',
      value: expiringSponsorDocs.length,
      icon: FileCheck,
      tone: 'from-[#e0f2fe] to-[#f0f9ff] text-[#0369a1]',
    },
  ];

  return (
    <div className="page-stack pb-2">
      <Card className="overflow-hidden border-[#e2cba2] bg-white/85 shadow-[0_24px_48px_-30px_rgba(84,57,24,0.45)]" dir="rtl">
        <CardContent className="relative p-6 sm:p-7">
          <div className="pointer-events-none absolute -top-20 start-0 h-44 w-44 rounded-full bg-[#e9b353]/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 end-0 h-56 w-56 rounded-full bg-[#0f766e]/12 blur-3xl" />

          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="relative z-10 flex flex-col gap-5"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="mb-1 text-xs font-semibold tracking-[0.25em] text-[#9a6d2d]">
                  منصة إيكا للموارد البشرية
                </p>
                <h1 className="text-2xl font-semibold leading-tight text-[#2f261b] sm:text-3xl">
                  إدارة الموارد البشرية
                </h1>
                <p className="mt-2 text-sm leading-6 text-[#6f5b40] sm:text-base">
                  منصة موحدة لمتابعة الموظفين والمستندات والكفلاء مع تجربة عربية محسنة.
                </p>
              </div>

              <Badge className="self-start rounded-2xl border border-[#d6bf98] bg-[#fff8ea] px-3 py-2 text-sm text-[#5e4a2f] hover:bg-[#fff8ea]">
                مؤشرات مباشرة لجميع البيانات
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-7">
              {summaryCards.map((card, index) => {
                const CardIcon = card.icon;

                return (
                  <motion.div
                    key={card.id}
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.28,
                      delay: shouldReduceMotion ? 0 : index * 0.05,
                      ease: 'easeOut',
                    }}
                    className={`rounded-2xl border border-[#ecd9b7] bg-gradient-to-br p-4 transition-transform duration-300 hover:-translate-y-1 ${card.tone}`}
                  >
                    <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-current/15 bg-white/60">
                      <CardIcon className="h-4 w-4" />
                    </div>
                    <p className="text-xs font-medium text-current/80">{card.label}</p>
                    <p className="mt-1 text-2xl font-semibold leading-none text-current">
                      {card.value.toLocaleString('ar-SA')}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList className="grid h-auto w-full grid-cols-4 rounded-2xl bg-[#2f261b] p-1.5">
          <TabsTrigger
            value="employees"
            className="flex items-center gap-2 rounded-xl py-2.5 text-xs font-medium text-[#f8e9d0] data-[state=active]:bg-white data-[state=active]:text-[#2f261b] sm:text-sm"
          >
            <Users className="h-4 w-4" />
            إدارة الموظفين
          </TabsTrigger>
          <TabsTrigger
            value="documents"
            className="flex items-center gap-2 rounded-xl py-2.5 text-xs font-medium text-[#f8e9d0] data-[state=active]:bg-white data-[state=active]:text-[#2f261b] sm:text-sm"
          >
            <FileText className="h-4 w-4" />
            إدارة المستندات
          </TabsTrigger>
          <TabsTrigger
            value="sponsors"
            className="flex items-center gap-2 rounded-xl py-2.5 text-xs font-medium text-[#f8e9d0] data-[state=active]:bg-white data-[state=active]:text-[#2f261b] sm:text-sm"
          >
            <ShieldCheck className="h-4 w-4" />
            إدارة الكفلاء
          </TabsTrigger>
          <TabsTrigger
            value="insurance"
            className="flex items-center gap-2 rounded-xl py-2.5 text-xs font-medium text-[#f8e9d0] data-[state=active]:bg-white data-[state=active]:text-[#2f261b] sm:text-sm"
          >
            <HeartPulse className="h-4 w-4" />
            التأمين الطبي
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="employees"
          className="mt-0 space-y-4 data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-1 data-[state=active]:duration-300"
        >
          <Card className="border-[#e2ceab] bg-white/85 shadow-[0_18px_40px_-30px_rgba(80,60,30,0.5)]" dir="rtl">
            <CardContent className="p-4 sm:p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute inset-y-0 start-3 my-auto h-4 w-4 text-[#92734a]" />
                  <Input
                    placeholder="ابحث بالاسم أو البريد الإلكتروني..."
                    value={employeeSearch}
                    onChange={(event) => setEmployeeSearch(event.target.value)}
                    className="h-11 border-[#dcc49c] bg-[#fffdfa] ps-10"
                    dir="rtl"
                  />
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    variant="outline"
                    onClick={() => setShowArchivedEmployees((current) => !current)}
                    className="h-11 border-[#cfb180] bg-white text-[#59462e] hover:bg-[#fff4df]"
                  >
                    {showArchivedEmployees ? 'إخفاء المؤرشفين' : 'عرض المؤرشفين'}
                  </Button>
                  <Button
                    onClick={() => setShowEmployeeForm((current) => !current)}
                    className="h-11 bg-[#e9b353] text-white hover:bg-[#deaa4f]"
                  >
                    <UserPlus className="ms-2 h-4 w-4" />
                    {showEmployeeForm ? 'إغلاق النموذج' : 'إضافة موظف'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {showEmployeeForm && (
            <EmployeeForm
              branches={branches}
              sponsors={sponsors}
              onSubmit={handleEmployeeSubmit}
              onCancel={() => {
                setShowEmployeeForm(false);
                setEditingEmployee(null);
              }}
              editingEmployee={editingEmployee}
              isSubmitting={createEmployee.isPending || updateEmployee.isPending}
            />
          )}

          <EmployeeTable
            employees={filteredEmployees}
            onEdit={(employee) => {
              setEditingEmployee(employee);
              setShowEmployeeForm(true);
            }}
            onDelete={handleEmployeeDelete}
            onRestore={handleEmployeeRestore}
            isLoading={isEmployeeLoading || deleteEmployee.isPending}
          />
        </TabsContent>

        <TabsContent
          value="documents"
          className="mt-0 space-y-4 data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-1 data-[state=active]:duration-300"
        >
          <Card className="border-[#e2ceab] bg-white/85 shadow-[0_18px_40px_-30px_rgba(80,60,30,0.5)]" dir="rtl">
            <CardContent className="p-4 sm:p-5">
              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    setEditingDocument(null);
                    setDocumentDefaultEmployeeId(null);
                    setShowDocumentForm((current) => !current);
                  }}
                  className="h-11 bg-[#e9b353] text-white hover:bg-[#deaa4f]"
                >
                  <FileText className="ms-2 h-4 w-4" />
                  {showDocumentForm ? 'إغلاق النموذج' : 'إضافة مستند'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {showDocumentForm && (
            <DocumentForm
              employees={employees}
              onSubmit={handleDocumentSubmit}
              onCancel={() => {
                setShowDocumentForm(false);
                setEditingDocument(null);
                setDocumentDefaultEmployeeId(null);
              }}
              editingDocument={editingDocument}
              defaultEmployeeId={documentDefaultEmployeeId}
              isSubmitting={createDocument.isPending || updateDocument.isPending}
            />
          )}

          <DocumentList
            documents={visibleDocuments}
            employees={allEmployees}
            onUpdate={handleInlineDocumentUpdate}
            onDelete={handleDocumentDelete}
            onAddDocumentForEmployee={handleAddDocumentForEmployee}
            isLoading={isDocumentLoading || deleteDocument.isPending}
          />
        </TabsContent>

        <TabsContent
          value="sponsors"
          className="mt-0 space-y-4 data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-1 data-[state=active]:duration-300"
        >
          <Card className="border-[#e2ceab] bg-white/85 shadow-[0_18px_40px_-30px_rgba(80,60,30,0.5)]" dir="rtl">
            <CardContent className="p-4 sm:p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute inset-y-0 start-3 my-auto h-4 w-4 text-[#92734a]" />
                  <Input
                    placeholder="ابحث باسم الكفيل أو الأرقام الرسمية..."
                    value={sponsorSearch}
                    onChange={(event) => setSponsorSearch(event.target.value)}
                    className="h-11 border-[#dcc49c] bg-[#fffdfa] ps-10"
                    dir="rtl"
                  />
                </div>

                <Button
                  onClick={() => setShowSponsorForm((current) => !current)}
                  className="h-11 bg-[#e9b353] text-white hover:bg-[#deaa4f]"
                >
                  <ShieldCheck className="ms-2 h-4 w-4" />
                  {showSponsorForm ? 'إغلاق النموذج' : 'إضافة كفيل'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {showSponsorForm && (
            <SponsorForm
              onSubmit={handleSponsorSubmit}
              onCancel={() => {
                setShowSponsorForm(false);
                setEditingSponsor(null);
              }}
              editingSponsor={editingSponsor}
              isSubmitting={createSponsor.isPending || updateSponsor.isPending}
            />
          )}

          <SponsorTable
            sponsors={filteredSponsors}
            onEdit={(sponsor) => {
              setEditingSponsor(sponsor);
              setShowSponsorForm(true);
            }}
            onDelete={handleSponsorDelete}
            isLoading={isSponsorLoading || deleteSponsor.isPending}
            documentTypes={sponsorDocTypes}
            getDocumentsForSponsor={(sponsorId) => {
              const docs = sponsorDocsQuery.data ?? [];
              return docs.filter((d) => d.sponsor_id === sponsorId);
            }}
            onUploadDocument={handleSponsorDocUpload}
            onDeleteDocument={handleSponsorDocDelete}
            isUploading={createSponsorDoc.isPending}
          />
        </TabsContent>

        <TabsContent
          value="insurance"
          className="mt-0 space-y-4 data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-1 data-[state=active]:duration-300"
        >
          <InsuranceManagement />
        </TabsContent>

        <TabsContent
          value="settings"
          className="mt-0 data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-1 data-[state=active]:duration-300"
        >
          <DocumentTypesSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};
