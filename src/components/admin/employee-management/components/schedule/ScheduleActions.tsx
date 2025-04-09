
import { Button } from '@/components/ui/button';
import { Clock, Save } from 'lucide-react';

interface ScheduleActionsProps {
  onSave: () => void;
  isUpdating: boolean;
}

export const ScheduleActions = ({ onSave, isUpdating }: ScheduleActionsProps) => {
  return (
    <div className="flex justify-end">
      <Button 
        onClick={onSave}
        disabled={isUpdating}
        className="w-full sm:w-auto"
      >
        {isUpdating ? (
          <>
            <Clock className="mr-2 h-4 w-4 animate-spin" />
            Updating...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Save Schedule
          </>
        )}
      </Button>
    </div>
  );
};
