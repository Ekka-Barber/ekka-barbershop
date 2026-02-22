import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useRealtimeSubscription } from '@shared/hooks/useRealtimeSubscription';
import { queryKeys } from '@shared/lib/query-keys';
import { supabase } from '@shared/lib/supabase/client';
import type {
  EmployeeInsurance,
  EmployeeInsuranceInsert,
  EmployeeInsuranceUpdate,
  EmployeeInsuranceWithCompany,
  InsuranceCompany,
  InsuranceCompanyInsert,
  InsuranceCompanyUpdate,
  InsuranceHospital,
  InsuranceHospitalInsert,
  InsuranceHospitalUpdate,
} from '@shared/types/domains';

const QUERY_KEY_INSURANCE_COMPANIES = ['hr-insurance-companies'] as const;
const QUERY_KEY_INSURANCE_HOSPITALS = ['hr-insurance-hospitals'] as const;
const QUERY_KEY_EMPLOYEE_INSURANCE = ['hr-employee-insurance'] as const;
const QUERY_KEY_EXPIRING_INSURANCE = ['hr-expiring-insurance'] as const;

export interface InsuranceCompanyFormData {
  name: string;
  contact_phone?: string;
}

export interface InsuranceCompanyUpdatePayload extends InsuranceCompanyUpdate {
  id: string;
}

export interface InsuranceHospitalFormData {
  company_id: string;
  name: string;
  city: string;
  google_maps_url?: string;
}

export interface InsuranceHospitalUpdatePayload extends InsuranceHospitalUpdate {
  id: string;
}

export interface EmployeeInsuranceFormData {
  employee_id: string;
  company_id: string;
  expiry_date: string;
}

export interface EmployeeInsuranceUpdatePayload extends EmployeeInsuranceUpdate {
  id: string;
}

export interface ExpiringInsuranceEmployee {
  employee_id: string;
  employee_name: string;
  employee_name_ar: string | null;
  company_id: string;
  company_name: string;
  expiry_date: string;
  days_until_expiry: number;
}

export const useInsuranceCompanies = () => {
  const queryClient = useQueryClient();

  useRealtimeSubscription({
    table: 'insurance_companies',
    queryKeys: [QUERY_KEY_INSURANCE_COMPANIES as unknown as readonly unknown[]],
  });

  const companiesQuery = useQuery({
    queryKey: QUERY_KEY_INSURANCE_COMPANIES,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('insurance_companies')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return (data ?? []) as InsuranceCompany[];
    },
  });

  const createCompany = useMutation({
    mutationFn: async (formData: InsuranceCompanyFormData) => {
      const { data, error } = await supabase
        .from('insurance_companies')
        .insert([formData])
        .select()
        .single();

      if (error) throw error;
      return data as InsuranceCompany;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_INSURANCE_COMPANIES });
    },
  });

  const updateCompany = useMutation({
    mutationFn: async ({ id, ...data }: InsuranceCompanyUpdatePayload) => {
      const { data: result, error } = await supabase
        .from('insurance_companies')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result as InsuranceCompany;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_INSURANCE_COMPANIES });
    },
  });

  const deleteCompany = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('insurance_companies')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_INSURANCE_COMPANIES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_INSURANCE_HOSPITALS });
    },
  });

  return {
    companiesQuery,
    createCompany,
    updateCompany,
    deleteCompany,
  };
};

export const useInsuranceHospitals = (companyId?: string, city?: string) => {
  const queryClient = useQueryClient();

  useRealtimeSubscription({
    table: 'insurance_hospitals',
    queryKeys: [QUERY_KEY_INSURANCE_HOSPITALS as unknown as readonly unknown[]],
  });

  const hospitalsQuery = useQuery({
    queryKey: [QUERY_KEY_INSURANCE_HOSPITALS, { companyId, city }],
    queryFn: async () => {
      let query = supabase
        .from('insurance_hospitals')
        .select('*');

      if (companyId) {
        query = query.eq('company_id', companyId);
      }
      if (city) {
        query = query.eq('city', city);
      }

      const { data, error } = await query.order('name', { ascending: true });

      if (error) throw error;
      return (data ?? []) as InsuranceHospital[];
    },
  });

  const createHospital = useMutation({
    mutationFn: async (formData: InsuranceHospitalFormData) => {
      const { data, error } = await supabase
        .from('insurance_hospitals')
        .insert([formData])
        .select()
        .single();

      if (error) throw error;
      return data as InsuranceHospital;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_INSURANCE_HOSPITALS });
    },
  });

  const updateHospital = useMutation({
    mutationFn: async ({ id, ...data }: InsuranceHospitalUpdatePayload) => {
      const { data: result, error } = await supabase
        .from('insurance_hospitals')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result as InsuranceHospital;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_INSURANCE_HOSPITALS });
    },
  });

  const deleteHospital = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('insurance_hospitals')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_INSURANCE_HOSPITALS });
    },
  });

  return {
    hospitalsQuery,
    createHospital,
    updateHospital,
    deleteHospital,
  };
};

