// Settings feature barrel exports

// Main settings components
export { EmployeeManagement } from './EmployeeManagement';

// Employee management components
export { EmployeeDialog } from './EmployeeDialog';
export { EmployeeForm } from './EmployeeForm';
export { EmployeeTable } from './EmployeeTable';
export { EmployeeRow } from './EmployeeRow';

// Branch management components
export { BranchManagement } from './BranchManagement';
export { BranchList } from './BranchList';
export { BranchTable } from './BranchTable';
export { CreateBranchForm } from './CreateBranchForm';
export { EditBranchForm } from './EditBranchForm';
export { DeleteBranchDialog } from './DeleteBranchDialog';
export { EditBranchDialog } from './EditBranchDialog';
export { ImageUpload } from './ImageUpload';

// Sponsor management components
export { SponsorManagement } from './SponsorManagement';
export { SponsorList } from './SponsorList';
export { SponsorTable } from './SponsorTable';
export { CreateSponsorForm } from './CreateSponsorForm';
export { DeleteSponsorDialog } from './DeleteSponsorDialog';

// Hooks
export { useEmployeeActions } from './useEmployeeActions';
export { useEmployeeForm } from './useEmployeeForm';
export { useEmployeeManagement } from './useEmployeeManagement';
export { useEmployeeQueries } from './useEmployeeQueries';
export { useEmployeeRealtime } from './useEmployeeRealtime';

// Types
export * from './EmployeeManagementTypes';
