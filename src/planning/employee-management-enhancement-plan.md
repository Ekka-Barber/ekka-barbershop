# Employee Management Enhancement & Mobile Optimization Plan

## Executive Summary

Based on the review of the previous restructuring plan and recent error reports, we've identified several areas that need immediate attention in the employee management system:

1. **Critical Bug Fixes**: Fix null/undefined property access errors in multiple tabs
2. **Mobile Responsiveness**: Ensuring the application works seamlessly on mobile devices
3. **Employee Creation**: Adding functionality to create new employees through a form interface
4. **Complete Employee Information**: Enhancing employee cards to display and edit all available data
5. **Country Flags**: Adding visual nationality indicators with real flag icons
6. **Edit Functionality**: Ensuring all employee details can be edited directly from the frontend

This plan outlines a comprehensive approach to implement these enhancements while maintaining the existing functionality and following established code patterns.

***NOTE: This plan builds on top of the previous restructuring which separated employee data from sales tracking.***

## Current Implementation Status

The employee management system has successfully:

1. Created two separate tabs for employee management and monthly sales ✅
2. Implemented document tracking for employee credentials ✅
3. Maintained backward compatibility with the original tab ✅
4. Established proper data flow between components ✅

However, the following critical issues need to be addressed:

1. **All secondary tabs (Analytics, Scheduling, Salary, Leave) are broken** ❌
   - Analytics tab: `Cannot read properties of undefined (reading 'filter')`
   - Scheduling tab: `Cannot read properties of undefined (reading 'filter')`
   - Salary tab: `Cannot read properties of undefined (reading 'length')`
   - Leave tab: `Cannot read properties of undefined (reading 'map')`

2. The following enhancements are also needed:
   - Mobile responsiveness is inadequate ❌
   - Employee creation functionality is missing ❌
   - Employee cards don't display all available information ❌
   - Nationality is shown as text without visual indicators ❌
   - Complete edit functionality for all employee fields is limited ❌

## Project Goals

1. **Fix all critical bugs** in Analytics, Scheduling, Salary, and Leave tabs
2. **Create a fully responsive mobile interface** for all employee management components
3. **Implement a new employee creation form** with validation
4. **Enhance employee cards** to show and edit all database fields
5. **Add country flag icons** for nationality visualization
6. **Ensure all employee details are editable** from the frontend

## Overall Architecture Updates

We'll maintain the existing tab structure while enhancing the components:

```
employee-management/
├── EmployeeTab.tsx                # Main container - PRESERVED
├── components/                    # Subcomponents
│   ├── employee-list/             # ENHANCED with responsive design
│   │   ├── EmployeeList.tsx       # ENHANCED with responsive layout
│   │   ├── EnhancedEmployeeCard.tsx # ENHANCED with complete info
│   │   └── documents/             # PRESERVED
│   ├── employee-form/             # NEW DIRECTORY
│   │   ├── EmployeeForm.tsx       # NEW COMPONENT
│   │   ├── EmployeeFormFields.tsx # NEW COMPONENT
│   │   └── EmployeeValidator.ts   # NEW UTILITY
│   ├── employee-detail/           # NEW DIRECTORY
│   │   ├── EmployeeDetailView.tsx # NEW COMPONENT
│   │   ├── EmployeeEditForm.tsx   # NEW COMPONENT
│   │   └── EmployeeDetailTabs.tsx # NEW COMPONENT
│   ├── ui/                        # NEW DIRECTORY
│   │   ├── CountryFlag.tsx        # NEW COMPONENT
│   │   ├── ResponsiveCard.tsx     # NEW COMPONENT
│   │   └── ResponsiveTable.tsx    # NEW COMPONENT
│   ├── monthly-sales/             # ENHANCED with responsive design
├── hooks/                         # ENHANCED
│   ├── useEmployeeForm.ts         # NEW HOOK
│   ├── useEmployeeValidation.ts   # NEW HOOK
│   ├── useEmployeeManager.ts      # ENHANCED
├── services/                      # ENHANCED
│   ├── employeeService.ts         # ENHANCED
├── utils/                         # ENHANCED
│   ├── responsive-helpers.ts      # NEW UTILITY
│   ├── country-flags.ts           # NEW UTILITY
│   ├── form-validators.ts         # NEW UTILITY
├── types/                         # ENHANCED
│   ├── employee-form-types.ts     # NEW TYPE DEFINITIONS
```

