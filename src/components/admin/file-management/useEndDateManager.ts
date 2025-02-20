
import { useCallback } from 'react';
import { FileMetadata } from '@/types/admin';

interface UseEndDateManagerProps {
  selectedDate: Date | undefined;
  selectedTime: string;
  updateEndDateMutation: any;
}

export const useEndDateManager = ({
  selectedDate,
  selectedTime,
  updateEndDateMutation
}: UseEndDateManagerProps) => {
  const handleEndDateUpdate = useCallback((file: FileMetadata) => {
    let endDate = null;
    if (selectedDate && selectedTime) {
      const [hours, minutes] = selectedTime.split(':');
      const date = new Date(selectedDate);
      date.setHours(parseInt(hours), parseInt(minutes));
      endDate = date.toISOString();
    }
    
    updateEndDateMutation.mutate({ id: file.id, endDate });
  }, [selectedDate, selectedTime, updateEndDateMutation]);

  const handleRemoveEndDate = useCallback((fileId: string) => {
    updateEndDateMutation.mutate({ id: fileId, endDate: null });
  }, [updateEndDateMutation]);

  return {
    handleEndDateUpdate,
    handleRemoveEndDate
  };
};
