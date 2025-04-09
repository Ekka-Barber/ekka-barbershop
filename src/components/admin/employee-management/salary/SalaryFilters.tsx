import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Search, SlidersHorizontal, X } from 'lucide-react';

// Sorting options
const sortOptions = [
  { label: 'Name (A-Z)', value: 'name_asc' },
  { label: 'Name (Z-A)', value: 'name_desc' },
  { label: 'Salary (High to Low)', value: 'salary_desc' },
  { label: 'Salary (Low to High)', value: 'salary_asc' },
  { label: 'Commission (High to Low)', value: 'commission_desc' },
  { label: 'Base Salary (High to Low)', value: 'base_desc' }
];

interface SalaryFiltersProps {
  onSearchChange: (query: string) => void;
  onSortChange: (sortBy: string) => void;
  onMinSalaryChange: (minSalary: number | null) => void;
  onMaxSalaryChange: (maxSalary: number | null) => void;
}

export const SalaryFilters = ({ 
  onSearchChange, 
  onSortChange, 
  onMinSalaryChange, 
  onMaxSalaryChange 
}: SalaryFiltersProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('salary_desc');
  const [minSalary, setMinSalary] = useState<string>('');
  const [maxSalary, setMaxSalary] = useState<string>('');
  
  // Apply search filter
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearchChange(value);
  };
  
  // Apply sort filter
  const handleSortChange = (value: string) => {
    setSortBy(value);
    onSortChange(value);
  };
  
  // Apply min salary filter
  const handleMinSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMinSalary(value);
    
    // Convert to number or null
    const numValue = value ? parseInt(value, 10) : null;
    onMinSalaryChange(numValue);
  };
  
  // Apply max salary filter
  const handleMaxSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMaxSalary(value);
    
    // Convert to number or null
    const numValue = value ? parseInt(value, 10) : null;
    onMaxSalaryChange(numValue);
  };
  
  // Toggle advanced filters
  const toggleAdvanced = () => {
    setShowAdvanced(!showAdvanced);
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSortBy('salary_desc');
    setMinSalary('');
    setMaxSalary('');
    
    onSearchChange('');
    onSortChange('salary_desc');
    onMinSalaryChange(null);
    onMaxSalaryChange(null);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search employees..."
            className="pl-8"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1.5 h-7 w-7"
              onClick={() => {
                setSearchQuery('');
                onSearchChange('');
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {/* Sort Dropdown */}
        <div className="w-full sm:w-64">
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Advanced Filters Toggle */}
        <Button
          variant="outline"
          onClick={toggleAdvanced}
          className="flex items-center gap-1"
        >
          <SlidersHorizontal className="h-4 w-4 mr-1" />
          {showAdvanced ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </div>
      
      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 border rounded-md bg-background">
          <div className="space-y-2">
            <Label htmlFor="minSalary">Minimum Salary</Label>
            <Input
              id="minSalary"
              type="number"
              placeholder="Min Salary"
              value={minSalary}
              onChange={handleMinSalaryChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="maxSalary">Maximum Salary</Label>
            <Input
              id="maxSalary" 
              type="number"
              placeholder="Max Salary"
              value={maxSalary}
              onChange={handleMaxSalaryChange}
            />
          </div>
          
          <div className="col-span-1 sm:col-span-2 flex justify-end">
            <Button variant="outline" onClick={clearFilters}>
              Clear All Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}; 
