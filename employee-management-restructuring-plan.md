# Employee Management System Restructuring Plan

## Executive Summary

Based on the screenshot and requirements, we'll reorganize the employee management system to separate employee data management from sales tracking by:

1. Keeping the existing tab structure as a base
2. Creating two new tabs: "Employees" and "Monthly Sales"
3. Migrating relevant components to appropriate tabs
4. Adding a new document tracking system for employee credentials, including:
   - Health certificate (الشهادة الصحية) tracking
   - Residency permit (الإقامة) tracking
   - Work license (رخصة العمل) tracking
   - Custom document tracking with expiration warnings

***WARNING: This restructuring must preserve ALL existing functionality. The app is working perfectly and we're only making it better organized. This is purely a front-end code reorganization with the addition of document tracking.***

## Benefits of Document Tracking

The new document tracking system will provide several business benefits:

1. **Compliance Management**: Ensure all employees have valid and up-to-date required documentation
2. **Proactive Notifications**: Receive timely warnings about expiring documents before they become critical
3. **Centralized Records**: Store all important document information in one place with the employee record
4. **Visual Indicators**: See at-a-glance which employees have document issues that need attention
5. **Automatic Calculations**: System automatically calculates expiration dates and status based on configurable thresholds
6. **Simple Interface**: Easy-to-use forms for adding and managing document information

This feature will help prevent compliance issues, reduce administrative overhead, and ensure that employee documentation is always current and valid.

## Overall Architecture & Tabs Structure

| Current | Proposed |
|---------|----------|
| - Employee Grid (Main) | - Employees (New) |
| - Analytics | - Monthly Sales (New) |
| - Schedule | - Analytics |
| - Salary | - Schedule |
| - Leave | - Salary |
|  | - Leave |

## Component Inventory & File Structure

Understanding the current component structure is crucial for a successful migration:

### Top-Level Components

| File | Size | Description | Purpose | Migration Impact |
|------|------|-------------|---------|-----------------|
| `EmployeeTab.tsx` | 7.4KB | Main component | Container for all tabs | Source of truth during migration |
| `EmployeeAnalyticsDashboard.tsx` | 34KB | Analytics dashboard | Performance visualization | Keep intact |
| `LeaveManagement.tsx` | 23KB | Leave management | Time-off tracking | Keep intact |
| `ScheduleDisplay.tsx` | 10KB | Schedule component | Work schedule display | Keep intact |
| `SalesStatistics.tsx` | 9.1KB | Sales reporting | Sales data visualization | Move to Monthly Sales tab |
| `EmployeeCard.tsx` | 1.7KB | Employee card | Employee display component | Move to Employees tab |
| `MonthYearPicker.tsx` | 1.4KB | Date picker | Month/year selection | Shared component |
| `SalaryPlanSection.tsx` | 12KB | Salary management | Salary plan configuration | Keep intact |
| `lazy-loaded-tabs.tsx` | 1.5KB | Code splitting | Lazy loading for performance | Update with new tabs |
| `types.ts` | 171B | Type definitions | TypeScript interfaces | Expand for new components |

### Directory Structure

```
employee-management/
├── EmployeeTab.tsx                # Main container - KEEP AS SOURCE OF TRUTH
├── EmployeeAnalyticsDashboard.tsx # Analytics dashboard - DO NOT CHANGE API LOGIC
├── LeaveManagement.tsx            # Leave management interface
├── ScheduleDisplay.tsx            # Employee schedule display
├── SalesStatistics.tsx            # Sales reporting component - MIGRATE TO MONTHLY SALES
├── EmployeeCard.tsx               # Individual employee card - MIGRATE TO EMPLOYEES TAB
├── MonthYearPicker.tsx            # Date selection component
├── SalaryPlanSection.tsx          # Salary plan configuration
├── lazy-loaded-tabs.tsx           # Update with new tab structure
├── types.ts                       # Expand with new interfaces
├── tabs/                          # NEW DIRECTORY
│   ├── EmployeesTab.tsx           # NEW COMPONENT
│   ├── MonthlySalesTab.tsx        # NEW COMPONENT
├── salary/                        # Salary management components
├── hooks/                         # Custom React hooks
├── components/                    # Subcomponents
│   ├── performance/               # Performance-related components
│   ├── employee-list/             # NEW DIRECTORY
│   │   ├── EmployeeList.tsx       # NEW COMPONENT
│   │   └── EmployeeCard.tsx       # MIGRATED COMPONENT
│   ├── monthly-sales/             # NEW DIRECTORY
│   │   ├── SalesGrid.tsx          # NEW COMPONENT
│   │   ├── SalesHeader.tsx        # NEW COMPONENT
│   │   └── SalesInputCard.tsx     # NEW COMPONENT
├── context/                       # React context providers
└── employee-card/                 # Original employee card components
```

