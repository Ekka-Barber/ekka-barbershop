
import { useState } from 'react';
import { useBranchManagement } from '@/hooks/useBranchManagement';
import { BranchList } from './BranchList';
import { BranchForm } from './BranchForm';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';

export const BranchesTab = () => {
  const [isAddingBranch, setIsAddingBranch] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const {
    branches,
    isLoading,
    selectedBranchId,
    setSelectedBranchId,
    selectedBranch,
    createBranch,
    updateBranch,
    deleteBranch,
    isCreating,
    isUpdating,
    isDeleting
  } = useBranchManagement();

  const handleCreateBranch = (data: any) => {
    createBranch(data);
    setIsAddingBranch(false);
  };

  const handleUpdateBranch = (data: any) => {
    if (selectedBranchId) {
      updateBranch({ id: selectedBranchId, data });
      setIsEditing(false);
    }
  };

  const handleDeleteBranch = () => {
    if (selectedBranchId) {
      deleteBranch(selectedBranchId);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (!selectedBranch) {
      setSelectedBranchId(null);
    }
  };

  const handleAddClick = () => {
    setSelectedBranchId(null);
    setIsAddingBranch(true);
    setIsEditing(false);
  };

  const handleCancelAdd = () => {
    setIsAddingBranch(false);
  };

  const handleBranchSelect = (branchId: string) => {
    setSelectedBranchId(branchId);
    setIsAddingBranch(false);
    setIsEditing(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Branch List</h3>
          <Button onClick={handleAddClick} size="sm">
            <Plus className="h-4 w-4 mr-2" /> Add Branch
          </Button>
        </div>
        <BranchList
          branches={branches || []}
          isLoading={isLoading}
          selectedBranchId={selectedBranchId}
          onSelectBranch={handleBranchSelect}
        />
      </div>
      
      <div className="md:col-span-2">
        {isAddingBranch ? (
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Add New Branch</h3>
            <BranchForm 
              onSubmit={handleCreateBranch}
              onCancel={handleCancelAdd}
              isSubmitting={isCreating}
              formType="create"
            />
          </Card>
        ) : selectedBranch && isEditing ? (
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Edit Branch</h3>
            <BranchForm
              branchData={selectedBranch}
              onSubmit={handleUpdateBranch}
              onCancel={handleCancelEdit}
              isSubmitting={isUpdating}
              formType="edit"
            />
          </Card>
        ) : selectedBranch ? (
          <Card className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium">Branch Details</h3>
              <div className="space-x-2">
                <Button onClick={handleEditClick} variant="outline" size="sm">
                  Edit
                </Button>
                <Button 
                  onClick={handleDeleteBranch} 
                  variant="destructive" 
                  size="sm"
                  disabled={selectedBranch.is_main || isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
            <BranchDetails branch={selectedBranch} />
          </Card>
        ) : (
          <Card className="p-6 flex flex-col items-center justify-center h-full">
            <p className="text-muted-foreground text-center mb-4">
              Select a branch to view details or add a new branch
            </p>
            <Button onClick={handleAddClick}>
              <Plus className="h-4 w-4 mr-2" /> Add Branch
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

const BranchDetails = ({ branch }: { branch: any }) => {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium text-muted-foreground">Basic Information</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          <div>
            <p className="text-sm font-medium">Name (English)</p>
            <p className="text-sm">{branch.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Name (Arabic)</p>
            <p className="text-sm">{branch.name_ar || '-'}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Main Branch</p>
            <p className="text-sm">{branch.is_main ? 'Yes' : 'No'}</p>
          </div>
          <div>
            <p className="text-sm font-medium">WhatsApp Number</p>
            <p className="text-sm">{branch.whatsapp_number || '-'}</p>
          </div>
        </div>
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-muted-foreground">Address</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          <div>
            <p className="text-sm font-medium">Address (English)</p>
            <p className="text-sm">{branch.address || '-'}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Address (Arabic)</p>
            <p className="text-sm">{branch.address_ar || '-'}</p>
          </div>
        </div>
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-muted-foreground">External Links</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          <div>
            <p className="text-sm font-medium">Google Maps URL</p>
            <p className="text-sm break-all">
              {branch.google_maps_url ? (
                <a href={branch.google_maps_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {branch.google_maps_url}
                </a>
              ) : '-'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Google Place ID</p>
            <p className="text-sm break-all">{branch.google_place_id || '-'}</p>
          </div>
        </div>
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-muted-foreground">Metadata</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          <div>
            <p className="text-sm font-medium">Created At</p>
            <p className="text-sm">{new Date(branch.created_at).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Updated At</p>
            <p className="text-sm">{new Date(branch.updated_at).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default { BranchesTab };