## Employee Database Fields

Based on the reviewed documents, the employee table contains the following fields that should be fully supported in our interface:

```
id               - UUID (primary key)
name             - Text (employee name)
name_ar          - Text (employee name in Arabic)
branch_id        - UUID (foreign key to branches table)
role             - Text (employee role)
nationality      - Text (employee nationality)
email            - Text (employee email address)
photo_url        - Text (URL to employee photo)
salary_plan_id   - UUID (foreign key to salary plans)
working_hours    - JSON (employee working hours)
off_days         - Array (days when employee is off)
previous_working_hours - JSON (historical working hours)
start_date       - Date (when employee started)
annual_leave_quota - Integer (leave days allowed per year)
created_at       - Timestamp (record creation date)
updated_at       - Timestamp (record last update date)
```

## Task Breakdown

### Phase 0: Critical Bug Fixes (Highest Priority)
- [x] **Root Cause Analysis**
  - [x] Analyze data flow in `EmployeeContext` provider
  - [x] Debug branch filter implementation
  - [x] Identify loading state handling issues
  - [x] Assess null/undefined propagation through component tree
  - [x] Create diagram of data dependencies between components

- [x] **Fix Analytics Tab**
  - [x] Fix `useTeamPerformanceData.ts` to handle undefined values before filtering
  - [x] Add proper loading states to prevent premature rendering
  - [x] Implement graceful fallbacks for missing data
  - [x] Add error boundaries specific to analytics components

- [x] **Fix Scheduling Tab**
  - [x] Fix `ScheduleHeader.tsx` to prevent filter method access on undefined
  - [x] Review schedule data structure and ensure proper initialization
  - [x] Add data validation for schedule entries
  - [x] Implement schedule loading states

- [x] **Fix Salary Tab**
  - [x] Fix `useSalaryData.ts` to check for undefined before accessing length
  - [x] Add defensive checks around salary calculations
  - [x] Implement proper loading indicators
  - [x] Ensure salary plan data is properly initialized

- [x] **Fix Leave Tab**
  - [x] Fix `LeaveManagement.tsx` to prevent map operation on undefined values
  - [x] Implement fallback UI for empty leave data
  - [x] Add data validation for leave entries
  - [x] Ensure proper loading states for leave management

- [x] **Global Improvements**
  - [x] Create safe collection utility functions for common operations (map, filter, reduce)
  - [x] Implement TypeScript utility types for nullable data handling
  - [x] Add type guards throughout the application
  - [x] Update all API response handling to check for empty/error responses

- [x] **Context & Provider Enhancements**
  - [x] Refactor `EmployeeContext` to provide default values for all properties
  - [x] Add data validation in context provider
  - [x] Implement proper loading state management in context
  - [x] Add error state handling in context provider
  - [x] Create selector hooks to safely access specific parts of context

- [x] **Error Handling Strategy**
  - [x] Implement graceful fallbacks for all components
  - [x] Add specific error messages for different failure scenarios
  - [x] Create user-friendly error displays with retry options
  - [x] Add error logging to help with debugging
  - [x] Implement global error boundary with recovery options

- [x] **Testing**
  - [x] Create comprehensive test cases for error scenarios
  - [x] Test with empty data sets
  - [x] Test with partial data
  - [x] Test branch filtering edge cases
  - [x] Verify loading states display correctly
  - [x] Test error recovery mechanisms

### Phase 1: Mobile Responsiveness Implementation
- [/] Analyze current components for mobile usability issues
  - [x] Implemented horizontally scrollable summary cards in `MonthlySalesTab.tsx`.
  - [x] Implemented horizontally scrollable summary cards in `EmployeeAnalyticsDashboard.tsx` (Individual Performance section).
  - [x] Enhanced `EmployeeAnalyticsDashboard.tsx`:
    - Restyled "Individual Performance" / "Team Performance" tabs for better UX (segmented control).
    - Made filter section in "Individual Performance" collapsible and improved layout.