## Task Breakdown

### Phase 1: Preparation & Planning (Complexity: Low)
- [x] Analyze current component structure
- [x] Create component inventory
- [x] Define data flow requirements
- [x] Create component sketches for new tabs
- [x] Create TypeScript interfaces for new components

### Phase 2: New Tab Creation (Complexity: Medium)
- [ ] Create directory structure for new components
- [ ] Create "Employees" tab component
- [ ] Create "Monthly Sales" tab component
- [ ] Create employee document tracking components
- [ ] Update navigation component to include new tabs
- [ ] **Add "DO NOT CHANGE" guards around API logic**

### Phase 3: Data & Component Migration (Complexity: High)
- [ ] Refactor employee data hooks
- [ ] Migrate sales-specific logic to Monthly Sales tab
- [ ] Create document tracking hooks and context
- [ ] Update context providers for new structure
- [ ] Ensure URL state synchronization works with new tabs
- [ ] **Fix styling inconsistencies (exact Tailwind classes)**

### Phase 4: Testing & Refinement (Complexity: Medium)
- [ ] Test tab navigation
- [ ] Test data persistence across tabs
- [ ] Test document tracking functionality
- [ ] Resolve styling inconsistencies
- [ ] Add final polish and animations
- [ ] **Compare against original tab (side-by-side testing)**

### Phase 5: Routing & Final Integration (Complexity: Low)
- [ ] Implement proper routing for new tabs
- [ ] Update URLs for deep linking
- [ ] Final testing with original tab
- [ ] Documentation

## Implementation Details

### 1. Data Flow Requirements

See the complete implementation in the following location:
`src/components/admin/employee-management/data-flow-requirements.md`

Key highlights:
- Employee data flows from the Context through the Employee List to individual Employee Cards
- Sales data flows through the Month/Year picker to the Sales Grid and individual sales input cards
- Three critical hooks handle core functionality: useEmployeeManager, useEmployeeSales, and useBranchFilter

### 2. Component Structure & UI Sketches

See the complete implementation in the following location:
`src/components/admin/employee-management/component-sketches.md`

Key components:
- **EmployeesTab**: Container for the employee management interface
- **BranchSelector**: Dropdown for filtering employees by branch
- **EmployeeList**: Grid display of employee cards with pagination
- **EmployeeCard**: Individual employee display with tabbed interface
- **MonthlySalesTab**: Container for the monthly sales interface
- **SalesHeader**: Controls for the sales view (month/year selection, submit button)
- **SalesGrid**: Grid layout of sales input cards
- **SalesInputCard**: Input field for employee monthly sales

### 3. TypeScript Interfaces

See the complete implementation in the following location:
`src/components/admin/employee-management/types.ts`

Key interface groups:
- **Entity interfaces**: Employee, Branch, WeeklySchedule
- **Context interfaces**: EmployeeContextType, SalesContextType
- **Component Props**: All props for each component are properly typed
- **Hook Return Types**: Type definitions for all custom hooks

### 4. Employee Document Tracking System (NEW)

A new document tracking system will be integrated into the employee management interface, featuring:

#### Database Structure
```
employee_documents
- id (primary key)
- employee_id (foreign key to employees)
- document_name (string - name of the document)
- document_number (string - optional reference number)
- issue_date (date)
- expiry_date (date)
- duration_months (integer)
- status (enum: "valid", "expiring_soon", "expired")
- notification_threshold_days (integer)
- notes (text - optional)
- created_at (timestamp)
- updated_at (timestamp)
```

#### Key Features
- Track critical employee documents such as health certificates (الشهادة الصحية), residency permits (الإقامة), and work licenses (رخصة العمل)
- Simple document creation with just a name and dates
- Automatic expiration calculation based on issue date and duration
- Visual warnings for soon-to-expire documents
- Notification system for document renewal reminders
- No file uploads required - just track the metadata

#### UI Components
- **DocumentsTab**: New tab in the employee card interface for document management
- **DocumentList**: List of employee documents with status indicators
- **DocumentForm**: Form for adding/editing document information
- **DocumentStatusBadge**: Visual indicator for document status (valid, expiring, expired)
- **ExpiryWarningBanner**: Banner showing soon-to-expire documents on employee card

