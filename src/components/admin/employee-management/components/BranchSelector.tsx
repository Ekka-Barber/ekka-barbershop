
import { Branch } from '../types/index';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface BranchSelectorProps {
  branches: Branch[];
  selectedBranch: string | null;
  onChange: (branchId: string | null) => void;
}

export const BranchSelector: React.FC<BranchSelectorProps> = ({
  branches,
  selectedBranch,
  onChange
}) => {
  const handleBranchChange = (value: string) => {
    onChange(value === 'all' ? null : value);
  };
  
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Branch Filter</label>
      <Select 
        value={selectedBranch || 'all'} 
        onValueChange={handleBranchChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select Branch" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Branches</SelectItem>
          {branches.map((branch) => (
            <SelectItem key={branch.id} value={branch.id}>
              {branch.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default BranchSelector;
