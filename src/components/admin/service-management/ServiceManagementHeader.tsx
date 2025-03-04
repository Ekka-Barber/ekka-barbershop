
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ServiceManagementHeaderProps {
  totalCategories: number;
  totalServices: number;
  onSearch: (query: string) => void;
  onSort: (value: string) => void;
  onFilter: (value: string) => void;
}

export const ServiceManagementHeader = ({
  totalCategories,
  totalServices,
  onSort,
  onFilter,
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
        <div className="flex flex-wrap items-center gap-2">
          <Select onValueChange={onSort} defaultValue="name">
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="services">Most Services</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={onFilter} defaultValue="all">
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="empty">Empty Categories</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