#### Data Flow
```
┌───────────────────┐     ┌───────────────────┐     ┌───────────────────┐
│  Employee Context │────▶│   Employee Card   │────▶│   Documents Tab   │
└───────────────────┘     └───────────────────┘     └───────────────────┘
         │                                                    │
         │                                                    │
         ▼                                                    ▼
┌───────────────────┐                             ┌───────────────────┐
│ Document Context  │                             │   Document List   │
└───────────────────┘                             └───────────────────┘
```

## UI Mockups

### Employee Card with Document Warning
```
┌────────────────────────────────────────────────────────────────────────┐
│ ┌───┐ John Doe                                                         │
│ └───┘ Barber                                                           │
│                                                                        │
│ ⚠️ Documents Expiring Soon                                             │
│ • Health Certificate - Expires on 12/15/2023                           │
│                                                                        │
│ ┌─────┬──────┬──────────┬───────────┐                                  │
│ │Info │Stats │Schedule  │Documents  │                                  │
│ └─────┴──────┴──────────┴───────────┘                                  │
│                                                                        │
│ [Tab content here]                                                     │
│                                                                        │
│ 📍 Downtown                                                            │
└────────────────────────────────────────────────────────────────────────┘
```

### Documents Tab View
```
┌────────────────────────────────────────────────────────────────────────┐
│ ┌───┐ John Doe                                                         │
│ └───┘ Barber                                                           │
│                                                                        │
│ ┌─────┬──────┬──────────┬───────────┐                                  │
│ │Info │Stats │Schedule  │Documents  │                                  │
│ └─────┴──────┴──────────┴───────────┘                                  │
│                                                                        │
│ Important Documents                            [+ Add Document]        │
│                                                                        │
│ ┌───────────────────────────────────────────────────────────────────┐  │
│ │ Health Certificate (الشهادة الصحية)        ⚠️ Expires in 15 days  │  │
│ │                                                                   │  │
│ │ Issue Date: 01/15/2023       Expiry Date: 12/15/2023              │  │
│ │ Document Number: HC123456789                                      │  │
│ │                                                                   │  │
│ │ Expires in 15 days                           [Edit] [Delete]      │  │
│ └───────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│ ┌───────────────────────────────────────────────────────────────────┐  │
│ │ Residency Permit (الإقامة)                         ✓ Valid         │  │
│ │                                                                   │  │
│ │ Issue Date: 05/10/2023       Expiry Date: 05/10/2025              │  │
│ │ Document Number: RP987654321                                      │  │
│ │                                                                   │  │
│ │ Valid for 1 year, 5 months                     [Edit] [Delete]    │  │
│ └───────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│ 📍 Downtown                                                            │
└────────────────────────────────────────────────────────────────────────┘
```

### Document Form
```
┌────────────────────────────────────────────────────────────────────────┐
│ Add New Document                                                       │
│ Add important documents like health certificates, residency permits... │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│ Document Name                                                          │
│ [Health Certificate (الشهادة الصحية)                               ]  │
│                                                                        │
│ Document Number (Optional)                                             │
│ [HC123456789                                                        ]  │
│                                                                        │
│ Issue Date                     │ Duration (Months)                     │
│ [2023-11-15                  ] │ [12                                ]  │
│                                │                                       │
│ Expiry Date (Auto-calculated)  │ Notification Threshold (Days)         │
│ [2024-11-15                  ] │ [30                                ]  │
│                                │ Days before expiry to show warnings   │
│                                                                        │
│ Notes (Optional)                                                       │
│ [                                                                    ] │
│ [                                                                    ] │
│ [                                                                    ] │
│                                                                        │
│                                                                        │
│ [Cancel]                                              [Save Document]  │
└────────────────────────────────────────────────────────────────────────┘
```

## API Endpoints for Documents

### REST API Endpoints

```
GET    /api/employee-documents/:employeeId      - Get all documents for an employee
POST   /api/employee-documents                  - Create a new document 
PUT    /api/employee-documents/:id              - Update a document
DELETE /api/employee-documents/:id              - Delete a document
```

### Custom Hooks Implementation

