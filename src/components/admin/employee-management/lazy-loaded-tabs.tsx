import { lazy, Suspense } from 'react';
import { Employee } from '@/types/employee';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

// Error boundary wrapper for lazy loaded components
const withErrorBoundary = (Component: React.ComponentType<any>) => {
  return (props: any) => (
    <ErrorBoundary>
      <Component {...props} />
    </ErrorBoundary>
  );
};

// Lazy load each tab component with error boundary
export const LazyEmployeeAnalyticsDashboard = lazy(() => 
  import('./EmployeeAnalyticsDashboard').then(module => ({
    default: withErrorBoundary(module.EmployeeAnalyticsDashboard)
  }))
);

export const LazyScheduleInterface = lazy(() => 
  import('./components/ScheduleInterface').then(module => ({
    default: withErrorBoundary(module.ScheduleInterface)
  }))
);

export const LazyTeamPerformanceComparison = lazy(() => 
  import('./components/TeamPerformanceComparison').then(module => ({
    default: withErrorBoundary(module.TeamPerformanceComparison)
  }))
);

export const LazySalaryDashboard = lazy(() => 
  import('./salary/SalaryDashboard').then(module => ({
    default: withErrorBoundary(module.SalaryDashboard)
  }))
);

export const LazyLeaveManagement = lazy(() => 
  import('./LeaveManagement').then(module => ({
    default: withErrorBoundary(module.LeaveManagement)
  }))
);

// Enhanced loading fallback component
export const TabLoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="flex flex-col items-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
    </div>
  </div>
); 