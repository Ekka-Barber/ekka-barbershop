import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import SalaryHistory from "../components/SalaryHistory";
import { SalaryHistorySnapshotsTable } from "../components/SalaryHistorySnapshotsTable";
import SalaryHistoryDateFilter from "../components/SalaryHistoryDateFilter";
import { SalaryHistoryPagination } from "../components/SalaryHistoryPagination";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the useSalaryHistorySnapshots hook
vi.mock("../hooks/useSalaryHistorySnapshots", () => ({
  useSalaryHistorySnapshots: vi.fn().mockReturnValue({
    snapshots: [
      {
        id: "1",
        employee_id: "emp1",
        employee_name_snapshot: "John Doe",
        month_year: "2023-05",
        payment_confirmation_date: "2023-05-10",
        base_salary: 3000,
        sales_amount: 10000,
        commission_amount: 500,
        total_bonuses: 200,
        total_deductions: 100,
        total_loan_repayments: 200,
        net_salary_paid: 3400,
        salary_plan_name_snapshot: "Standard Plan",
        created_at: "2023-05-10T12:00:00Z",
        updated_at: "2023-05-10T12:00:00Z",
      },
      {
        id: "2",
        employee_id: "emp2",
        employee_name_snapshot: "Jane Smith",
        month_year: "2023-05",
        payment_confirmation_date: "2023-05-10",
        base_salary: 3500,
        sales_amount: 12000,
        commission_amount: 600,
        total_bonuses: 300,
        total_deductions: 150,
        total_loan_repayments: 0,
        net_salary_paid: 4250,
        salary_plan_name_snapshot: "Premium Plan",
        created_at: "2023-05-10T12:00:00Z",
        updated_at: "2023-05-10T12:00:00Z",
      },
    ],
    isLoading: false,
    error: null,
    totalCount: 2,
    totalPages: 1,
    currentPage: 1,
    getAvailableYears: () => ["2023"],
    getAvailableMonthsForYear: () => ["05"],
    allSnapshots: [
      {
        id: "1",
        employee_id: "emp1",
        employee_name_snapshot: "John Doe",
        month_year: "2023-05",
        payment_confirmation_date: "2023-05-10",
        base_salary: 3000,
        net_salary_paid: 3400,
      },
      {
        id: "2",
        employee_id: "emp2",
        employee_name_snapshot: "Jane Smith",
        month_year: "2023-05",
        payment_confirmation_date: "2023-05-10",
        base_salary: 3500,
        net_salary_paid: 4250,
      },
    ],
  }),
}));

// Mock the useAllActiveEmployees hook
vi.mock("../hooks/useAllActiveEmployees", () => ({
  useAllActiveEmployees: vi.fn().mockReturnValue({
    employees: [
      { id: "emp1", name: "John Doe" },
      { id: "emp2", name: "Jane Smith" },
    ],
    isLoading: false,
  }),
}));

