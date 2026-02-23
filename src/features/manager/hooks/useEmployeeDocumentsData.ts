import { useQuery } from '@tanstack/react-query';

import { useRealtimeSubscription } from '@shared/hooks/useRealtimeSubscription';
import { accessCodeStorage, sessionAuth } from '@shared/lib/access-code/storage';
import { supabase } from '@shared/lib/supabase/client';
import type {
  EmployeeDocument,
  EmployeeInsurance,
  InsuranceCompany,
  InsuranceHospital,
} from '@shared/types/domains';

export interface DocumentWithType extends EmployeeDocument {
  document_type_name_ar?: string;
  document_type_color?: string;
  days_remaining: number | null;
  status: 'valid' | 'expiring_soon' | 'expired';
}

export interface InsuranceWithDetails extends EmployeeInsurance {
  company?: InsuranceCompany;
  hospitals: InsuranceHospital[];
  days_remaining: number | null;
  status: 'valid' | 'expiring_soon' | 'expired';
}

export interface EmployeeWithDocuments {
  id: string;
  name: string;
  name_ar?: string;
  email?: string;
  nationality?: string;
  photo_url?: string;
  role?: string;
  branch_id?: string;
  start_date?: string;
  branch_name?: string;
  documents: DocumentWithType[];
  insurance: InsuranceWithDetails | null;
  document_counts: {
    expired: number;
    expiring_soon: number;
    valid: number;
  };
}

interface DocumentTypeRow {
  code: string;
  name_ar: string;
  color?: string;
  notification_threshold_days: number;
}

