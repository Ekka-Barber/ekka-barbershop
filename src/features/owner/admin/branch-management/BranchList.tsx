
import { Building, Star } from 'lucide-react';

import { Branch } from '@shared/hooks/useBranchManagement';
import { Card } from '@shared/ui/components/card';

interface BranchListProps {
  branches: Branch[];
  isLoading: boolean;
  selectedBranchId: string | null;
  onSelectBranch: (branchId: string) => void;
}

export const BranchList = ({ branches, isLoading, selectedBranchId, onSelectBranch }: BranchListProps) => {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-4 opacity-60 animate-pulse">
            <div className="h-5 w-3/4 bg-gray-200 rounded"></div>
            <div className="h-4 w-1/2 bg-gray-200 rounded mt-2"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (!branches || branches.length === 0) {
    return (
      <Card className="p-4 text-center text-muted-foreground">
        No branches found. Add your first branch.
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {branches.map((branch) => (
        <Card
          key={branch.id}
          className={`p-4 cursor-pointer transition-colors ${
            selectedBranchId === branch.id
              ? 'bg-primary/10 border-primary/30'
              : 'hover:bg-accent'
          }`}
          onClick={() => onSelectBranch(branch.id)}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <Building className="h-4 w-4 mr-2 text-muted-foreground" />
              <div>
                <p className="font-medium">{branch.name}</p>
                <p className="text-sm text-muted-foreground">{branch.address || 'No address'}</p>
              </div>
            </div>
            {branch.is_main && (
              <div className="bg-amber-100 px-2 py-1 rounded-md flex items-center">
                <Star className="h-3 w-3 text-amber-500 mr-1" />
                <span className="text-xs text-amber-700">Main</span>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};
