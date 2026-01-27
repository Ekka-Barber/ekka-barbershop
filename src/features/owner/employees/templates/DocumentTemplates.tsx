import { FileText } from 'lucide-react';
import React, { useState } from 'react';

import { Badge } from '@shared/ui/components/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/ui/components/card';
import { Label } from '@shared/ui/components/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/ui/components/select';

import {
  filterTemplates,
  getDocumentTemplates,
  TEMPLATE_CATEGORIES,
} from '../utils/templateUtils';

import { TemplateCard } from './TemplateCard';
import { TemplateDetailsDialog } from './TemplateDetailsDialog';
import type { DocumentTemplatesProps } from './types';

export const DocumentTemplates: React.FC<DocumentTemplatesProps> = ({
  onTemplateSelect,
  selectedDocumentType,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const allTemplates = getDocumentTemplates();
  const availableTemplates = filterTemplates(
    allTemplates,
    selectedDocumentType,
    selectedCategory
  );

  if (availableTemplates.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">
            No templates available for the selected document type.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Document Templates</CardTitle>
          <Badge variant="secondary">
            {availableTemplates.length} available
          </Badge>
        </div>
        {!selectedDocumentType && (
          <div className="space-y-2">
            <Label className="text-sm">Filter by Category</Label>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TEMPLATE_CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    <div className="flex items-center gap-2">
                      {category.icon}
                      {category.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {availableTemplates.map((template) => (
            <div key={template.id} className="space-y-2">
              <TemplateCard
                template={template}
                onSelect={() => onTemplateSelect(template)}
              />
              <div className="flex justify-center">
                <TemplateDetailsDialog
                  template={template}
                  onSelect={() => onTemplateSelect(template)}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