export const useEmployeeInsurance = (employeeId?: string) => {
  const queryClient = useQueryClient();

  useRealtimeSubscription({
    table: 'employee_insurance',
    queryKeys: [QUERY_KEY_EMPLOYEE_INSURANCE as unknown as readonly unknown[]],
  });

  const insuranceQuery = useQuery({
    queryKey: [QUERY_KEY_EMPLOYEE_INSURANCE, employeeId],
    queryFn: async () => {
      if (!employeeId) return null;

      const { data, error } = await supabase
        .from('employee_insurance')
        .select(`
          *,
          company:insurance_companies(*)
        `)
        .eq('employee_id', employeeId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return data as EmployeeInsuranceWithCompany | null;
    },
    enabled: !!employeeId,
  });

  const allInsuranceQuery = useQuery({
    queryKey: [QUERY_KEY_EMPLOYEE_INSURANCE, 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_insurance')
        .select(`
          *,
          company:insurance_companies(*)
        `);

      if (error) throw error;
      return (data ?? []) as EmployeeInsuranceWithCompany[];
    },
  });

  const createInsurance = useMutation({
    mutationFn: async (formData: EmployeeInsuranceFormData) => {
      const { data, error } = await supabase
        .from('employee_insurance')
        .upsert([formData], { onConflict: 'employee_id' })
        .select()
        .single();

      if (error) throw error;
      return data as EmployeeInsurance;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_EMPLOYEE_INSURANCE });
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_EXPIRING_INSURANCE });
    },
  });

  const updateInsurance = useMutation({
    mutationFn: async ({ id, ...data }: EmployeeInsuranceUpdatePayload) => {
      const { data: result, error } = await supabase
        .from('employee_insurance')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result as EmployeeInsurance;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_EMPLOYEE_INSURANCE });
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_EXPIRING_INSURANCE });
    },
  });

  const deleteInsurance = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('employee_insurance')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_EMPLOYEE_INSURANCE });
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_EXPIRING_INSURANCE });
    },
  });

  return {
    insuranceQuery,
    allInsuranceQuery,
    createInsurance,
    updateInsurance,
    deleteInsurance,
  };
};

export const useExpiringInsurance = (daysThreshold = 30) => {
  const { allInsuranceQuery } = useEmployeeInsurance();

  const expiringInsurance = useQuery({
    queryKey: [QUERY_KEY_EXPIRING_INSURANCE, daysThreshold, allInsuranceQuery.data],
    queryFn: async () => {
      const allInsurance = allInsuranceQuery.data ?? [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: employees, error } = await supabase
        .from('employees')
        .select('id, name, name_ar, branch_id')
        .eq('is_archived', false);

      if (error) throw error;

      const employeeMap = new Map(employees?.map((e) => [e.id, e]) ?? []);

      const result: ExpiringInsuranceEmployee[] = [];

      for (const insurance of allInsurance) {
        const employee = employeeMap.get(insurance.employee_id);
        if (!employee) continue;

        const expiryDate = new Date(insurance.expiry_date);
        const daysUntilExpiry = Math.ceil(
          (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysUntilExpiry <= daysThreshold) {
          result.push({
            employee_id: insurance.employee_id,
            employee_name: employee.name,
            employee_name_ar: employee.name_ar,
            company_id: insurance.company_id,
            company_name: insurance.company.name,
            expiry_date: insurance.expiry_date,
            days_until_expiry: daysUntilExpiry,
          });
        }
      }

      return result.sort((a, b) => a.days_until_expiry - b.days_until_expiry);
    },
    enabled: allInsuranceQuery.isSuccess,
  });

  return {
    expiringQuery: expiringInsurance,
    isLoading: allInsuranceQuery.isLoading || expiringInsurance.isLoading,
  };
};

export const useCities = () => {
  const { hospitalsQuery } = useInsuranceHospitals();

  const cities = useQuery({
    queryKey: ['insurance-cities', hospitalsQuery.data],
    queryFn: async () => {
      const hospitals = hospitalsQuery.data ?? [];
      const uniqueCities = [...new Set(hospitals.map((h) => h.city))];
      return uniqueCities.sort();
    },
    enabled: hospitalsQuery.isSuccess,
  });

  return cities;
};

export const useBranchCities = () => {
  return useQuery({
    queryKey: ['branch-cities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('branches')
        .select('address')
        .not('address', 'is', null);

      if (error) throw error;

      const uniqueCities = [...new Set(data?.map((b) => b.address).filter(Boolean) as string[])];
      return uniqueCities.sort();
    },
  });
};
