import React, { useState, useCallback } from 'react';

import { TIME } from '@shared/constants/time';
import { Button } from '@shared/ui/components/button';
import { Input } from '@shared/ui/components/input';
import { Label } from '@shared/ui/components/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/ui/components/select';
import { Textarea } from '@shared/ui/components/textarea';

import type { Employee, AddLeaveData } from '../types';

interface AddLeaveFormProps {
  employees: Employee[];
  onSubmit: (data: AddLeaveData) => Promise<void>;
  isLoading: boolean;
}

export const AddLeaveForm: React.FC<AddLeaveFormProps> = ({
  employees,
  onSubmit,
  isLoading,
}) => {
  const [formData, setFormData] = useState<AddLeaveData>({
    employee_id: '',
    date: '',
    end_date: '',
    duration_days: 1,
    reason: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employee_id || !formData.date || !formData.end_date) return;

    await onSubmit(formData);

    // Reset form
    setFormData({
      employee_id: '',
      date: '',
      end_date: '',
      duration_days: 1,
      reason: '',
    });
  };

  const calculateDuration = useCallback(() => {
    if (formData.date && formData.end_date) {
      const start = new Date(formData.date);
      const end = new Date(formData.end_date);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays =
        Math.ceil(
          diffTime /
            (TIME.SECOND_IN_MS *
              TIME.SECONDS_PER_MINUTE *
              TIME.SECONDS_PER_MINUTE *
              TIME.HOURS_PER_DAY)
        ) + 1;
      setFormData((prev) => ({ ...prev, duration_days: diffDays }));
    }
  }, [formData.date, formData.end_date]);

  React.useEffect(() => {
    calculateDuration();
  }, [calculateDuration]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="employee">Employee</Label>
        <Select
          value={formData.employee_id}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, employee_id: value }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select employee" />
          </SelectTrigger>
          <SelectContent>
            {employees.map((employee) => (
              <SelectItem key={employee.id} value={employee.id}>
                {employee.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="date">Start Date</Label>
        <Input
          id="date"
          type="date"
          value={formData.date}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, date: e.target.value }))
          }
          required
        />
      </div>

      <div>
        <Label htmlFor="end_date">End Date</Label>
        <Input
          id="end_date"
          type="date"
          value={formData.end_date}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, end_date: e.target.value }))
          }
          required
        />
      </div>

      <div>
        <Label htmlFor="duration">Duration (Days)</Label>
        <Input
          id="duration"
          type="number"
          value={formData.duration_days}
          readOnly
          className="bg-gray-100"
        />
      </div>

      <div>
        <Label htmlFor="reason">Reason</Label>
        <Textarea
          id="reason"
          value={formData.reason}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, reason: e.target.value }))
          }
          placeholder="Leave reason..."
        />
      </div>

      <Button
        type="submit"
        disabled={
          isLoading ||
          !formData.employee_id ||
          !formData.date ||
          !formData.end_date
        }
      >
        {isLoading ? 'Adding...' : 'Add Leave Request'}
      </Button>
    </form>
  );
};
