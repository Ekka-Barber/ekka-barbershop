import { Plus, Save } from 'lucide-react';

import { Button } from '@shared/ui/components/button';

interface DynamicInputsHeaderProps {
  title: string;
  onAdd: () => void;
  onSubmit: () => void;
  showSubmit: boolean;
}

export const DynamicInputsHeader = ({
  title,
  onAdd,
  onSubmit,
  showSubmit,
}: DynamicInputsHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 w-full sm:w-auto flex-grow sm:flex-grow-0"
        onClick={onAdd}
      >
        <Plus className="mr-1 h-4 w-4" />
        Add {title}
      </Button>
      {showSubmit && (
        <Button
          type="button"
          variant="default"
          size="sm"
          className="h-8 w-full sm:w-auto flex-grow sm:flex-grow-0"
          onClick={onSubmit}
        >
          <Save className="mr-1 h-4 w-4" />
          Save {title}s
        </Button>
      )}
    </div>
  );
};
