# Employee Management System Documentation

## Overview

The Employee Management System has been restructured to separate employee data management from sales tracking. This documentation provides comprehensive information about the new architecture, components, and how to use the system.

## Table of Contents

1. [Architecture](#architecture)
2. [Tab Structure](#tab-structure)
3. [Components](#components)
4. [Data Flow](#data-flow)
5. [Document Tracking System](#document-tracking-system)
6. [Sales Management](#sales-management)
7. [Common Issues & Troubleshooting](#common-issues--troubleshooting)
8. [Future Enhancements](#future-enhancements)

## Architecture

The Employee Management System follows a modular architecture with clear separation of concerns:

```
employee-management/
├── EmployeeTab.tsx                # Main container component
├── components/                    # Reusable UI components
│   ├── employee-list/             # Employee listing components
│   │   ├── EmployeeList.tsx       # List of employees
│   │   ├── EnhancedEmployeeCard.tsx # Detailed employee card
│   │   └── documents/             # Document tracking components
│   ├── monthly-sales/             # Monthly sales components
│   │   ├── SalesGrid.tsx          # Grid of sales cards
│   │   ├── SalesInputCard.tsx     # Individual sales input card
│   │   └── MonthYearPicker.tsx    # Date selection component
│   └── BranchFilter.tsx           # Branch filtering component
├── tabs/                          # Tab components
│   ├── EmployeesTab.tsx           # Main employees tab
│   └── MonthlySalesTab.tsx        # Monthly sales management tab
├── hooks/                         # Business logic and data fetching
│   ├── useEmployeeManager.ts      # Employee data management
│   ├── useEmployeeSales.ts        # Sales data management
│   ├── useBranchManager.ts        # Branch filtering logic
│   └── useEmployeeDocuments.ts    # Document tracking logic
├── context/                       # Shared state management
│   ├── EmployeeContext.tsx        # Employee data context
│   └── DocumentContext.tsx        # Document tracking context
├── services/                      # API interactions
│   └── documentService.ts         # Document API service
├── types/                         # TypeScript definitions
│   ├── employee-types.ts          # Employee-related types
│   └── document-types.ts          # Document-related types
└── utils/                         # Utility functions
    └── style-helpers.ts           # Style consistency utilities
```

## Tab Structure

The system has been restructured to use the following tab organization:

| Tab Name | Purpose | Key Components |
|----------|---------|----------------|
| Employees | Employee data management | `EmployeesTab`, `EmployeeList`, `EnhancedEmployeeCard` |
| Monthly Sales | Sales tracking and management | `MonthlySalesTab`, `SalesGrid`, `SalesInputCard` |
| Analytics | Performance analysis | `EmployeeAnalyticsDashboard` |
| Schedule | Work schedule management | `ScheduleDisplay` |
| Salary | Salary plan management | `SalaryPlanSection` |
| Leave | Time-off tracking | `LeaveManagement` |

The original tab structure is also preserved for backward compatibility.

## Components

### Employee Management Components

#### EmployeeList

Displays a paginated list of employees with filtering options.

**Props:**
- `employees`: Array of employee objects
- `isLoading`: Boolean indicating loading state
- `branches`: Array of branch objects for filtering
- `pagination`: Pagination information
- `onPageChange`: Function to handle page changes
- `refetchEmployees`: Function to refresh employee data

#### EnhancedEmployeeCard

Displays detailed employee information with expandable sections.

**Props:**
- `employee`: Employee object with complete information
- `branches`: Array of branch objects
- `isExpanded`: Boolean for expanded state
- `onToggleExpand`: Function to toggle expanded state
- `onUpdate`: Optional callback when employee is updated

### Sales Management Components

#### SalesGrid

Displays a grid of employee sales cards with animations.

**Props:**
- `employees`: Array of employee objects
- `salesInputs`: Record of employee ID to sales value
- `onSalesChange`: Function to handle sales value changes
- `selectedDate`: Date object for the selected month/year
- `isLoading`: Boolean indicating loading state

#### SalesInputCard

Individual card for entering employee sales data.

**Props:**
- `employee`: Employee object
- `salesValue`: String containing the sales value
- `onChange`: Function to handle value changes
- `selectedDate`: Date object for the selected month

#### MonthYearPicker

Date picker for selecting month and year with smooth animations.

**Props:**
- `selectedDate`: Date object for the currently selected date
- `onChange`: Function to handle date changes

### Document Tracking Components

#### DocumentList

Displays a list of employee documents with status indicators.

**Props:**
- `employeeId`: ID of the employee
- `documents`: Array of document objects
- `onAddDocument`: Function to handle adding a new document
- `onEditDocument`: Function to handle editing a document
- `onDeleteDocument`: Function to handle deleting a document

#### DocumentForm

Form for adding or editing employee documents.

**Props:**
- `employeeId`: ID of the employee
- `document`: Optional document object (for editing)
- `onSubmit`: Function to handle form submission
- `onCancel`: Function to handle cancellation

## Data Flow

### Employee Data Flow

1. `EmployeeContext` provides employee data to all components
2. `useEmployeeManager` hook fetches and manages employee data
3. Branch filtering is applied through `useBranchManager`
4. Employee data flows down to `EmployeeList` and individual `EnhancedEmployeeCard` components

### Sales Data Flow

1. `MonthlySalesTab` uses `useEmployeeSales` hook to manage sales data
2. `MonthYearPicker` controls the selected month/year
3. Sales data flows down to `SalesGrid` and individual `SalesInputCard` components
4. Changes in sales inputs trigger `handleSalesChange` to update the sales values
5. `submitSalesData` sends the updated sales data to the server

### Document Data Flow

1. `DocumentContext` provides document data to relevant components
2. `useEmployeeDocuments` hook fetches and manages document data
3. Document data flows to `DocumentList` and individual document items
4. Document status (valid, expiring, expired) is calculated based on expiration dates

## Document Tracking System

The document tracking system allows management of employee credentials and documents with expiration tracking.

### Document Types

The system tracks several types of documents with expiration dates:
- Health certificate (الشهادة الصحية)
- Residency permit (الإقامة)
- Work license (رخصة العمل)
- Custom document types

### Document Status

Documents have three possible statuses:
1. **Valid**: Document is current and not close to expiration
2. **Expiring Soon**: Document is approaching its expiration date (within the notification threshold)
3. **Expired**: Document has passed its expiration date

### Notifications

The system provides visual indicators for document status:
- Green icon for valid documents
- Amber/yellow icon for documents expiring soon
- Red icon for expired documents

## Sales Management

The Monthly Sales tab provides a comprehensive interface for tracking and managing employee sales data.

### Features

1. **Date Selection**: Select month and year for sales data entry
2. **Branch Filtering**: Filter employees by branch
3. **Sales Analytics**:
   - Total sales for the selected month
   - Average sales per employee
   - Top performer identification
   - Month-over-month comparison
4. **Data Entry**: Input sales figures for each employee
5. **Data Validation**: Ensure valid numeric input
6. **Visualizations**: See sales trends and performance metrics

### User Experience Enhancements

The sales management interface includes several UX improvements:
- Animated transitions between months
- Visual feedback for data entry
- Loading states with skeleton UI
- Unsaved changes warning
- Branch-specific filtering of data

## Common Issues & Troubleshooting

### Missing Sales Data

If sales data isn't appearing for a specific month:
1. Check that the correct month and year are selected
2. Verify the branch filter is set correctly
3. Ensure employees are assigned to the correct branch
4. Check for any error messages in the browser console

### Document Tracking Issues

If documents aren't tracking properly:
1. Verify document dates are entered correctly (YYYY-MM-DD format)
2. Check that notification thresholds are set appropriately
3. Ensure employee IDs are correct in the document records
4. Verify API permissions for document operations

### Branch Filtering Problems

If branch filtering doesn't work as expected:
1. Ensure branches are properly loaded in the system
2. Check that employees have the correct `branch_id` assigned
3. Verify the URL state is being correctly updated
4. Check for any race conditions in the filtering logic

## Future Enhancements

Planned enhancements for the system include:

1. **Mobile Optimization**: Further improvements for mobile devices
2. **Advanced Analytics**: More detailed performance metrics and visualizations
3. **Batch Operations**: Bulk editing of employee data and documents
4. **Export Functionality**: Data export to CSV/Excel for reporting
5. **Notification System**: Email/SMS alerts for expiring documents
6. **Multi-language Support**: Complete internationalization of the interface

---

*Documentation last updated: May 19, 2024* 