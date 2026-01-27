import { Employee } from '@shared/types/domains';

// Employee is now imported from @/types/domains

export interface LeaveRecord {
  id: string;
  employee_id: string;
  date: string;
  end_date: string | null;
  duration_days: number | null;
  reason: string | null;
  created_at: string | null;
}

export interface LeaveTabProps {
  employees: Employee[];
  selectedMonth: string;
}

export interface LeaveBalance {
  daysTaken: number;
  totalAvailable: number;
  daysRemaining: number;
}

export interface AddLeaveData {
  employee_id: string;
  date: string;
  end_date: string;
  duration_days: number;
  reason: string;
}

export interface AddLeaveResponse {
  created_at: string;
  date: string;
  duration_days: number;
  employee_id: string;
  end_date: string;
  id: string;
  reason: string;
}

export type LeavesByEmployee = Record<string, LeaveRecord[]>;

export interface LeaveHeaderProps {
  employees: Employee[];
  selectedMonth: string;
  totalLeaveRequests: number;
  approvedRequests: number;
  pendingRequests: number;
  rejectedRequests: number;
  addLeaveMutation: {
    mutateAsync: (data: AddLeaveData) => Promise<AddLeaveResponse>;
    isPending: boolean;
  };
}
