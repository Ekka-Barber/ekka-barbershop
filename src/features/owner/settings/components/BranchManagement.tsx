import { useQueryClient } from '@tanstack/react-query';

import { BranchList } from './BranchList';
import { CreateBranchForm } from './CreateBranchForm';

export const BranchManagement = () => {
  const queryClient = useQueryClient();

  const handleBranchCreated = () => {
    queryClient.invalidateQueries({ queryKey: ['branches'] });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Branch Management</h3>
      <CreateBranchForm onSuccess={handleBranchCreated} />
      <BranchList />
    </div>
  );
};
