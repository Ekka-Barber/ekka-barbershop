import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EmployeeTab } from '../EmployeeTab';
import { EmployeeTabsNavigation } from '../components/EmployeeTabsNavigation';
import { MemoryRouter } from 'react-router-dom';
import { Tabs } from '@/components/ui/tabs';

// Mock the lazy-loaded components
vi.mock('../lazy-loaded-tabs', () => ({
  LazyEmployeesTab: () => <div data-testid="employees-tab">Employees Tab Content</div>,
  LazyMonthlySalesTab: () => <div data-testid="monthly-sales-tab">Monthly Sales Tab Content</div>,
  LazyEmployeeAnalyticsDashboard: () => <div data-testid="analytics-tab">Analytics Tab Content</div>,
  LazyScheduleInterface: () => <div data-testid="schedule-tab">Schedule Tab Content</div>,
  LazySalaryDashboard: () => <div data-testid="salary-tab">Salary Tab Content</div>,
  LazyLeaveManagement: () => <div data-testid="leave-tab">Leave Tab Content</div>,
  TabLoadingFallback: () => <div>Loading...</div>
}));

// Mock hooks
vi.mock('../hooks/useUrlState', () => ({
  useUrlState: () => ({
    currentState: {
      tab: 'employee-grid',
      branch: null,
      date: new Date().toISOString().slice(0, 7),
      page: 1
    },
    syncUrlWithState: vi.fn(),
    updateUrlState: vi.fn(),
    VALID_TABS: [
      'employee-grid',
      'employees',
      'monthly-sales',
      'analytics',
      'schedule',
      'salary',
      'leave'
    ]
  })
}));

vi.mock('../hooks/useBranchManager', () => ({
  useBranchManager: () => ({
    branches: [],
    selectedBranch: null,
    setSelectedBranch: vi.fn(),
    isLoading: false
  })
}));

vi.mock('../hooks/useEmployeeManager', () => ({
  useEmployeeManager: () => ({
    employees: [],
    isLoading: false,
    fetchEmployees: vi.fn(),
    pagination: { currentPage: 1, totalPages: 1, totalItems: 0 },
    setCurrentPage: vi.fn()
  })
}));

vi.mock('../hooks/useEmployeeSales', () => ({
  useEmployeeSales: () => ({
    salesInputs: {},
    lastUpdated: null,
    isSubmitting: false,
    handleSalesChange: vi.fn(),
    submitSalesData: vi.fn()
  })
}));

vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

// Mock context providers
vi.mock('../context/EmployeeContext', () => ({
  EmployeeProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

vi.mock('../context/DocumentContext', () => ({
  DocumentProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

describe('Tab Navigation Tests', () => {
  // Test the standalone navigation component
  describe('EmployeeTabsNavigation Component', () => {
    const onTabChangeMock = vi.fn();
    
    beforeEach(() => {
      onTabChangeMock.mockClear();
    });
    
    it('renders all tab options correctly', () => {
      render(
        <Tabs defaultValue="employee-grid">
          <EmployeeTabsNavigation 
            activeTab="employee-grid" 
            onTabChange={onTabChangeMock} 
          />
        </Tabs>
      );
      
      // Check that all tabs are rendered
      expect(screen.getByText('Employee Grid')).toBeInTheDocument();
      expect(screen.getByText('Employees')).toBeInTheDocument();
      expect(screen.getByText('Monthly Sales')).toBeInTheDocument();
      expect(screen.getByText('Analytics')).toBeInTheDocument();
      expect(screen.getByText('Scheduling')).toBeInTheDocument();
      expect(screen.getByText('Salary')).toBeInTheDocument();
      expect(screen.getByText('Leave')).toBeInTheDocument();
    });
    
    it('calls onTabChange with correct value when tab is clicked', () => {
      render(
        <Tabs defaultValue="employee-grid">
          <EmployeeTabsNavigation 
            activeTab="employee-grid" 
            onTabChange={onTabChangeMock} 
          />
        </Tabs>
      );
      
      // Click on Employees tab
      fireEvent.click(screen.getByText('Employees'));
      expect(onTabChangeMock).toHaveBeenCalledWith('employees');
      
      // Click on Monthly Sales tab
      fireEvent.click(screen.getByText('Monthly Sales'));
      expect(onTabChangeMock).toHaveBeenCalledWith('monthly-sales');
    });
    
    it('applies correct active styles to the selected tab', () => {
      render(
        <Tabs defaultValue="employees" value="employees">
          <EmployeeTabsNavigation 
            activeTab="employees" 
            onTabChange={onTabChangeMock} 
          />
        </Tabs>
      );
      
      // The Employees tab should have active styles
      const employeesTab = screen.getByText('Employees').closest('button');
      expect(employeesTab).toHaveClass('bg-accent');
      
      // Other tabs should not have active styles
      const employeeGridTab = screen.getByText('Employee Grid').closest('button');
      expect(employeeGridTab).not.toHaveClass('bg-accent');
    });
  });
  
  // Test the main EmployeeTab component with integrated navigation
  describe('EmployeeTab Component Navigation', () => {
    it('renders the default employee-grid tab initially', async () => {
      render(
        <MemoryRouter>
          <EmployeeTab />
        </MemoryRouter>
      );
      
      // Check that the Employee Grid tab is active
      const employeeGridTab = screen.getByText('Employee Grid').closest('button');
      expect(employeeGridTab).toHaveClass('bg-accent');
      
      // Check that the grid component is rendered
      expect(screen.getByText(/Employee Grid/i)).toBeInTheDocument();
    });
    
    it('shows correct content when switching to Employees tab', async () => {
      render(
        <MemoryRouter>
          <EmployeeTab />
        </MemoryRouter>
      );
      
      // Click on Employees tab
      fireEvent.click(screen.getByText('Employees'));
      
      // Wait for the tab content to load
      await waitFor(() => {
        expect(screen.getByTestId('employees-tab')).toBeInTheDocument();
      });
    });
    
    it('shows correct content when switching to Monthly Sales tab', async () => {
      render(
        <MemoryRouter>
          <EmployeeTab />
        </MemoryRouter>
      );
      
      // Click on Monthly Sales tab
      fireEvent.click(screen.getByText('Monthly Sales'));
      
      // Wait for the tab content to load
      await waitFor(() => {
        expect(screen.getByTestId('monthly-sales-tab')).toBeInTheDocument();
      });
    });
    
    it('preserves the selected tab when other state changes', async () => {
      render(
        <MemoryRouter>
          <EmployeeTab />
        </MemoryRouter>
      );
      
      // Switch to Employees tab
      fireEvent.click(screen.getByText('Employees'));
      
      // Wait for the tab content to load
      await waitFor(() => {
        expect(screen.getByTestId('employees-tab')).toBeInTheDocument();
      });
      
      // TODO: Simulate a state change like branch selection
      // This would require more complex mocking of context state
      
      // Verify the tab selection is preserved
      const employeesTab = screen.getByText('Employees').closest('button');
      expect(employeesTab).toHaveClass('bg-accent');
    });
  });
}); 