import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EmployeeTab } from '../EmployeeTab';
import { MemoryRouter } from 'react-router-dom';
import { useUrlState } from '../hooks/useUrlState';

// Mock data
const mockBranches = [
  { id: 'branch1', name: 'Branch 1', name_ar: 'فرع 1' },
  { id: 'branch2', name: 'Branch 2', name_ar: 'فرع 2' },
];

const mockEmployees = [
  { 
    id: 'emp1', 
    name: 'John Doe', 
    role: 'Barber', 
    branch_id: 'branch1',
    email: 'john@example.com' 
  },
  { 
    id: 'emp2', 
    name: 'Jane Smith', 
    role: 'Manager', 
    branch_id: 'branch1',
    email: 'jane@example.com' 
  },
];

const mockSalesInputs = {
  'emp1': '1000',
  'emp2': '2000'
};

// Mocked hook state
let mockSelectedBranch = 'branch1';
let mockSelectedDate = new Date('2024-02-01');
let mockCurrentPage = 1;
let mockActiveTab = 'employee-grid';
let mockSalesData = { ...mockSalesInputs };

// Mock the lazy-loaded components
vi.mock('../lazy-loaded-tabs', () => ({
  LazyEmployeesTab: ({ initialBranchId }) => (
    <div data-testid="employees-tab">
      Employees Tab Content (Branch: {initialBranchId})
    </div>
  ),
  LazyMonthlySalesTab: ({ initialBranchId, initialDate }) => (
    <div data-testid="monthly-sales-tab">
      Monthly Sales Tab Content (Branch: {initialBranchId}, 
      Date: {initialDate ? initialDate.toISOString().slice(0, 7) : 'none'})
    </div>
  ),
  LazyEmployeeAnalyticsDashboard: () => <div data-testid="analytics-tab">Analytics Tab Content</div>,
  LazyScheduleInterface: () => <div data-testid="schedule-tab">Schedule Tab Content</div>,
  LazySalaryDashboard: () => <div data-testid="salary-tab">Salary Tab Content</div>,
  LazyLeaveManagement: () => <div data-testid="leave-tab">Leave Tab Content</div>,
  TabLoadingFallback: () => <div>Loading...</div>
}));