- [x] Create responsive design system with breakpoints
- [x] Implement responsive layout for EmployeeList component
- [ ] Create mobile-friendly employee cards
- [ ] Optimize forms for touch interaction
- [ ] Implement responsive table alternatives
- [x] Create mobile navigation pattern for tabs
  - Note: Achieved by enhancing `EmployeeTabsNavigation.tsx` to be responsive and include a bottom-fixed mobile view, instead of a new `MobileTabNavigation.tsx` component.
- [ ] Test on various screen sizes and devices

### Phase 2: Employee Creation Form
- [ ] Design employee creation form layout
- [ ] Create form validation rules
- [ ] Implement form component with all required fields
- [ ] Add file upload for employee photo
- [ ] Create submission and error handling logic
- [ ] Connect to API endpoints
- [ ] Implement success and error states
- [ ] Add form navigation and cancel functionality

### Phase 3: Enhanced Employee Information Display
- [ ] Identify all available employee fields from database
- [ ] Design expanded employee card layout
- [ ] Implement tabbed interface for organizing information
- [ ] Create responsive detail view
- [ ] Integrate with existing document tracking
- [ ] Add visual indicators for important information
- [ ] Implement collapsed and expanded states

### Phase 4: Country Flag Integration
- [ ] Research country flag library or API
- [ ] Create country code mapping to ISO codes
- [ ] Implement CountryFlag component
- [ ] Add fallback for missing flags
- [ ] Integrate flags in employee cards and forms
- [ ] Optimize flag loading for performance
- [ ] Add tooltip with country name on hover

### Phase 5: Edit Functionality Enhancement
- [ ] Create edit mode for employee details
- [ ] Implement inline editing capabilities
- [ ] Design confirmation dialogs for changes
- [ ] Add validation for edited fields
- [ ] Create optimistic UI updates
- [ ] Implement proper error handling
- [ ] Add undo/revert functionality
- [ ] Ensure all fields are editable

## Implementation Details

### 0. Critical Bug Fixes Implementation

Based on the error stack traces, we need to implement fixes for the following issues:

#### Analytics Tab Fix (useTeamPerformanceData.ts)
```tsx
// BEFORE (problematic code):
const filteredEmployees = employees.filter(employee => 
  selectedBranchId === 'all' || employee.branch_id === selectedBranchId
);

// AFTER (fixed with null checks):
const filteredEmployees = employees?.filter(employee => 
  selectedBranchId === 'all' || employee.branch_id === selectedBranchId
) || [];
```

#### Scheduling Tab Fix (ScheduleHeader.tsx)
```tsx
// BEFORE (problematic code):
const branchEmployees = employees.filter(employee => 
  employee.branch_id === selectedBranchId || selectedBranchId === 'all'
);

// AFTER (fixed with null checks):
const branchEmployees = employees?.filter(employee => 
  employee.branch_id === selectedBranchId || selectedBranchId === 'all'
) || [];
```

#### Salary Tab Fix (useSalaryData.ts)
```tsx
// BEFORE (problematic code):
useEffect(() => {
  if (employees.length === 0) return;
  // ... rest of effect
}, [employees, selectedMonth]);

// AFTER (fixed with null checks):
useEffect(() => {
  if (!employees || employees.length === 0) return;
  // ... rest of effect
}, [employees, selectedMonth]);
```

#### Leave Tab Fix (LeaveManagement.tsx)
```tsx
// BEFORE (problematic code):
{employeeData.map(employee => (
  <EmployeeLeaveRow key={employee.id} employee={employee} />
))}

// AFTER (fixed with null checks):
{employeeData?.map(employee => (
  <EmployeeLeaveRow key={employee.id} employee={employee} />
)) || null}
```

