import { useQueryClient } from '@tanstack/react-query';

import { CreateSponsorForm } from './CreateSponsorForm';
import { SponsorList } from './SponsorList';

export const SponsorManagement = () => {
  const queryClient = useQueryClient();

  const handleSponsorCreated = () => {
    queryClient.invalidateQueries({ queryKey: ['sponsors'] });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Sponsor Management</h3>
      <CreateSponsorForm onSuccess={handleSponsorCreated} />
      <SponsorList />
    </div>
  );
};