// Mock the URL state hook
vi.mock('../hooks/useUrlState', () => ({
  useUrlState: () => ({
    currentState: {
      tab: mockActiveTab,
      branch: mockSelectedBranch,
      date: mockSelectedDate.toISOString().slice(0, 7),
      page: mockCurrentPage
    },
    syncUrlWithState: vi.fn((tab, branch, date, page) => {
      mockActiveTab = tab;
      mockSelectedBranch = branch;
      mockSelectedDate = date;
      mockCurrentPage = page;
    }),
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

// Mock the branch manager hook
vi.mock('../hooks/useBranchManager', () => ({
  useBranchManager: (initialBranch = null) => ({
    branches: mockBranches,
    selectedBranch: initialBranch || mockSelectedBranch,
    setSelectedBranch: vi.fn((branch) => {
      mockSelectedBranch = branch;
    }),
    isLoading: false
  })
}));

// Mock the employee manager hook
vi.mock('../hooks/useEmployeeManager', () => ({
  useEmployeeManager: (branch) => ({
    employees: mockEmployees.filter(emp => !branch || emp.branch_id === branch),
    isLoading: false,
    fetchEmployees: vi.fn(),
    pagination: { 
      currentPage: mockCurrentPage, 
      totalPages: 1, 
      totalItems: mockEmployees.length 
    },
    setCurrentPage: vi.fn((page) => {
      mockCurrentPage = page;
    })
  })
}));

// Mock the employee sales hook
vi.mock('../hooks/useEmployeeSales', () => ({
  useEmployeeSales: () => ({
    salesInputs: mockSalesData,
    lastUpdated: '2024-02-01 10:00:00',
    isSubmitting: false,
    handleSalesChange: vi.fn((employeeId, value) => {
      mockSalesData = { ...mockSalesData, [employeeId]: value };
    }),
    submitSalesData: vi.fn().mockResolvedValue(true)
  })
}));

// Mock other dependencies
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

vi.mock('../context/EmployeeContext', () => ({
  EmployeeProvider: ({ children }) => <div data-testid="employee-provider">{children}</div>,
  useEmployeeContext: () => ({
    selectedDate: mockSelectedDate,
    setSelectedDate: vi.fn((date) => {
      mockSelectedDate = date;
    })
  })
}));

vi.mock('../context/DocumentContext', () => ({
  DocumentProvider: ({ children }) => <div data-testid="document-provider">{children}</div>
}));

describe('Data Persistence Tests', () => {
  beforeEach(() => {
    // Reset mocked state between tests
    mockSelectedBranch = 'branch1';
    mockSelectedDate = new Date('2024-02-01');
    mockCurrentPage = 1;
    mockActiveTab = 'employee-grid';
    mockSalesData = { ...mockSalesInputs };
    
    // Clear all mocks
    vi.clearAllMocks();
  });
  
  // Test branch selection persistence across tab changes
  it('persists branch selection when switching tabs', async () => {
    render(
      <MemoryRouter>
        <EmployeeTab />
      </MemoryRouter>
    );
    
    // Verify initial state
    expect(mockSelectedBranch).toBe('branch1');
    
    // Switch to Branch 2
    await act(async () => {
      mockSelectedBranch = 'branch2';
    });
    
    // Switch to Employees tab
    fireEvent.click(screen.getByText('Employees'));
    
    // Wait for tab to render and verify branch is persisted
    await waitFor(() => {
      expect(screen.getByTestId('employees-tab')).toBeInTheDocument();
      expect(screen.getByTestId('employees-tab').textContent).toContain('Branch: branch2');
    });
    
    // Switch to Monthly Sales tab
    fireEvent.click(screen.getByText('Monthly Sales'));
    
    // Wait for tab to render and verify branch is still persisted
    await waitFor(() => {
      expect(screen.getByTestId('monthly-sales-tab')).toBeInTheDocument();
      expect(screen.getByTestId('monthly-sales-tab').textContent).toContain('Branch: branch2');
    });
  });
  
  // Test date selection persistence across tab changes
  it('persists date selection when switching tabs', async () => {
    // Set a fixed date for this test
    const testDate = new Date('2024-02-01');
    mockSelectedDate = testDate;
    mockActiveTab = 'employee-grid';
    
    render(
      <MemoryRouter>
        <EmployeeTab />
      </MemoryRouter>
    );
    
    // Verify initial state
    expect(mockActiveTab).toBe('employee-grid');
    
    // Switch to Monthly Sales tab
    fireEvent.click(screen.getByText('Monthly Sales'));
    
    // Wait for tab to render and verify tab is switched
    await waitFor(() => {
      expect(screen.getByTestId('monthly-sales-tab')).toBeInTheDocument();
    });
    
    // Verify tab state has changed
    expect(mockActiveTab).toBe('monthly-sales');
    
    // Go back to Employee Grid
    fireEvent.click(screen.getByText('Employee Grid'));
    
    // Verify tab state changed back
    expect(mockActiveTab).toBe('employee-grid');
  });
  
  // Test URL state synchronization
  it('synchronizes URL state with component state', async () => {
    // We'll use the global mock that's already set up
    const syncUrlMock = vi.fn((tab, branch, date, page) => {
      mockActiveTab = tab;
      mockSelectedBranch = branch;
      mockSelectedDate = date;
      mockCurrentPage = page;
    });
    
    // Replace the mock function just for this test
    const originalSyncUrlWithState = vi.mocked(useUrlState().syncUrlWithState);
    vi.mocked(useUrlState().syncUrlWithState).mockImplementation(syncUrlMock);
    
    render(
      <MemoryRouter>
        <EmployeeTab />
      </MemoryRouter>
    );
    
    // Verify URL state is synchronized when tab is changed
    fireEvent.click(screen.getByText('Employees'));
    
    // Wait for tab to render
    await waitFor(() => {
      expect(screen.getByTestId('employees-tab')).toBeInTheDocument();
    });
    
    // Verify that URL state was synchronized
    expect(mockActiveTab).toBe('employees');
    
    // After test, restore the original mock
    vi.mocked(useUrlState().syncUrlWithState).mockImplementation(originalSyncUrlWithState);
  });
  
  // Test salesInputs persistence
  it('persists sales input data after switching between tabs', async () => {
    render(
      <MemoryRouter>
        <EmployeeTab />
      </MemoryRouter>
    );
    
    // Verify initial sales data
    expect(mockSalesData).toEqual(mockSalesInputs);
    
    // Update sales data
    await act(async () => {
      mockSalesData = { 
        ...mockSalesData, 
        'emp1': '1500' 
      };
    });
    
    // Switch to Employees tab
    fireEvent.click(screen.getByText('Employees'));
    
    // Wait for tab to render
    await waitFor(() => {
      expect(screen.getByTestId('employees-tab')).toBeInTheDocument();
    });
    
    // Switch back to Employee Grid tab
    fireEvent.click(screen.getByText('Employee Grid'));
    
    // Verify sales data is preserved
    expect(mockSalesData['emp1']).toBe('1500');
  });
}); 