#### Safe Collection Utility
```tsx
// safe-collection.ts
export const safeFilter = <T>(
  collection: T[] | undefined | null,
  predicate: (item: T) => boolean
): T[] => {
  if (!collection) return [];
  return collection.filter(predicate);
};

export const safeMap = <T, R>(
  collection: T[] | undefined | null,
  mapper: (item: T) => R
): R[] => {
  if (!collection) return [];
  return collection.map(mapper);
};
```

#### Enhanced Error Handling

```tsx
// error-handling.ts
import { createContext, useContext, useState } from 'react';

// Error context to provide app-wide error state
interface ErrorContextType {
  error: Error | null;
  setError: (error: Error | null) => void;
  clearError: () => void;
}

export const ErrorContext = createContext<ErrorContextType>({
  error: null,
  setError: () => {},
  clearError: () => {}
});

export const useErrorContext = () => useContext(ErrorContext);

export const ErrorProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [error, setError] = useState<Error | null>(null);
  
  const clearError = () => setError(null);
  
  return (
    <ErrorContext.Provider value={{ error, setError, clearError }}>
      {children}
    </ErrorContext.Provider>
  );
};

// Graceful fallback component
export const GracefulFallback: React.FC<{
  error: Error | null;
  retry?: () => void;
}> = ({ error, retry }) => {
  if (!error) return null;
  
  return (
    <div className="p-4 border rounded-md bg-red-50 text-red-800">
      <h3 className="font-semibold mb-2">Something went wrong</h3>
      <p className="text-sm mb-4">{error.message}</p>
      {retry && (
        <button 
          onClick={retry}
          className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded-md text-sm"
        >
          Try Again
        </button>
      )}
    </div>
  );
};
```

#### Enhanced Context Provider

```tsx
// enhanced-employee-context.tsx
export const EmployeeProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState('all');
  
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchEmployeesFromAPI();
        setEmployees(data || []); // Ensure we always set an array
      } catch (err) {
        console.error('Error fetching employees:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch employees'));
        setEmployees([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };
    
    fetchEmployees();
  }, []);
  
  // Safe filtering with branch ID
  const filteredEmployees = useMemo(() => {
    return safeFilter(
      employees,
      employee => selectedBranchId === 'all' || employee.branch_id === selectedBranchId
    );
  }, [employees, selectedBranchId]);
  
  // Provide safe default values for all properties
  const contextValue = {
    employees: employees || [],
    filteredEmployees,
    loading,
    error,
    selectedBranchId,
    setSelectedBranchId,
    // Other properties with safe defaults
  };
  
  return (
    <EmployeeContext.Provider value={contextValue}>
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <GracefulFallback 
          error={error} 
          retry={() => fetchEmployees()} 
        />
      ) : (
        children
      )}
    </EmployeeContext.Provider>
  );
};
```

#### Type-Safe Hooks

```tsx
// safe-hooks.ts
import { useMemo } from 'react';
import { useEmployeeContext } from './context/EmployeeContext';

// Type-safe hook for accessing filtered employees
export const useFilteredEmployees = () => {
  const { employees, selectedBranchId } = useEmployeeContext();
  
  return useMemo(() => {
    // Always return an array, never undefined
    if (!employees) return [];
    
    return employees.filter(employee => 
      selectedBranchId === 'all' || employee.branch_id === selectedBranchId
    );
  }, [employees, selectedBranchId]);
};

// Safe hook for employee by ID
export const useEmployeeById = (employeeId: string | undefined) => {
  const { employees } = useEmployeeContext();
  
  return useMemo(() => {
    if (!employeeId || !employees) return null;
    return employees.find(emp => emp.id === employeeId) || null;
  }, [employees, employeeId]);
};
```

### 1. Mobile Responsiveness Implementation

The responsive design will follow these principles:

1. **Mobile-First Approach**: Design for mobile first, then enhance for larger screens
2. **Responsive Breakpoints**:
   - Small: 0-640px (Mobile)
   - Medium: 641px-1024px (Tablet)
   - Large: 1025px+ (Desktop)

3. **Key Component Adaptations**:

