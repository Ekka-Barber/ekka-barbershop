import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EmployeeTab } from '../EmployeeTab';
import { EmployeeProvider } from '../context/EmployeeContext';
import { DocumentProvider } from '../context/DocumentContext';

// Mock the API calls
vi.mock('../services/documentService', () => ({
  fetchEmployeeDocuments: vi.fn().mockResolvedValue([]),
  saveEmployeeDocument: vi.fn().mockResolvedValue({}),
  updateEmployeeDocument: vi.fn().mockResolvedValue({}),
  deleteEmployeeDocument: vi.fn().mockResolvedValue({}),
}));

vi.mock('../hooks/useEmployeeManager', () => ({
  useEmployeeManager: vi.fn().mockReturnValue({
    employees: [
      { 
        id: '1', 
        name: 'John Doe', 
        branch_id: '1', 
        role: 'Barber',
        email: 'john@example.com',
        nationality: 'US',
        photo_url: '/sample.jpg'
      },
      { 
        id: '2', 
        name: 'Jane Smith', 
        branch_id: '1', 
        role: 'Manager',
        email: 'jane@example.com',
        nationality: 'UK',
        photo_url: '/sample2.jpg'
      }
    ],
    loading: false,
    error: null,
    branches: [{ id: '1', name: 'Main Branch' }],
    selectedBranchId: '1',
    setSelectedBranchId: vi.fn(),
    refetchEmployees: vi.fn(),
  }),
}));

// Mock URL handling
const mockPushState = vi.fn();
const originalPushState = window.history.pushState;

describe('Tab Navigation Tests', () => {
  beforeEach(() => {
    // Setup mocks
    window.history.pushState = mockPushState;
    // Clear URL parameters
    window.history.replaceState({}, '', '/');
  });

  afterEach(() => {
    // Restore original function
    window.history.pushState = originalPushState;
    vi.clearAllMocks();
  });

  it('should render the Employee tab by default', async () => {
    render(
      <BrowserRouter>
        <EmployeeProvider>
          <DocumentProvider>
            <EmployeeTab />
          </DocumentProvider>
        </EmployeeProvider>
      </BrowserRouter>
    );

    // Check that the default tab is rendered
    await waitFor(() => {
      expect(screen.getByText('Employees')).toBeInTheDocument();
    });
  });

  it('should navigate between tabs and preserve state', async () => {
    render(
      <BrowserRouter>
        <EmployeeProvider>
          <DocumentProvider>
            <EmployeeTab />
          </DocumentProvider>
        </EmployeeProvider>
      </BrowserRouter>
    );

    // Find and click Monthly Sales tab
    const monthlySalesTab = screen.getByText('Monthly Sales');
    fireEvent.click(monthlySalesTab);

    // Verify URL change
    await waitFor(() => {
      expect(mockPushState).toHaveBeenCalledWith(
        expect.anything(),
        '',
        expect.stringContaining('tab=sales')
      );
    });

    // Go back to Employees tab
    const employeesTab = screen.getByText('Employees');
    fireEvent.click(employeesTab);

    // Verify URL change again
    await waitFor(() => {
      expect(mockPushState).toHaveBeenCalledWith(
        expect.anything(),
        '',
        expect.stringContaining('tab=employees')
      );
    });
  });

  it('should load the correct tab based on URL parameters', async () => {
    // Set URL parameter to sales tab
    window.history.replaceState({}, '', '?tab=sales');

    render(
      <BrowserRouter>
        <EmployeeProvider>
          <DocumentProvider>
            <EmployeeTab />
          </DocumentProvider>
        </EmployeeProvider>
      </BrowserRouter>
    );

    // Check that the Sales tab is active
    await waitFor(() => {
      const monthlySalesTab = screen.getByText('Monthly Sales');
      expect(monthlySalesTab.classList.contains('border-blue-500')).toBeTruthy();
    });
  });

  it('should display employee data consistently across tabs', async () => {
    render(
      <BrowserRouter>
        <EmployeeProvider>
          <DocumentProvider>
            <EmployeeTab />
          </DocumentProvider>
        </EmployeeProvider>
      </BrowserRouter>
    );

    // Check that employee data is displayed
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    // Navigate to Monthly Sales tab
    const monthlySalesTab = screen.getByText('Monthly Sales');
    fireEvent.click(monthlySalesTab);

    // Employee data should still be accessible in context
    await waitFor(() => {
      // Sales tab might not display employee names directly, 
      // but we can verify tab navigation worked
      expect(mockPushState).toHaveBeenCalledWith(
        expect.anything(),
        '',
        expect.stringContaining('tab=sales')
      );
    });

    // Go back to Employees tab
    const employeesTab = screen.getByText('Employees');
    fireEvent.click(employeesTab);

    // Employee data should still be there
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('should handle document tab navigation correctly', async () => {
    render(
      <BrowserRouter>
        <EmployeeProvider>
          <DocumentProvider>
            <EmployeeTab />
          </DocumentProvider>
        </EmployeeProvider>
      </BrowserRouter>
    );

    // First, select an employee (may need to be adjusted based on your UI)
    const employeeCard = screen.getByText('John Doe').closest('div');
    fireEvent.click(employeeCard);

    // Look for Documents tab in the employee detail view and click it
    const documentsTab = await screen.findByText('Documents');
    fireEvent.click(documentsTab);

    // Verify document section is displayed
    await waitFor(() => {
      expect(screen.getByText('Employee Documents')).toBeInTheDocument();
    });
  });
}); 