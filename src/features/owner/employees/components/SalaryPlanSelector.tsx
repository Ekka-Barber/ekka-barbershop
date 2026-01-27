import React from 'react';

import { useSalaryPlans } from '@shared/hooks/useSalaryPlans';
import { cn } from '@shared/lib/utils';
import { SalaryPlan } from '@shared/types/domains/salary';
import { Badge } from '@shared/ui/components/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/ui/components/select';

interface SalaryPlanSelectorProps {
  employeeId: string;
  employeeName: string;
  selectedPlanId: string | null;
  onPlanChange: (planId: string) => void;
  disabled?: boolean;
  size?: 'sm' | 'default';
}

export const SalaryPlanSelector: React.FC<SalaryPlanSelectorProps> = ({
  employeeId: _employeeId,
  employeeName,
  selectedPlanId,
  onPlanChange,
  disabled = false,
  size = 'default',
}) => {
  const { data: salaryPlans, isLoading } = useSalaryPlans();

  const getSelectedPlan = (): SalaryPlan | undefined => {
    return salaryPlans?.find((plan) => plan.id === selectedPlanId);
  };

  const selectedPlan = getSelectedPlan();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-32 bg-muted animate-pulse rounded-md" />
        <Badge variant="outline">Loading...</Badge>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          💼 Salary Plan
        </label>
        {selectedPlan?.type && (
          <Badge variant="outline" className="text-xs">
            {selectedPlan.type}
          </Badge>
        )}
      </div>

      <Select
        value={selectedPlanId || ''}
        onValueChange={onPlanChange}
        disabled={disabled || !salaryPlans?.length}
      >
        <SelectTrigger
          className={cn(size === 'sm' ? 'h-8 text-sm' : 'h-10', 'w-full')}
          aria-label={`Select salary plan for ${employeeName}`}
        >
          <SelectValue placeholder="Select plan..." className="text-left">
            {selectedPlan && (
              <div className="flex items-center gap-2 truncate">
                <span className="font-medium truncate">
                  {selectedPlan.name}
                </span>
                {selectedPlan.type && (
                  <Badge variant="outline" className="text-xs shrink-0">
                    {selectedPlan.type}
                  </Badge>
                )}
              </div>
            )}
          </SelectValue>
        </SelectTrigger>

        <SelectContent>
          {salaryPlans?.map((plan) => (
            <SelectItem
              key={plan.id}
              value={plan.id}
              className="cursor-pointer"
            >
              <div className="flex items-center justify-between w-full gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{plan.name}</div>
                  {plan.description_en && (
                    <div className="text-xs text-muted-foreground truncate">
                      {plan.description_en}
                    </div>
                  )}
                </div>
                <Badge variant="outline" className="text-xs shrink-0">
                  {plan.type}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedPlan?.description_en && size !== 'sm' && (
        <p className="text-xs text-muted-foreground">
          {selectedPlan.description_en}
        </p>
      )}
    </div>
  );
};