#### EmployeeList
```tsx
// Mobile adaptation for EmployeeList
const EmployeeList = ({ employees }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {employees.map(employee => (
        <EmployeeCard key={employee.id} employee={employee} />
      ))}
    </div>
  );
};
```

#### ResponsiveCard
```tsx
// New component for responsive card layout
const ResponsiveCard = ({ children, className }) => {
  return (
    <div className={`
      w-full p-4 rounded-lg shadow 
      transition-all duration-200
      hover:shadow-md
      flex flex-col
      ${className}
    `}>
      {children}
    </div>
  );
};
```

#### Mobile Navigation
```tsx
// Mobile-friendly tab navigation
const MobileTabNavigation = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t md:hidden">
      <div className="flex justify-around">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`
              flex flex-col items-center py-2 px-4
              ${activeTab === tab.id ? 'text-primary' : 'text-gray-500'}
            `}
            onClick={() => onTabChange(tab.id)}
            aria-label={`Switch to ${tab.label} tab`}
          >
            {tab.icon}
            <span className="text-xs mt-1">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
```

### 2. Employee Creation Form Implementation

The employee creation form will:
- Support all employee fields
- Include proper validation
- Handle file uploads for photos
- Provide clear feedback on errors

```tsx
// Employee Form Structure
interface EmployeeFormProps {
  onSubmit: (data: EmployeeFormData) => void;
  onCancel: () => void;
  initialData?: Partial<EmployeeFormData>;
  isEdit?: boolean;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isEdit = false
}) => {
  const [formData, setFormData] = useState<EmployeeFormData>(initialData || {
    name: '',
    name_ar: '',
    branch_id: '',
    role: '',
    nationality: '',
    email: '',
    // Additional fields with defaults
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateEmployeeForm(formData);
    
    if (Object.keys(validationErrors).length === 0) {
      onSubmit(formData);
    } else {
      setErrors(validationErrors);
    }
  };
  
  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-6">
        {isEdit ? 'Edit Employee' : 'Create New Employee'}
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="col-span-1">
            <label className="block text-sm font-medium mb-1" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              aria-invalid={errors.name ? 'true' : 'false'}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>
          
          <div className="col-span-1">
            <label className="block text-sm font-medium mb-1" htmlFor="name_ar">
              Name (Arabic)
            </label>
            <input
              id="name_ar"
              name="name_ar"
              type="text"
              value={formData.name_ar || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              dir="rtl"
            />
          </div>
          
          <div className="col-span-1">
            <label className="block text-sm font-medium mb-1" htmlFor="role">
              Role
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.role ? 'border-red-500' : 'border-gray-300'
              }`}
              aria-invalid={errors.role ? 'true' : 'false'}
            >
              <option value="">Select a role</option>
              <option value="barber">Barber</option>
              <option value="receptionist">Receptionist</option>
              <option value="manager">Manager</option>
              {/* Add more roles as needed */}
            </select>
            {errors.role && (
              <p className="text-red-500 text-sm mt-1">{errors.role}</p>
            )}
          </div>
          
          <div className="col-span-1">
            <label className="block text-sm font-medium mb-1" htmlFor="branch_id">
              Branch
            </label>
            <select
              id="branch_id"
              name="branch_id"
              value={formData.branch_id}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.branch_id ? 'border-red-500' : 'border-gray-300'
              }`}
              aria-invalid={errors.branch_id ? 'true' : 'false'}
            >
              <option value="">Select a branch</option>
              {/* Branch options would be dynamically populated */}
            </select>
            {errors.branch_id && (
              <p className="text-red-500 text-sm mt-1">{errors.branch_id}</p>
            )}
          </div>
          
          {/* Add more form fields for remaining employee properties */}
        </div>
        
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            {isEdit ? 'Update Employee' : 'Create Employee'}
          </button>
        </div>
      </form>
    </div>
  );
};
```

### 3. Enhanced Employee Card Implementation

The enhanced employee card will display all information from the database in an organized, tabbed interface:

