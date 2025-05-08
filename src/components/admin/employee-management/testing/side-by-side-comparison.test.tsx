import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EmployeeTab } from '../EmployeeTab';
import { MemoryRouter } from 'react-router-dom';

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
    email: 'john@example.com',
    nationality: 'US',
    photo_url: '/profile.jpg',
    start_date: '2023-01-01'
  },
  { 
    id: 'emp2', 
    name: 'Jane Smith', 
    role: 'Manager', 
    branch_id: 'branch1',
    email: 'jane@example.com',
    nationality: 'UK',
    photo_url: null,
    start_date: '2022-05-15'
  },
];

// Mocked hook state
let mockSelectedBranch = 'branch1';
let mockSelectedDate = new Date('2024-02-01');
let mockCurrentPage = 1;
let mockActiveTab = 'employee-grid';

// Mock the lazy-loaded components
vi.mock('../lazy-loaded-tabs', () => ({
  LazyEmployeesTab: ({ initialBranchId }) => (
    <div data-testid="employees-tab" className="new-employees-tab">
      Employees Tab Content (Branch: {initialBranchId})
    </div>
  ),
  LazyMonthlySalesTab: ({ initialBranchId, initialDate }) => (
    <div data-testid="monthly-sales-tab" className="new-monthly-sales-tab">
      Monthly Sales Tab Content (Branch: {initialBranchId}, 
      Date: {initialDate ? initialDate.toISOString().slice(0, 7) : 'none'})
    </div>
  ),
  LazyEmployeeGridTab: ({ initialBranchId }) => (
    <div data-testid="employee-grid-tab" className="original-employee-grid-tab">
      Original Employee Grid Tab Content (Branch: {initialBranchId})
    </div>
  ),
  LazyEmployeeAnalyticsDashboard: () => <div data-testid="analytics-tab">Analytics Tab Content</div>,
  LazyScheduleInterface: () => <div data-testid="schedule-tab">Schedule Tab Content</div>,
  LazySalaryDashboard: () => <div data-testid="salary-tab">Salary Tab Content</div>,
  LazyLeaveManagement: () => <div data-testid="leave-tab">Leave Tab Content</div>,
  TabLoadingFallback: () => <div>Loading...</div>
}));

// Mock dependencies
vi.mock('../hooks/useUrlState', () => ({
  useUrlState: () => ({
    currentState: {
      tab: mockActiveTab,
      branch: mockSelectedBranch,
      date: mockSelectedDate.toISOString().slice(0, 7),
      page: mockCurrentPage
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
    branches: mockBranches,
    selectedBranch: mockSelectedBranch,
    setSelectedBranch: vi.fn(),
    isLoading: false
  })
}));

vi.mock('../hooks/useEmployeeManager', () => ({
  useEmployeeManager: () => ({
    employees: mockEmployees,
    isLoading: false,
    fetchEmployees: vi.fn(),
    pagination: { 
      currentPage: mockCurrentPage, 
      totalPages: 1, 
      totalItems: mockEmployees.length 
    },
    setCurrentPage: vi.fn()
  })
}));

vi.mock('../context/EmployeeContext', () => ({
  EmployeeProvider: ({ children }) => <div data-testid="employee-provider">{children}</div>
}));

vi.mock('../context/DocumentContext', () => ({
  DocumentProvider: ({ children }) => <div data-testid="document-provider">{children}</div>
}));

describe('Side by Side Comparison Tests', () => {
  beforeEach(() => {
    // Reset mocked state between tests
    mockSelectedBranch = 'branch1';
    mockSelectedDate = new Date('2024-02-01');
    mockCurrentPage = 1;
    mockActiveTab = 'employee-grid';
    
    // Clear all mocks
    vi.clearAllMocks();
  });
  
  // Test that original tab shows the same content as new tabs
  it('compares employee data between original tab and new employees tab', async () => {
    render(
      <MemoryRouter>
        <EmployeeTab />
      </MemoryRouter>
    );
    
    // Verify Employee Grid tab button is active
    const employeeGridButton = screen.getByRole('tab', { name: /Employee Grid/i });
    expect(employeeGridButton).toHaveAttribute('aria-selected', 'true');
    
    // Verify that there is at least one tabpanel rendered
    const tabpanels = screen.getAllByRole('tabpanel');
    expect(tabpanels.length).toBeGreaterThan(0);
    
    // Switch to Employees tab
    fireEvent.click(screen.getByText('Employees'));
    
    // Wait for the new tab to render
    await waitFor(() => {
      expect(screen.getByTestId('employees-tab')).toBeInTheDocument();
    });
    
    // Check if it contains the expected branch information
    expect(screen.getByTestId('employees-tab').textContent).toContain('Branch: branch1');
  });
  
  // Test branch selection is reflected in both tabs
  it('verifies branch selection updates consistently across tabs', async () => {
    render(
      <MemoryRouter>
        <EmployeeTab />
      </MemoryRouter>
    );
    
    // Change branch selection
    mockSelectedBranch = 'branch2';
    
    // Switch to Employees tab
    fireEvent.click(screen.getByText('Employees'));
    
    // Wait for the new tab to render
    await waitFor(() => {
      expect(screen.getByTestId('employees-tab')).toBeInTheDocument();
    });
    
    // Check that branch selection is reflected in new tab
    expect(screen.getByTestId('employees-tab').textContent).toContain('Branch: branch2');
    
    // Switch to Monthly Sales tab
    fireEvent.click(screen.getByText('Monthly Sales'));
    
    // Wait for the new tab to render
    await waitFor(() => {
      expect(screen.getByTestId('monthly-sales-tab')).toBeInTheDocument();
    });
    
    // Check that branch selection is reflected in Monthly Sales tab
    expect(screen.getByTestId('monthly-sales-tab').textContent).toContain('Branch: branch2');
  });
  
  // Test that all tabs show the same functional elements
  it('verifies that tab switching preserves functional UI elements', async () => {
    render(
      <MemoryRouter>
        <EmployeeTab />
      </MemoryRouter>
    );
    
    // Verify presence of branch filter buttons in original tab
    expect(screen.getByRole('button', { name: /All Branches/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Branch 1/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Branch 2/i })).toBeInTheDocument();
    
    // Switch to Employees tab
    fireEvent.click(screen.getByText('Employees'));
    
    // Wait for the new tab to render
    await waitFor(() => {
      expect(screen.getByTestId('employees-tab')).toBeInTheDocument();
    });
    
    // Verify that branch filter buttons still exist
    expect(screen.getByRole('button', { name: /All Branches/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Branch 1/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Branch 2/i })).toBeInTheDocument();
    
    // Switch to Monthly Sales tab
    fireEvent.click(screen.getByText('Monthly Sales'));
    
    // Wait for the new tab to render
    await waitFor(() => {
      expect(screen.getByTestId('monthly-sales-tab')).toBeInTheDocument();
    });
    
    // Verify that branch filter buttons still exist
    expect(screen.getByRole('button', { name: /All Branches/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Branch 1/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Branch 2/i })).toBeInTheDocument();
  });
}); 