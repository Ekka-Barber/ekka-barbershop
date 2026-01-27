import { RotateCcw, X } from 'lucide-react';

import { Badge } from '@shared/ui/components/badge';
import { Button } from '@shared/ui/components/button';

interface ActiveFilter {
  key: string;
  label: string;
  value?: string;
  onRemove: () => void;
}

interface ActiveFiltersSummaryProps {
  filters: ActiveFilter[];
  onClearAll: () => void;
}

export const ActiveFiltersSummary: React.FC<ActiveFiltersSummaryProps> = ({
  filters,
  onClearAll,
}) => {
  if (filters.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="text-sm text-muted-foreground">Active filters:</span>

      {filters.map((filter) => (
        <Badge key={filter.key} variant="outline" className="gap-1">
          {filter.label}
          {filter.value && `: ${filter.value}`}
          <X
            className="h-3 w-3 cursor-pointer hover:text-red-500"
            onClick={filter.onRemove}
          />
        </Badge>
      ))}

      <Button variant="ghost" size="sm" onClick={onClearAll} className="ml-2">
        <RotateCcw className="h-3 w-3 mr-1" />
        Clear All
      </Button>
    </div>
  );
};