```tsx
// Enhanced Employee Card
const EnhancedEmployeeCard = ({ employee, onEdit, onDelete }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [isExpanded, setIsExpanded] = useState(false);
  
  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  // Format start date for display
  const formattedStartDate = useMemo(() => {
    if (!employee.start_date) return 'Not specified';
    return new Date(employee.start_date).toLocaleDateString();
  }, [employee.start_date]);
  
  return (
    <div className="bg-white rounded-lg shadow transition-all duration-200 overflow-hidden">
      {/* Card Header */}
      <div className="p-4 flex flex-col sm:flex-row items-center sm:items-start gap-4">
        <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0">
          {employee.photo_url ? (
            <img 
              src={employee.photo_url} 
              alt={employee.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <UserIcon className="w-10 h-10 text-gray-400" />
            </div>
          )}
        </div>
        
        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
            <h3 className="text-lg font-semibold">{employee.name}</h3>
            <CountryFlag country={employee.nationality} size="sm" />
          </div>
          <div className="text-gray-600 mb-1">{employee.role}</div>
          {employee.email && (
            <div className="text-sm text-gray-500 mb-1">{employee.email}</div>
          )}
          <div className="text-xs text-gray-500">
            Started {formattedStartDate}
          </div>
        </div>
        
        <div className="flex sm:flex-col gap-2">
          <button
            onClick={onEdit}
            className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100"
            aria-label="Edit employee"
          >
            <EditIcon className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100"
            aria-label="Delete employee"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
          <button
            onClick={handleToggleExpand}
            className="p-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100"
            aria-label={isExpanded ? "Collapse details" : "Expand details"}
          >
            {isExpanded ? (
              <ChevronUpIcon className="w-4 h-4" />
            ) : (
              <ChevronDownIcon className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
      
      {/* Expandable Content */}
      {isExpanded && (
        <div className="border-t border-gray-200">
          {/* Tabs Navigation */}
          <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide">
            <button
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                activeTab === 'general'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('general')}
            >
              General
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                activeTab === 'documents'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('documents')}
            >
              Documents
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                activeTab === 'schedule'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('schedule')}
            >
              Schedule
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                activeTab === 'leave'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('leave')}
            >
              Leave
            </button>
          </div>
          
          {/* Tab Content */}
          <div className="p-4">
            {activeTab === 'general' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-medium text-gray-500 mb-1">
                    Name (Arabic)
                  </h4>
                  <p className="text-sm" dir="rtl">
                    {employee.name_ar || 'Not provided'}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-500 mb-1">
                    Branch
                  </h4>
                  <p className="text-sm">
                    {employee.branch?.name || 'Not assigned'}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-500 mb-1">
                    Nationality
                  </h4>
                  <p className="text-sm flex items-center gap-1">
                    <CountryFlag country={employee.nationality} size="sm" />
                    {employee.nationality || 'Not specified'}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-500 mb-1">
                    Annual Leave
                  </h4>
                  <p className="text-sm">
                    {employee.annual_leave_quota || 0} days
                  </p>
                </div>
                {/* More employee details */}
              </div>
            )}
            
            {activeTab === 'documents' && (
              <div>
                {/* Existing document components would go here */}
              </div>
            )}
            
            {activeTab === 'schedule' && (
              <div>
                {/* Working hours and schedule information */}
              </div>
            )}
            
            {activeTab === 'leave' && (
              <div>
                {/* Leave information and history */}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
```

### 4. Country Flag Integration

We'll implement a CountryFlag component that displays the appropriate flag based on the country code:

```tsx
// Country Flag Component
interface CountryFlagProps {
  country: string;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
}

const CountryFlag: React.FC<CountryFlagProps> = ({ 
  country, 
  size = 'md',
  showName = false
}) => {
  const countryCode = useMemo(() => getCountryCode(country), [country]);
  const flagUrl = useMemo(() => getFlagUrl(countryCode), [countryCode]);
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };
  
  if (!country) {
    return showName ? <span className="text-sm text-gray-500">Unknown</span> : null;
  }
  
  return (
    <div className="flex items-center gap-1" title={country}>
      {flagUrl ? (
        <img 
          src={flagUrl} 
          alt={country} 
          className={`rounded-sm ${sizeClasses[size]}`}
          loading="lazy"
        />
      ) : (
        <div className={`bg-gray-200 rounded-sm ${sizeClasses[size]}`} />
      )}
      
      {showName && <span className="text-sm">{country}</span>}
    </div>
  );
};
```