```tsx
/**
 * Custom hook for managing employee documents
 */
export const useEmployeeDocuments = (initialEmployeeId?: string) => {
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchDocuments = useCallback(async (employeeId: string) => {
    if (!employeeId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/employee-documents/${employeeId}`);
      
      if (!response.ok) {
        throw new Error(`Error fetching documents: ${response.statusText}`);
      }
      
      const data = await response.json();
      setDocuments(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Fetch documents on initial load if employeeId is provided
  useEffect(() => {
    if (initialEmployeeId) {
      fetchDocuments(initialEmployeeId);
    }
  }, [initialEmployeeId, fetchDocuments]);
  
  const addDocument = useCallback(async (document: Partial<EmployeeDocument>) => {
    try {
      const response = await fetch('/api/employee-documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(document),
      });
      
      if (!response.ok) {
        throw new Error(`Error adding document: ${response.statusText}`);
      }
      
      const newDocument = await response.json();
      setDocuments(prev => [...prev, newDocument]);
      return newDocument;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      throw err;
    }
  }, []);
  
  const updateDocument = useCallback(async (id: string, document: Partial<EmployeeDocument>) => {
    try {
      const response = await fetch(`/api/employee-documents/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(document),
      });
      
      if (!response.ok) {
        throw new Error(`Error updating document: ${response.statusText}`);
      }
      
      const updatedDocument = await response.json();
      setDocuments(prev => prev.map(doc => doc.id === id ? updatedDocument : doc));
      return updatedDocument;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      throw err;
    }
  }, []);
  
  const deleteDocument = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/employee-documents/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Error deleting document: ${response.statusText}`);
      }
      
      setDocuments(prev => prev.filter(doc => doc.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      throw err;
    }
  }, []);
  
  // Calculate document statistics
  const expiringSoonDocuments = useMemo(() => 
    documents.filter(doc => doc.status === 'expiring_soon'),
    [documents]
  );
  
  const expiredDocuments = useMemo(() => 
    documents.filter(doc => doc.status === 'expired'),
    [documents]
  );
  
  return {
    documents,
    isLoading,
    error,
    fetchDocuments,
    addDocument,
    updateDocument,
    deleteDocument,
    expiringSoonDocuments,
    expiredDocuments,
  };
};
```

## Document Status Calculation

```tsx
/**
 * Calculate document status and days remaining
 */
export const calculateDocumentStatus = (document: EmployeeDocument): DocumentCalculation => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const expiryDate = new Date(document.expiryDate);
  expiryDate.setHours(0, 0, 0, 0);
  
  const diffTime = expiryDate.getTime() - today.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const isExpired = daysRemaining < 0;
  const isExpiringSoon = !isExpired && daysRemaining <= document.notificationThresholdDays;
  
  let statusText = '';
  
  if (isExpired) {
    statusText = `Expired ${Math.abs(daysRemaining)} days ago`;
  } else if (isExpiringSoon) {
    statusText = daysRemaining === 0 ? 'Expires today' : `Expires in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`;
  } else {
    // Calculate remaining months and days for better readability
    const months = Math.floor(daysRemaining / 30);
    const remainingDays = daysRemaining % 30;
    
    if (months > 0) {
      statusText = `Valid for ${months} month${months !== 1 ? 's' : ''}`;
      if (remainingDays > 0) {
        statusText += `, ${remainingDays} day${remainingDays !== 1 ? 's' : ''}`;
      }
    } else {
      statusText = `Valid for ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`;
    }
  }
  
  return {
    daysRemaining,
    isExpired,
    isExpiringSoon,
    statusText,
    expiryDate,
  };
};
```

## Known Issues and Fixes

### Current Issues
1. **Employee data and sales data mixed in one view** - Makes the UI cluttered and less focused
2. **Tab navigation doesn't clearly separate employee management from sales tracking** - Creates cognitive overhead
3. **URL state needs to track multiple tabs** - Makes deeplink sharing less intuitive
4. **Overlarge components** - `EmployeeAnalyticsDashboard.tsx` is 34KB/864 lines
5. **Inconsistent styling** - Some Tailwind classes may vary between similar components

### Proposed Fixes
1. **Create dedicated tabs** - Separate concerns for better UI focus
2. **Refactor context providers** - Break down into smaller contexts for better performance
3. **Update URL strategy** - Create clear path parameters for each tab
4. **Preserve all existing features** - Ensure data flow integrity during refactoring
5. **Style harmonization** - Ensure consistent Tailwind classes across components

## Current Employee Card Structure

***IMPORTANT: This detailed breakdown helps understand what elements need to be migrated and where.***

### Employee Card Components
Each employee card currently contains:

1. **Employee Header**
   - Photo avatar image
   - Name (English and Arabic)
   - Role indicator

2. **Tab Navigation**
   - Info tab - Basic employee information
   - Statistics tab - Performance metrics
   - Financials tab - Salary and commission data

3. **Monthly Sales Amount Input**
   - Input field for numeric values
   - Currency display
   - Validation for numeric values only

4. **Branch Assignment Dropdown**
   - Current branch indicator
   - Branch selection options
   - Change handler for branch reassignment

5. **Weekly Schedule Display**
   - Day indicators (Sat through Fri)
   - Working status indicators (green check or red x)
   - Visual representation of employee work days

### Element Functions
| Element | Purpose | Current Location | Migration Destination |
|---------|---------|------------------|----------------------|
| Photo/Name | Employee identification | EmployeeGrid component | EmployeesTab |
| Sales Input | Record monthly sales | EmployeeGrid component | MonthlySalesTab |
| Branch Select | Assign employee to branch | EmployeeGrid component | EmployeesTab |
| Schedule Display | Show weekly schedule | EmployeeGrid component | EmployeesTab (summary), ScheduleTab (detailed) |
| Info Tab | Basic employee details | Employee card | EmployeesTab |
| Statistics Tab | Performance metrics | Employee card | Analytics tab or EmployeesTab |
| Financials Tab | Salary info | Employee card | Salary tab |

## API Logic Preservation Guidelines

***WARNING: DO NOT CHANGE API logic, data flow, and server communication.***

All code sections that handle API calls, data fetching, or state mutations should be wrapped with:

```tsx
// DO NOT CHANGE: API Logic - Critical data processing
const functionName = () => {
  // Original implementation
};
```

## Data Flow Architecture

```
┌─────────────────────┐
│EmployeeManagement.tsx│
└───────────┬─────────┘
            │
            ▼
