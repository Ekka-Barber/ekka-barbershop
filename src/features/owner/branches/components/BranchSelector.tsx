import { useBranches } from '@shared/hooks/useBranches';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/ui/components/select';

interface BranchSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export const BranchSelector = ({ value, onChange }: BranchSelectorProps) => {
  const { branches, isLoading } = useBranches();

  return (
    <Select value={value} onValueChange={onChange} disabled={isLoading}>
      <SelectTrigger
        className="h-10 min-h-[44px] text-xs sm:text-sm w-[110px] xs:w-[130px] sm:w-[180px] rounded-full border border-border/60 bg-card/90 shadow-soft"
        aria-label="Select branch"
      >
        <SelectValue placeholder={isLoading ? 'Loading...' : 'Select branch'} />
      </SelectTrigger>
      <SelectContent className="min-w-[150px] sm:min-w-[180px]">
        <SelectItem value="all" className="py-2.5">
          All Branches
        </SelectItem>
        {branches?.map((branch) => (
          <SelectItem key={branch.id} value={branch.id} className="py-2.5">
            {branch.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
