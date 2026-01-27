import { CheckCircle, Info } from 'lucide-react';

import { Badge } from '@shared/ui/components/badge';
import { Button } from '@shared/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@shared/ui/components/dialog';

import type { DocumentTemplate } from './types';

interface TemplateDetailsDialogProps {
  template: DocumentTemplate;
  onSelect: () => void;
}

export const TemplateDetailsDialog: React.FC<TemplateDetailsDialogProps> = ({
  template,
  onSelect,
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Info className="h-3 w-3 mr-1" />
          Details
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md w-[90vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {template.icon}
            {template.name}
          </DialogTitle>
          <DialogDescription>{template.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-sm mb-2">Default Settings</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div>
                Duration: {template.defaultValues.duration_months} months
              </div>
              <div>
                Notification:{' '}
                {template.defaultValues.notification_threshold_days} days before
                expiry
              </div>
              {template.defaultValues.notes && (
                <div>Notes: {template.defaultValues.notes}</div>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-sm mb-2">Required Fields</h4>
            <div className="flex flex-wrap gap-1">
              {template.requiredFields.map((field) => (
                <Badge key={field} variant="outline" className="text-xs">
                  {field
                    .replace(/_/g, ' ')
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-sm mb-2">Validation Rules</h4>
            <div className="space-y-1">
              {template.validationRules.map((rule) => (
                <div
                  key={rule.field + rule.type}
                  className="flex items-start gap-2 text-xs"
                >
                  <CheckCircle className="h-3 w-3 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{rule.message}</span>
                </div>
              ))}
            </div>
          </div>

          <Button onClick={onSelect} className="w-full">
            Use This Template
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