┌─────────────────────┐
│   Context Providers  │◄────────┐
└───────────┬─────────┘          │
            │                    │
┌───────────┼─────────┐          │
│           │         │          │
▼           ▼         ▼          │
┌─────┐ ┌───────┐ ┌───────┐      │
│Empl.│ │Monthly│ │Other  │      │
│Tab  │ │Sales  │ │Tabs   │      │
└──┬──┘ └───┬───┘ └───────┘      │
   │        │                    │
   │        │                    │
   ▼        ▼                    │
┌─────────────────────┐          │
│   Data Hooks        │───────────┘
└─────────────────────┘
```

## Business Logic Preservation

***WARNING: Existing functionality MUST remain intact. All current features must continue to work exactly as before.***

The following core logic must be preserved during migration:

1. **Sales data submission** - Continue to use the same API endpoints and data formats
2. **Branch filtering** - Maintain the ability to filter employees by branch 
3. **Date selection** - Keep the month/year selection for sales data
4. **URL state synchronization** - Ensure all states are properly reflected in the URL
5. **Error handling** - Maintain all existing error states and recovery flows
6. **Toast notifications** - Keep the same user feedback mechanisms

## Migration Strategy

***IMPORTANT: Keep original tab intact as source of truth throughout the process***

1. **Copy, don't move** - Create new components by copying from existing ones
2. **Parallel development** - Both old and new tabs should be functional simultaneously
3. **Incremental testing** - Test each piece of migrated functionality against original
4. **Feature parity verification** - Use original tab as reference for correctness

## React TypeScript Best Practices

Follow these TypeScript best practices for implementation:

1. **Strong typing for all props and state** - No use of `any`
   ```tsx
   interface EmployeeTabProps {
     initialBranchId?: string | null;
   }
   ```

2. **Use React.FC pattern consistently**
   ```tsx
   const EmployeeTab: React.FC<EmployeeTabProps> = ({ initialBranchId }) => {
     // Component implementation
   };
   ```

3. **Leverage discriminated unions for complex state**
   ```tsx
   type EmployeeState = 
     | { status: 'loading' }
     | { status: 'error', error: Error }
     | { status: 'success', data: Employee[] };
   ```

4. **Use custom hooks for shared logic**
   ```tsx
   const useBranchFilter = (initialBranchId?: string | null) => {
     // Hook implementation
   };
   ```

5. **Prefer early returns for conditional rendering**
   ```tsx
   if (isLoading) return <LoadingSpinner />;
   if (error) return <ErrorMessage error={error} />;
   ```

## Technologies Used

| Technology | Purpose |
|------------|---------|
| React | UI Framework |
| TypeScript | Type safety |
| TailwindCSS | Styling |
| Lucide Icons | UI icons |
| React Context | State management |
| React Query | Data fetching |
| Suspense/Lazy | Code splitting |

## Progress Tracking

- Phase 1: 100% complete
- Phase 2: 40% complete (2/5 tasks completed)
  - Created directory structure for new components ✅
  - Created "Employees" tab component ✅
  - Created "Monthly Sales" tab component ✅
  - Preserved original "employee-grid" tab for backward compatibility ✅
  - Fixed import paths for components ✅
  - Remaining tasks: Document tracking components, API logic guards
- Phase 3: 0% complete
- Phase 4: 0% complete
- Phase 5: 0% complete
- Overall: 28% complete

## Implementation Order

***IMPORTANT: Fix issues first, then optimize. The following order is recommended:***

1. Create new tab components without changing existing ones
2. Set up navigation to the new tabs while keeping old tabs functional
3. Migrate functionality one piece at a time, testing at each step
4. Only remove old components after their replacements are fully tested
5. Implement routing as final step after all functionality is working

## Styling Guidelines

To ensure visual consistency:

1. **Copy exact Tailwind classes** from original components
2. **Use design system components** from UI library when available
3. **Document all style patterns** for reuse
4. **Compare visual output** side-by-side with original

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Data synchronization issues | High | Use shared context, comprehensive testing |
| Performance degradation | Medium | Implement memoization, code splitting |
| UI/UX inconsistency | Medium | Create shared component library, copy exact Tailwind classes |
| URL state conflicts | Medium | Develop comprehensive URL strategy |
| Breaking existing functionality | Very High | Implement changes incrementally with thorough testing |
| API logic modification | Very High | Add "DO NOT CHANGE" guards around API logic |

## Success Criteria

1. Users can navigate between Employee and Monthly Sales tabs
2. Monthly sales data can be entered and saved independently
3. Employee data management is separated from sales tracking
4. URL state correctly preserves all navigation parameters
5. Performance remains smooth with minimal loading times
6. UI is consistent across all tabs
7. ***All existing functionality works exactly as before***
8. Type safety is maintained throughout the codebase
9. Styling is consistent with original implementation

## Change Log

- Initial plan created [DATE]
- Updated with Component Inventory [DATE]
- Added migration strategy guidelines [DATE]
- Added styling guidelines [DATE]
- Added API Logic preservation guidelines [DATE]
- Added routing as separate phase [DATE]
- Completed Phase 1: Preparation & Planning [2023-11-14]
- Added reference to implementation documents [2023-11-14]
- Added employee document tracking system [2023-11-14]
- Updated database structure for document tracking [2023-11-14]
- Added UI mockups for document tracking [2023-11-14]
- Added code implementation details for document tracking [2023-11-14]
- Created directory structure for new components [2023-12-05]
- Created "Employees" tab component [2023-12-05]
- Created "Monthly Sales" tab component [2023-12-05]
- Updated tab navigation to include new tabs [2023-12-05]

## SQL Scripts

### Create Employee Documents Table

```sql
-- Create the employee_documents table for tracking document expirations
CREATE TABLE public.employee_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  document_name VARCHAR(255) NOT NULL,
  document_number VARCHAR(255),
  issue_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  duration_months INTEGER NOT NULL,
  notification_threshold_days INTEGER NOT NULL DEFAULT 30,
  notes TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'valid',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX idx_employee_documents_employee_id ON public.employee_documents(employee_id);