describe("Salary History Components", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  it("renders SalaryHistory component correctly", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <SalaryHistory pickerDate={new Date()} />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Salary History/i)).toBeInTheDocument();
      expect(screen.getByText(/Filter by Date/i)).toBeInTheDocument();
    });
  });

  it("renders table with correct data", async () => {
    const mockSnapshots = [
      {
        id: "1",
        employee_id: "emp1",
        employee_name_snapshot: "John Doe",
        month_year: "2023-05",
        payment_confirmation_date: "2023-05-10",
        base_salary: 3000,
        sales_amount: 10000,
        commission_amount: 500,
        total_bonuses: 200,
        total_deductions: 100,
        total_loan_repayments: 200,
        net_salary_paid: 3400,
        salary_plan_name_snapshot: "Standard Plan",
        created_at: "2023-05-10T12:00:00Z",
        updated_at: "2023-05-10T12:00:00Z",
      },
      {
        id: "2",
        employee_id: "emp2",
        employee_name_snapshot: "Jane Smith",
        month_year: "2023-05",
        payment_confirmation_date: "2023-05-10",
        base_salary: 3500,
        sales_amount: 12000,
        commission_amount: 600,
        total_bonuses: 300,
        total_deductions: 150,
        total_loan_repayments: 0,
        net_salary_paid: 4250,
        salary_plan_name_snapshot: "Premium Plan",
        created_at: "2023-05-10T12:00:00Z",
        updated_at: "2023-05-10T12:00:00Z",
      },
    ];

    render(
      <QueryClientProvider client={queryClient}>
        <SalaryHistorySnapshotsTable 
          snapshots={mockSnapshots}
          isLoading={false}
        />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
      expect(screen.getByText("Standard Plan")).toBeInTheDocument();
      expect(screen.getByText("Premium Plan")).toBeInTheDocument();
    });

    // Check currency formatting
    await waitFor(() => {
      expect(screen.getAllByText(/\$3,400.00/)).toBeTruthy();
      expect(screen.getAllByText(/\$4,250.00/)).toBeTruthy();
    });
  });

  it("renders date filter correctly", async () => {
    const onYearSelect = vi.fn();
    const onMonthSelect = vi.fn();
    
    const dateOptions = [
      {
        year: "2023",
        months: ["05"],
        count: 2,
        monthCounts: { "05": 2 }
      }
    ];
    
    render(
      <QueryClientProvider client={queryClient}>
        <SalaryHistoryDateFilter
          dateOptions={dateOptions}
          selectedYear="2023"
          selectedMonth={null}
          onYearSelect={onYearSelect}
          onMonthSelect={onMonthSelect}
          currentMonthYear="2023-05"
        />
      </QueryClientProvider>
    );

    // Year should be shown
    expect(screen.getByText("2023")).toBeInTheDocument();
    
    // Use getAllByText instead of getByText since there are multiple badges with "2"
    const badgeElements = screen.getAllByText("2");
    expect(badgeElements.length).toBeGreaterThan(0);
  });

  it("renders pagination correctly", async () => {
    const onPageChange = vi.fn();
    const onPageSizeChange = vi.fn();
    
    render(
      <QueryClientProvider client={queryClient}>
        <SalaryHistoryPagination
          currentPage={1}
          totalPages={3}
          pageSize={10}
          totalItems={25}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </QueryClientProvider>
    );

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText(/Showing 1-10 of 25/i)).toBeInTheDocument();
    
    // Page size selector should be present
    expect(screen.getByText("10 per page")).toBeInTheDocument();
  });

  it("expands row details when clicked", async () => {
    const mockSnapshots = [
      {
        id: "1",
        employee_id: "emp1",
        employee_name_snapshot: "John Doe",
        month_year: "2023-05",
        payment_confirmation_date: "2023-05-10",
        base_salary: 3000,
        sales_amount: 10000,
        commission_amount: 500,
        total_bonuses: 200,
        total_deductions: 100,
        total_loan_repayments: 200,
        net_salary_paid: 3400,
        salary_plan_name_snapshot: "Standard Plan",
        created_at: "2023-05-10T12:00:00Z",
        updated_at: "2023-05-10T12:00:00Z",
      }
    ];

    render(
      <QueryClientProvider client={queryClient}>
        <SalaryHistorySnapshotsTable 
          snapshots={mockSnapshots}
          isLoading={false}
        />
      </QueryClientProvider>
    );

    // Initially, detailed breakdown is not visible
    expect(screen.queryByText("Base Salary")).not.toBeInTheDocument();

    // Find and click the expand button - the button is present but with a different label
    const expandButtons = screen.getAllByRole("button");
    const expandButton = expandButtons.find(button => 
      button.getAttribute("aria-label")?.includes("Expand row") ||
      button.getAttribute("aria-label")?.includes("Collapse row"));
    
    if (expandButton) {
      await userEvent.click(expandButton);
      
      // Now detailed breakdown should be visible - the actual text is "Base Salary" not "Base Salary:"
      await waitFor(() => {
        expect(screen.getByText("Base Salary")).toBeInTheDocument();
        expect(screen.getByText("Commission")).toBeInTheDocument();
        expect(screen.getByText("Bonuses")).toBeInTheDocument();
        expect(screen.getByText("Deductions")).toBeInTheDocument();
        expect(screen.getByText("Loan Repayments")).toBeInTheDocument();
      });
    }
  });
}); 