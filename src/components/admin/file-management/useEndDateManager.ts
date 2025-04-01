import { EndDateManagerProps } from '@/types/file-management';

export const useEndDateManager = ({ 
  selectedDate,
  selectedTime,
  updateEndDateMutation
}: EndDateManagerProps) => {
  
  const handleEndDateUpdate = (fileId: string) => {
    if (!selectedDate) {
      console.error('No date selected');
      return;
    }

    updateEndDateMutation.mutate({
      id: fileId,
      endDate: selectedDate,
      endTime: selectedTime
    });
  };

  const handleRemoveEndDate = (fileId: string) => {
    updateEndDateMutation.mutate({
      id: fileId,
      endDate: null,
      endTime: null
    });
  };

  return {
    handleEndDateUpdate,
    handleRemoveEndDate
  };
};
