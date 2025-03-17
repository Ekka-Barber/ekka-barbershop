import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface ServiceManagementHeaderProps {
  totalCategories: number;
  totalServices: number;
  onSearch?: (query: string) => void;
  onSort: (value: string) => void;
}

export const ServiceManagementHeader = ({
  totalCategories,
  totalServices,
  onSearch,
  onSort,
}: ServiceManagementHeaderProps) => {
  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold">
            Service Management
          </h2>
          <p className="text-sm text-muted-foreground">
            {totalCategories} categories • {totalServices} services
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {onSearch && (
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search services..."
                className="pl-8 w-full sm:w-[200px]"
                onChange={(e) => onSearch(e.target.value)}
              />
            </div>
          )}
          
          <Select onValueChange={onSort} defaultValue="name">
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="services">Most Services</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