-- Add trigger to update status based on expiry date
CREATE OR REPLACE FUNCTION update_document_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.expiry_date < CURRENT_DATE THEN
    NEW.status = 'expired';
  ELSIF NEW.expiry_date < (CURRENT_DATE + (NEW.notification_threshold_days * INTERVAL '1 day')) THEN
    NEW.status = 'expiring_soon';
  ELSE
    NEW.status = 'valid';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_document_status
BEFORE INSERT OR UPDATE ON public.employee_documents
FOR EACH ROW EXECUTE FUNCTION update_document_status();

-- Add function to auto-update document statuses daily
CREATE OR REPLACE FUNCTION public.refresh_document_statuses()
RETURNS void AS $$
BEGIN
  UPDATE public.employee_documents
  SET updated_at = NOW()
  WHERE 
    (expiry_date < CURRENT_DATE AND status != 'expired')
    OR
    (expiry_date < (CURRENT_DATE + (notification_threshold_days * INTERVAL '1 day')) 
     AND expiry_date >= CURRENT_DATE
     AND status != 'expiring_soon')
    OR
    (expiry_date >= (CURRENT_DATE + (notification_threshold_days * INTERVAL '1 day')) 
     AND status != 'valid');
END;
$$ LANGUAGE plpgsql;
```

## Document Component Implementation

### TypeScript Interfaces

```tsx
// Document Tracking Types
export type DocumentStatus = 'valid' | 'expiring_soon' | 'expired';

