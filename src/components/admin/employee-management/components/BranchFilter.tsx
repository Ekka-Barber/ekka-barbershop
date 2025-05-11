import React from 'react';
import { Button } from "@/components/ui/button";
import { Branch } from '../types';

interface BranchFilterProps {
  branches: Branch[];
  selectedBranch: string | null;
  onBranchChange: (branchId: string | null) => void;
  isLoading: boolean; // To disable buttons while loading initial branches
}

export const BranchFilter: React.FC<BranchFilterProps> = ({
  branches,
  selectedBranch,
  onBranchChange,
  isLoading
}) => {
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      <Button
        variant={selectedBranch === null ? "default" : "outline"}
        size="sm"
        onClick={() => onBranchChange(null)}
        aria-label="Show all branches"
        tabIndex={0}
        disabled={isLoading}
      >
        All Branches
      </Button>
      {branches.map(branch => (
        <Button
          key={branch.id}
          variant={selectedBranch === branch.id ? "default" : "outline"}
          size="sm"
          onClick={() => onBranchChange(branch.id)}
          aria-label={`Show ${branch.name} branch`}
          tabIndex={0}
          disabled={isLoading}
        >
          {branch.name}
        </Button>
      ))}
    </div>
  );
}; 