const calculateDaysRemaining = (expiryDate: string): number => {
  const expiry = new Date(expiryDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

const getDocumentStatus = (
  daysRemaining: number | null,
  thresholdDays: number
): 'valid' | 'expiring_soon' | 'expired' => {
  if (daysRemaining === null) return 'valid';
  if (daysRemaining < 0) return 'expired';
  if (daysRemaining <= thresholdDays) return 'expiring_soon';
  return 'valid';
};

const getInsuranceStatus = (daysRemaining: number | null): 'valid' | 'expiring_soon' | 'expired' => {
  if (daysRemaining === null) return 'valid';
  if (daysRemaining < 0) return 'expired';
  if (daysRemaining <= 30) return 'expiring_soon';
  return 'valid';
};

export const useEmployeeDocumentsData = () => {
  useRealtimeSubscription({
    table: 'employees',
    queryKeys: [['manager-employee-documents']],
  });
  useRealtimeSubscription({
    table: 'employee_documents',
    queryKeys: [['manager-employee-documents']],
  });
  useRealtimeSubscription({
    table: 'employee_insurance',
    queryKeys: [['manager-employee-documents']],
  });

  const query = useQuery({
    queryKey: ['manager-employee-documents'],
    queryFn: async (): Promise<EmployeeWithDocuments[]> => {
      const branchManagerCode = accessCodeStorage.getManagerAccessCode();

      if (!branchManagerCode) {
        return [];
      }

      const isSuper = sessionAuth.getRole() === 'super_manager';

      const today = new Date().toISOString().slice(0, 10);

      let employeesQuery = supabase
        .from('employees')
        .select(
          `
          id,
          name,
          name_ar,
          email,
          nationality,
          photo_url,
          role,
          branch_id,
          start_date,
          end_date,
          is_archived,
          branches (
            name
          )
        `
        )
        .eq('is_archived', false)
        .or(`end_date.is.null,end_date.gte.${today}`);

      if (!isSuper) {
        const { data: managerBranch, error: managerError } = await supabase
          .rpc('get_current_manager_branch')
          .single();

        if (managerError || !managerBranch) {
          return [];
        }

        const branch = managerBranch as {
          branch_id: string;
          branch_name: string;
        };
        employeesQuery = employeesQuery.eq('branch_id', branch.branch_id);
      }

      const { data: employees, error: employeesError } = await employeesQuery;

      if (employeesError) {
        throw employeesError;
      }

      if (!employees || employees.length === 0) {
        return [];
      }

      const employeeIds = employees.map((e) => e.id);

      const { data: documentTypes } = await supabase
        .from('document_types')
        .select('code, name_ar, color, notification_threshold_days')
        .eq('is_active', true);

      const documentTypeMap = new Map<string, DocumentTypeRow>();
      for (const dt of documentTypes || []) {
        documentTypeMap.set(dt.code, dt);
      }

      const { data: documents } = await supabase
        .from('employee_documents')
        .select('*')
        .in('employee_id', employeeIds);

      const { data: insuranceRecords } = await supabase
        .from('employee_insurance')
        .select('*')
        .in('employee_id', employeeIds);

      const companyIds = (insuranceRecords || [])
        .map((i) => i.company_id)
        .filter(Boolean);

      let companies: InsuranceCompany[] = [];
      let hospitals: InsuranceHospital[] = [];

      if (companyIds.length > 0) {
        const { data: companiesData } = await supabase
          .from('insurance_companies')
          .select('*')
          .in('id', companyIds);
        companies = companiesData || [];

        const { data: hospitalsData } = await supabase
          .from('insurance_hospitals')
          .select('*')
          .in('company_id', companyIds);
        hospitals = hospitalsData || [];
      }

      const companyMap = new Map<string, InsuranceCompany>();
      for (const c of companies) {
        companyMap.set(c.id, c);
      }

      const hospitalsByCompany = new Map<string, InsuranceHospital[]>();
      for (const h of hospitals) {
        const existing = hospitalsByCompany.get(h.company_id) || [];
        existing.push(h);
        hospitalsByCompany.set(h.company_id, existing);
      }

      const documentsByEmployee = new Map<string, EmployeeDocument[]>();
      for (const doc of documents || []) {
        const existing = documentsByEmployee.get(doc.employee_id) || [];
        existing.push(doc);
        documentsByEmployee.set(doc.employee_id, existing);
      }

      const insuranceByEmployee = new Map<string, EmployeeInsurance>();
      for (const ins of insuranceRecords || []) {
        insuranceByEmployee.set(ins.employee_id, ins);
      }

      const result: EmployeeWithDocuments[] = employees.map((emp) => {
        const branchName = Array.isArray(emp.branches)
          ? emp.branches[0]?.name
          : (emp.branches as { name: string } | null)?.name;

        const empDocs = documentsByEmployee.get(emp.id) || [];

        const processedDocs: DocumentWithType[] = empDocs.map((doc) => {
          const docType = documentTypeMap.get(doc.document_type);
          const thresholdDays = docType?.notification_threshold_days || 30;
          const daysRemaining = doc.expiry_date
            ? calculateDaysRemaining(doc.expiry_date)
            : null;
          const status = getDocumentStatus(daysRemaining, thresholdDays);

          return {
            ...doc,
            document_type_name_ar: docType?.name_ar,
            document_type_color: docType?.color,
            days_remaining: daysRemaining,
            status,
          };
        });

        processedDocs.sort((a, b) => {
          if (a.status === 'expired' && b.status !== 'expired') return -1;
          if (a.status !== 'expired' && b.status === 'expired') return 1;
          if (a.status === 'expiring_soon' && b.status === 'valid') return -1;
          if (a.status === 'valid' && b.status === 'expiring_soon') return 1;
          return (a.days_remaining ?? 999) - (b.days_remaining ?? 999);
        });

        const insuranceRecord = insuranceByEmployee.get(emp.id);
        let insurance: InsuranceWithDetails | null = null;

        if (insuranceRecord) {
          const company = companyMap.get(insuranceRecord.company_id);
          const companyHospitals = hospitalsByCompany.get(insuranceRecord.company_id) || [];
          const daysRemaining = insuranceRecord.expiry_date
            ? calculateDaysRemaining(insuranceRecord.expiry_date)
            : null;
          const status = getInsuranceStatus(daysRemaining);

          insurance = {
            ...insuranceRecord,
            company,
            hospitals: companyHospitals,
            days_remaining: daysRemaining,
            status,
          };
        }

        const docCounts = {
          expired: processedDocs.filter((d) => d.status === 'expired').length,
          expiring_soon: processedDocs.filter((d) => d.status === 'expiring_soon')
            .length,
          valid: processedDocs.filter((d) => d.status === 'valid').length,
        };

        return {
          id: emp.id,
          name: emp.name,
          name_ar: emp.name_ar,
          email: emp.email,
          nationality: emp.nationality,
          photo_url: emp.photo_url,
          role: emp.role,
          branch_id: emp.branch_id,
          start_date: emp.start_date,
          branch_name: branchName,
          documents: processedDocs,
          insurance,
          document_counts: docCounts,
        };
      });

      result.sort((a, b) => {
        const getPriority = (e: EmployeeWithDocuments) => {
          let score = 0;
          if (e.document_counts.expired > 0) score += 100;
          if (e.document_counts.expiring_soon > 0) score += 50;
          if (e.insurance?.status === 'expired') score += 100;
          if (e.insurance?.status === 'expiring_soon') score += 50;
          return score;
        };
        return getPriority(b) - getPriority(a);
      });

      return result;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const expiredDocumentsCount =
    query.data?.reduce(
      (sum, e) => sum + e.document_counts.expired,
      0
    ) ?? 0;

  const expiringDocumentsCount =
    query.data?.reduce(
      (sum, e) => sum + e.document_counts.expiring_soon,
      0
    ) ?? 0;

  const expiredInsuranceCount =
    query.data?.filter((e) => e.insurance?.status === 'expired').length ?? 0;

  const expiringInsuranceCount =
    query.data?.filter((e) => e.insurance?.status === 'expiring_soon').length ??
    0;

  return {
    employees: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    summary: {
      expiredDocuments: expiredDocumentsCount,
      expiringDocuments: expiringDocumentsCount,
      expiredInsurance: expiredInsuranceCount,
      expiringInsurance: expiringInsuranceCount,
    },
  };
};
