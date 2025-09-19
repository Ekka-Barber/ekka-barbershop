
import type { EndDateManagerProps } from '@/types/file-management';
import { format } from 'date-fns';

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

    // Format the date as ISO string
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    
    updateEndDateMutation.mutate({
      id: fileId,
      endDate: formattedDate,
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
