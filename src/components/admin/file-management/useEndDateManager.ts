
import { useCallback } from 'react';
import { FileMetadata } from '@/types/admin';

interface UseEndDateManagerProps {
  selectedStartDate: Date | undefined;
  selectedStartTime: string;
  selectedEndDate: Date | undefined;
  selectedEndTime: string;
  updateDatesMutation: any;
}

export const useEndDateManager = ({
  selectedStartDate,
  selectedStartTime,
  selectedEndDate,
  selectedEndTime,
  updateDatesMutation
}: UseEndDateManagerProps) => {
  const handleEndDateUpdate = useCallback((file: FileMetadata) => {
    let startDate = null;
    if (selectedStartDate && selectedStartTime) {
      const [hours, minutes] = selectedStartTime.split(':');
      const date = new Date(selectedStartDate);
      date.setHours(parseInt(hours), parseInt(minutes));
      startDate = date.toISOString();
    }

    let endDate = null;
    if (selectedEndDate && selectedEndTime) {
      const [hours, minutes] = selectedEndTime.split(':');
      const date = new Date(selectedEndDate);
      date.setHours(parseInt(hours), parseInt(minutes));
      endDate = date.toISOString();
    }
    
    updateDatesMutation.mutate({ id: file.id, startDate, endDate });
  }, [selectedStartDate, selectedStartTime, selectedEndDate, selectedEndTime, updateDatesMutation]);

  const handleRemoveEndDate = useCallback((fileId: string) => {
    updateDatesMutation.mutate({ id: fileId, startDate: null, endDate: null });
  }, [updateDatesMutation]);

  return {
    handleEndDateUpdate,
    handleRemoveEndDate
  };
};