export interface EmployeeDocument {
  id: string;
  employeeId: string;
  documentName: string;
  documentNumber?: string;
  issueDate: string;
  expiryDate: string;
  durationMonths: number;
  status: DocumentStatus;
  notificationThresholdDays: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentCalculation {
  daysRemaining: number;
  isExpired: boolean;
  isExpiringSoon: boolean;
  statusText: string;
  expiryDate: Date;
}

// Component Props
export interface DocumentsTabProps {
  employee: Employee;
}

export interface DocumentFormProps {
  document?: EmployeeDocument;
  employeeId: string;
  onSubmit: (document: Partial<EmployeeDocument>) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export interface DocumentStatusBadgeProps {
  status: DocumentStatus;
  daysRemaining?: number;
}

// Context Types
export interface DocumentContextType {
  documents: EmployeeDocument[];
  isLoading: boolean;
  error: Error | null;
  fetchDocuments: (employeeId: string) => Promise<void>;
  addDocument: (document: Partial<EmployeeDocument>) => Promise<void>;
  updateDocument: (id: string, document: Partial<EmployeeDocument>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  calculateStatus: (document: EmployeeDocument) => DocumentCalculation;
}
```

### DocumentsTab Component

```tsx
export const DocumentsTab: React.FC<DocumentsTabProps> = ({ employee }) => {
  const { documents, isLoading, error, fetchDocuments, addDocument, updateDocument, deleteDocument } = useEmployeeDocuments();
  const [isAddingDocument, setIsAddingDocument] = useState(false);
  const [editingDocument, setEditingDocument] = useState<EmployeeDocument | undefined>(undefined);
  
  useEffect(() => {
    fetchDocuments(employee.id);
  }, [employee.id, fetchDocuments]);
  
  const handleAddClick = () => {
    setEditingDocument(undefined);
    setIsAddingDocument(true);
  };
  
  const handleEditClick = (document: EmployeeDocument) => {
    setEditingDocument(document);
    setIsAddingDocument(true);
  };
  
  const handleFormCancel = () => {
    setIsAddingDocument(false);
    setEditingDocument(undefined);
  };
  
  const handleFormSubmit = async (document: Partial<EmployeeDocument>) => {
    try {
      if (editingDocument) {
        await updateDocument(editingDocument.id, document);
      } else {
        await addDocument({ ...document, employeeId: employee.id });
      }
      setIsAddingDocument(false);
      setEditingDocument(undefined);
    } catch (error) {
      console.error("Failed to save document:", error);
    }
  };
  
  if (error) {
    return (
      <div className="p-4 bg-destructive/10 text-destructive rounded-md">
        <p>Failed to load documents: {error.message}</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {isAddingDocument ? (
        <DocumentForm
          document={editingDocument}
          employeeId={employee.id}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          isSubmitting={false}
        />
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Important Documents</h3>
            <Button 
              onClick={handleAddClick} 
              size="sm"
              className="flex items-center"
            >
              <FilePlus className="h-4 w-4 mr-2" />
              Add Document
            </Button>
          </div>
          
          <DocumentList
            documents={documents}
            onEdit={handleEditClick}
            onDelete={deleteDocument}
            isLoading={isLoading}
          />
        </>
      )}
    </div>
  );
};
```

### DocumentForm Component (Simplified)

```tsx
export const DocumentForm: React.FC<DocumentFormProps> = ({
  document,
  employeeId,
  onSubmit,
  onCancel,
  isSubmitting
}) => {
  const [formData, setFormData] = useState<Partial<EmployeeDocument>>(
    document ? { ...document } : {
      employeeId,
      documentName: '',
      issueDate: new Date().toISOString().split('T')[0],
      durationMonths: 12,
      notificationThresholdDays: 30,
      status: 'valid'
    }
  );
  
  // Calculate expiry date based on issue date and duration
  const calculateExpiryDate = useCallback(() => {
    if (!formData.issueDate) return '';
    
    const issueDate = new Date(formData.issueDate);
    const expiryDate = new Date(issueDate);
    expiryDate.setMonth(expiryDate.getMonth() + (formData.durationMonths || 12));
    
    return expiryDate.toISOString().split('T')[0];
  }, [formData.issueDate, formData.durationMonths]);
  
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      expiryDate: calculateExpiryDate()
    }));
  }, [formData.issueDate, formData.durationMonths, calculateExpiryDate]);
  
  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{document ? 'Edit Document' : 'Add New Document'}</CardTitle>
          <CardDescription>
            {document 
              ? 'Update the information for this document' 
              : 'Add important documents like health certificates, residency permits, etc.'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="documentName">Document Name</Label>
              <Input 
                id="documentName" 
                value={formData.documentName || ''} 
                onChange={(e) => handleChange('documentName', e.target.value)}
                placeholder="e.g. Health Certificate (الشهادة الصحية)"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="documentNumber">Document Number (Optional)</Label>
              <Input 
                id="documentNumber" 
                value={formData.documentNumber || ''} 
                onChange={(e) => handleChange('documentNumber', e.target.value)}
                placeholder="Enter reference number"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="issueDate">Issue Date</Label>
              <Input 
                id="issueDate"
                type="date"
                value={formData.issueDate ? formData.issueDate.toString().split('T')[0] : ''}
                onChange={(e) => handleChange('issueDate', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="durationMonths">Duration (Months)</Label>
              <Input 
                id="durationMonths"
                type="number"
                min="1"
                max="120"
                value={formData.durationMonths || 12}
                onChange={(e) => handleChange('durationMonths', parseInt(e.target.value))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date (Auto-calculated)</Label>
              <Input 
                id="expiryDate"
                type="date"
                value={formData.expiryDate ? formData.expiryDate.toString().split('T')[0] : ''}
                disabled
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notificationThreshold">Notification Threshold (Days)</Label>
              <Input 
                id="notificationThreshold"
                type="number"
                min="1"
                max="180"
                value={formData.notificationThresholdDays || 30}
                onChange={(e) => handleChange('notificationThresholdDays', parseInt(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">Days before expiry to show warnings</p>
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea 
                id="notes"
                value={formData.notes || ''}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Add any additional notes"
                rows={3}
              />
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Document'
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};
```

## Implementation Steps for Document Tracking

### 1. Database Setup

1. Create the `employee_documents` table in Supabase using the SQL script provided
2. Set up proper RLS (Row Level Security) policies to control access
3. Create indexes for optimal query performance

### 2. Backend Implementation

1. Create Supabase API endpoints for document CRUD operations
2. Implement status calculation logic as a database function
3. Set up automatic status updates using database triggers

### 3. Frontend Implementation

1. Create the document tracking components:
   - DocumentsTab
   - DocumentList
   - DocumentForm
   - DocumentStatusBadge
   - ExpiryWarningBanner

2. Implement the useEmployeeDocuments hook for data management

3. Integrate the components into the employee card:
   - Add a new "Documents" tab
   - Add the warning banner to show expiring documents
   - Implement document CRUD operations

### 4. Testing Strategy

1. Test document creation and management:
   - Can create documents with different durations
   - Expiry date is correctly calculated from duration
   - Status is updated based on expiry date

2. Test expiration logic:
   - Documents show correct warning status based on configured threshold
   - Expired documents are clearly marked

3. Test UI integration:
   - Warning banner appears for employees with expiring documents
   - Documents tab shows proper list of documents
   - Form validation works correctly

### 5. Deployment Steps

1. Deploy database changes through Supabase migrations
2. Add new components to the frontend build
3. Verify functionality in staging environment before production release

## Document Tracking Integration with Employee Card

To integrate the document tracking system with the existing employee card component, we'll modify the EmployeeCard component as follows:

```tsx
export const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee }) => {
  const [activeTab, setActiveTab] = useState<string>("info");
  const { documents } = useEmployeeDocuments(employee.id);
  
  // Filter for expired or expiring documents
  const criticalDocuments = useMemo(() => 
    documents.filter(doc => doc.status === 'expired' || doc.status === 'expiring_soon'),
    [documents]
  );
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={employee.profilePicture} alt={employee.name} />
            <AvatarFallback>{employee.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{employee.name}</CardTitle>
            <CardDescription>{employee.role}</CardDescription>
          </div>
        </div>
        
        {/* Show warning banner if there are critical documents */}
        {criticalDocuments.length > 0 && (
          <div className="mt-3">
            <ExpiryWarningBanner documents={criticalDocuments} />
          </div>
        )}
      </CardHeader>
      
      <CardContent className="pb-2">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>
          
          <TabsContent value="info" className="pt-4">
            <EmployeeInfoTab employee={employee} />
          </TabsContent>
          
          <TabsContent value="stats" className="pt-4">
            <EmployeeStatsTab employee={employee} />
          </TabsContent>
          
          <TabsContent value="schedule" className="pt-4">
            <EmployeeScheduleTab employee={employee} />
          </TabsContent>
          
          <TabsContent value="documents" className="pt-4">
            <DocumentsTab employee={employee} />
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-2">
        <BranchBadge branchId={employee.branchId} />
        <EmployeeCardActions employee={employee} />
      </CardFooter>
    </Card>
  );
};
``` 