import { lazy } from 'react';
import { Employee } from '@/types/employee';

// Lazy load each tab component
export const LazyEmployeeAnalyticsDashboard = lazy(() => 
  import('./EmployeeAnalyticsDashboard').then(module => ({
    default: module.EmployeeAnalyticsDashboard
  }))
);

export const LazyScheduleInterface = lazy(() => 
  import('./components/ScheduleInterface').then(module => ({
    default: module.ScheduleInterface
  }))
);

export const LazyTeamPerformanceComparison = lazy(() => 
  import('./components/TeamPerformanceComparison').then(module => ({
    default: module.TeamPerformanceComparison
  }))
);

export const LazySalaryDashboard = lazy(() => 
  import('./salary/SalaryDashboard').then(module => ({
    default: module.SalaryDashboard
  }))
);

export const LazyLeaveManagement = lazy(() => 
  import('./LeaveManagement').then(module => ({
    default: module.LeaveManagement
  }))
);

// Loading fallback component
export const TabLoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
); 