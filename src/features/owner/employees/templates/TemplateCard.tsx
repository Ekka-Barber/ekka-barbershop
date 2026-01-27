import { AlertCircle } from 'lucide-react';

import { Badge } from '@shared/ui/components/badge';
import { Card, CardContent } from '@shared/ui/components/card';

import { getCategoryColor } from '../utils/templateUtils';

import type { DocumentTemplate } from './types';

interface TemplateCardProps {
  template: DocumentTemplate;
  onSelect: () => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onSelect,
}) => {
  return (
    <Card
      className="cursor-pointer hover:shadow-card transition-shadow"
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-muted/50">{template.icon}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-medium text-sm">{template.name}</h3>
              <Badge
                variant="outline"
                className={getCategoryColor(template.category)}
              >
                {template.category}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              {template.description}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>
                Duration: {template.defaultValues.duration_months} months
              </span>
              <span>•</span>
              <span>
                Alert: {template.defaultValues.notification_threshold_days} days
              </span>
            </div>
            {template.requiredFields.length > 0 && (
              <div className="mt-2 flex items-center gap-1">
                <AlertCircle className="h-3 w-3 text-warning" />
                <span className="text-xs text-warning">
                  {template.requiredFields.length} required fields
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
