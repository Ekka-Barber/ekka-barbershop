import { Plus, Sparkles } from 'lucide-react';
import React from 'react';

import { Badge } from '@shared/ui/components/badge';
import { Button } from '@shared/ui/components/button';

interface DocumentActionBarProps {
  selectedDocumentsCount: number;
  onAddDocument: () => void;
  onUseTemplate: () => void;
}

export const DocumentActionBar: React.FC<DocumentActionBarProps> = ({
  selectedDocumentsCount,
  onAddDocument,
  onUseTemplate,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <Button
          onClick={onAddDocument}
          className="flex items-center justify-center gap-2 text-base h-12 sm:h-10 sm:text-sm w-full sm:w-auto"
        >
          <Plus className="h-5 w-5 sm:h-4 sm:w-4" />
          Add Document
        </Button>
        <Button
          onClick={onUseTemplate}
          variant="outline"
          className="flex items-center justify-center gap-2 text-base h-12 sm:h-10 sm:text-sm w-full sm:w-auto"
        >
          <Sparkles className="h-5 w-5 sm:h-4 sm:w-4" />
          Use Template
        </Button>
      </div>

      {selectedDocumentsCount > 0 && (
        <Badge variant="secondary" className="text-center sm:text-left">
          {selectedDocumentsCount} selected
        </Badge>
      )}
    </div>
  );
};