### 5. Edit Functionality Enhancement

We'll implement a comprehensive edit form for all employee details:

```tsx
// Employee Edit Modal
const EmployeeEditModal = ({ employee, isOpen, onClose, onSave }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4 text-center sm:p-0">
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        ></div>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full md:max-w-2xl">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Edit Employee
              </h3>
              <button
                type="button"
                className="bg-white rounded-md text-gray-400 hover:text-gray-500"
                onClick={onClose}
              >
                <span className="sr-only">Close</span>
                <XIcon className="h-6 w-6" />
              </button>
            </div>
            
            <EmployeeForm
              initialData={employee}
              onSubmit={(data) => {
                onSave(data);
                onClose();
              }}
              onCancel={onClose}
              isEdit={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
```

## Technical Requirements

### Responsive Design System

To ensure consistent responsive behavior:

```tsx
// responsive-helpers.ts
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280
};

export const useBreakpoint = () => {
  const [width, setWidth] = useState(window.innerWidth);
  
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return {
    isSm: width >= breakpoints.sm,
    isMd: width >= breakpoints.md,
    isLg: width >= breakpoints.lg,
    isXl: width >= breakpoints.xl
  };
};
```

### Country Flags Utility

```tsx
// country-flags.ts
interface CountryMapping {
  [key: string]: string;
}

export const countryToISOMapping: CountryMapping = {
  'Saudi Arabia': 'SA',
  'UAE': 'AE',
  'United Arab Emirates': 'AE',
  'Egypt': 'EG',
  'Jordan': 'JO',
  'Lebanon': 'LB',
  'India': 'IN',
  'Pakistan': 'PK',
  'Philippines': 'PH',
  'Bangladesh': 'BD',
  'Nepal': 'NP',
  'Sri Lanka': 'LK',
  // Add more mappings as needed
};

export const getCountryCode = (country: string): string => {
  if (!country) return '';
  return countryToISOMapping[country] || '';
};

export const getFlagUrl = (countryCode: string): string => {
  if (!countryCode) return '';
  // Use a flag API or local images
  return `https://flagcdn.com/w20/${countryCode.toLowerCase()}.png`;
};
```

### Form Validation Utility

```tsx
// form-validators.ts
export const validateEmployeeForm = (data: EmployeeFormData) => {
  const errors: Partial<Record<keyof EmployeeFormData, string>> = {};
  
  if (!data.name) {
    errors.name = 'Name is required';
  }
  
  if (!data.role) {
    errors.role = 'Role is required';
  }
  
  if (!data.branch_id) {
    errors.branch_id = 'Branch is required';
  }
  
  if (data.email && !/^\S+@\S+\.\S+$/.test(data.email)) {
    errors.email = 'Invalid email format';
  }
  
  if (data.start_date) {
    const startDate = new Date(data.start_date);
    if (isNaN(startDate.getTime())) {
      errors.start_date = 'Invalid date format';
    }
  }
  
  if (data.annual_leave_quota && (isNaN(Number(data.annual_leave_quota)) || Number(data.annual_leave_quota) < 0)) {
    errors.annual_leave_quota = 'Annual leave must be a positive number';
  }
  
  return errors;
};
```

## Task Timeline & Priority

The plan will be executed in phases, with each phase taking approximately 1 week:

### Phase 0: Critical Bug Fixes (1 week)
- Priority: Critical - These bugs are blocking core functionality
- Week 1 (Days 1-2): Root cause analysis and implementation of utility functions
- Week 1 (Days 3-4): Fix individual tab issues and implement enhanced error handling
- Week 1 (Days 5): Comprehensive testing and validation across all tabs
- Week 1 (Days 6-7): Final bug fixes and edge case handling

### Phase 1: Mobile Responsiveness (1 week)
- Priority: High - This provides immediate value for mobile users
- Focus on high-impact components first: EmployeeList, EmployeeCard, forms

### Phase 2: Employee Creation Form
- Priority: High - This addresses a critical missing feature
- Implement complete validation and error handling

### Phase 3: Enhanced Employee Information
- Priority: Medium - Improves user experience for existing functionality
- Ensure all database fields are accessible

### Phase 4: Country Flag Integration
- Priority: Medium - Visual improvement for nationality information
- Implement with fallbacks for missing flags

### Phase 5: Edit Functionality
- Priority: High - Completes the CRUD functionality
- Ensure all fields are editable with proper validation

## Implementation Order

The updated implementation order:

1. Fix critical bugs in all tabs to restore core functionality
2. Implement responsive design patterns and utilities
3. Create mobile-friendly employee list view
4. Develop employee creation form
5. Enhance employee cards with complete information
6. Implement country flag component
7. Add edit functionality for all employee fields
8. Optimize layout for various screen sizes
9. Test and refine mobile experience

## Success Criteria

The project will be considered successful when:

1. All tabs (Analytics, Scheduling, Salary, Leave) function without errors
2. All components display correctly on mobile devices (320px width and above)
3. Users can create new employees with all required fields
4. Employee cards display all available information from the database
5. Country flags appear correctly for all nationalities
6. All employee fields can be editable through the frontend
7. Forms are easy to use on touch devices
8. Navigation works intuitively on all screen sizes
9. Performance remains smooth with up to 50 employees

## Risk Assessment & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Critical bugs remain in edge cases | High | Implement comprehensive null checking throughout app |
| Responsive layout breaking on certain devices | High | Test on multiple device sizes, use flexible layouts |
| Form validation issues with complex fields | Medium | Implement comprehensive validation with clear error messages |
| Country flag not available for certain countries | Low | Provide text fallback when flag not found |
| Touch targets too small on mobile | High | Follow minimum touch target size guidelines (at least 44x44px) |
| Form submission errors | High | Implement proper error handling and feedback |
| Image upload failures | Medium | Add retries and clear error messages |

## Testing Strategy

- **Device Testing**: Test on at least 3 different screen sizes (mobile, tablet, desktop)
- **Browser Testing**: Test on Chrome, Safari, Firefox, and Edge
- **Usability Testing**: Have actual users test the mobile interface
- **Form Testing**: Test all validation rules and error states
- **Editing Flow**: Verify that edit functionality works for all fields

## Progress Tracking

- Phase 0: Critical Bug Fixes - 100% complete
- Phase 1: Mobile Responsiveness - 55% complete (Tab navigation, several UI/UX enhancements in Sales & Analytics tabs)
- Phase 2: Employee Creation Form - 0% complete
- Phase 3: Enhanced Employee Information - 0% complete
- Phase 4: Country Flag Integration - 0% complete
- Phase 5: Edit Functionality - 0% complete

## Accessibility Considerations

To ensure the application is accessible to all users:

1. **Keyboard Navigation**: All interactive elements must be focusable and operable with keyboard
2. **Screen Reader Support**: Add appropriate ARIA labels and roles
3. **Touch Targets**: Ensure minimum 44x44px touch targets for mobile
4. **Color Contrast**: Maintain at least 4.5:1 contrast ratio for text
5. **Focus Indicators**: Provide visible focus indicators for interactive elements
6. **Error Messages**: Clearly associate error messages with form fields

## Mobile-Specific Enhancements

1. **Touch-Friendly Controls**:
   - Larger buttons and form controls
   - Adequate spacing between clickable elements
   - Swipe gestures for common actions

2. **Responsive Layout Patterns**:
   - Stack columns on small screens
   - Collapsible sections for better space utilization
   - Bottom sheet for additional options

3. **Performance Optimizations**:
   - Lazy load images and non-critical content
   - Optimize transitions and animations
   - Minimize network requests

4. **Mobile Navigation**:
   - Bottom navigation bar for primary actions
   - Simplified menus with larger hit areas
   - Clear back navigation

---

*Plan created: May 21, 2024*
*Plan updated: May 22, 2024* 