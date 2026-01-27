import { Search, X } from 'lucide-react';

import { Button } from '@shared/ui/components/button';
import { Input } from '@shared/ui/components/input';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (search: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  placeholder = 'Search...',
}) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
      <Input
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10"
      />
      {searchTerm && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-2 top-1.5 h-7 w-7 p-0"
          onClick={() => onSearchChange('')}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
};
