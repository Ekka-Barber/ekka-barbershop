import { useState } from 'react';
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface EmployeePathBuilderProps {
  value: string;
  onChange: (value: string) => void;
}

// Available employee data paths with descriptions and types
const EMPLOYEE_PATHS = [
  // Personal information
  { value: 'first_name', label: 'First Name', group: 'personal', type: 'text', description: 'Employee\'s first name' },
  { value: 'last_name', label: 'Last Name', group: 'personal', type: 'text', description: 'Employee\'s last name' },
  { value: 'email', label: 'Email', group: 'personal', type: 'text', description: 'Employee\'s email address' },
  { value: 'phone', label: 'Phone', group: 'personal', type: 'text', description: 'Employee\'s phone number' },
  { value: 'date_of_birth', label: 'Date of Birth', group: 'personal', type: 'date', description: 'Employee\'s date of birth' },
  { value: 'address', label: 'Address', group: 'personal', type: 'text', description: 'Employee\'s address' },
  
  // Employment details
  { value: 'hire_date', label: 'Hire Date', group: 'employment', type: 'date', description: 'Date employee was hired' },
  { value: 'job_title', label: 'Job Title', group: 'employment', type: 'text', description: 'Employee\'s job title' },
  { value: 'department', label: 'Department', group: 'employment', type: 'text', description: 'Employee\'s department' },
  { value: 'employment_status', label: 'Employment Status', group: 'employment', type: 'text', description: 'Full-time, part-time, etc.' },
  { value: 'employee_id', label: 'Employee ID', group: 'employment', type: 'text', description: 'Employee\'s unique identifier' },
  
  // Compensation data
  { value: 'base_salary', label: 'Base Salary', group: 'compensation', type: 'number', description: 'Employee\'s base salary amount' },
  { value: 'hourly_rate', label: 'Hourly Rate', group: 'compensation', type: 'number', description: 'Employee\'s hourly pay rate' },
  { value: 'commission_rate', label: 'Commission Rate', group: 'compensation', type: 'number', description: 'Employee\'s commission percentage' },
  { value: 'bonus_eligibility', label: 'Bonus Eligibility', group: 'compensation', type: 'boolean', description: 'Whether employee is eligible for bonuses' },
  { value: 'overtime_eligible', label: 'Overtime Eligible', group: 'compensation', type: 'boolean', description: 'Whether employee is eligible for overtime pay' },
  
  // Schedule information
  { value: 'weekly_hours', label: 'Weekly Hours', group: 'schedule', type: 'number', description: 'Standard weekly working hours' },
  { value: 'days_per_week', label: 'Days Per Week', group: 'schedule', type: 'number', description: 'Standard working days per week' },
  { value: 'shift_type', label: 'Shift Type', group: 'schedule', type: 'text', description: 'Morning, evening, night, etc.' },
  
  // Performance metrics
  { value: 'performance_rating', label: 'Performance Rating', group: 'performance', type: 'number', description: 'Employee\'s latest performance rating' },
  { value: 'sales_quota', label: 'Sales Quota', group: 'performance', type: 'number', description: 'Employee\'s sales target amount' },
  { value: 'attendance_rate', label: 'Attendance Rate', group: 'performance', type: 'number', description: 'Employee\'s attendance percentage' }
];

// Group definitions with colors
const GROUPS = [
  { id: 'personal', label: 'Personal Information', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'employment', label: 'Employment Details', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { id: 'compensation', label: 'Compensation', color: 'bg-green-50 text-green-700 border-green-200' },
  { id: 'schedule', label: 'Schedule', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'performance', label: 'Performance', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' }
];

export const EmployeePathBuilder = ({ value, onChange }: EmployeePathBuilderProps) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Find the selected path object
  const selectedPath = EMPLOYEE_PATHS.find(path => path.value === value);
  
  // Filter paths based on search term
  const filteredPaths = searchTerm.length > 0 
    ? EMPLOYEE_PATHS.filter(path => 
        path.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        path.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        path.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
        path.type.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : EMPLOYEE_PATHS;
  
  // Group paths by category
  const groupedPaths = filteredPaths.reduce((acc, path) => {
    if (!acc[path.group]) {
      acc[path.group] = [];
    }
    acc[path.group].push(path);
    return acc;
  }, {} as Record<string, typeof EMPLOYEE_PATHS>);
  
  // Get label for a group
  const getGroupLabel = (groupId: string) => {
    return GROUPS.find(g => g.id === groupId)?.label || groupId;
  };
  
  // Badge for displaying the data type
  const TypeBadge = ({ type }: { type: string }) => {
    const getTypeColor = (type: string) => {
      switch (type) {
        case 'text': return 'bg-slate-50 text-slate-700 border-slate-200';
        case 'number': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        case 'date': return 'bg-violet-50 text-violet-700 border-violet-200';
        case 'boolean': return 'bg-rose-50 text-rose-700 border-rose-200';
        default: return 'bg-gray-50 text-gray-700 border-gray-200';
      }
    };
    
    return (
      <Badge variant="outline" className={cn("ml-2 text-xs font-normal", getTypeColor(type))}>
        {type}
      </Badge>
    );
  };
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedPath ? (
            <div className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              <span>{selectedPath.label}</span>
              <TypeBadge type={selectedPath.type} />
            </div>
          ) : (
            <div className="flex items-center text-muted-foreground">
              <User className="mr-2 h-4 w-4" />
              <span>Select employee property</span>
            </div>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput 
            placeholder="Search employee properties..." 
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            <CommandEmpty>No properties found</CommandEmpty>
            <ScrollArea className="h-[300px]">
              {Object.keys(groupedPaths).map(groupId => (
                <CommandGroup key={groupId} heading={getGroupLabel(groupId)}>
                  {groupedPaths[groupId].map(path => (
                    <CommandItem
                      key={path.value}
                      value={path.value}
                      onSelect={() => {
                        onChange(path.value);
                        setOpen(false);
                      }}
                      className="flex items-center justify-between"
                    >
                      <div className="flex flex-col">
                        <div className="flex items-center">
                          <span>{path.label}</span>
                          <TypeBadge type={path.type} />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {path.description}
                        </span>
                      </div>
                      
                      {value === path.value && (
                        <Check className="h-4 w-4" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}; 
