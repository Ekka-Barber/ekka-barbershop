
import { format } from 'date-fns';

import { EndDateManagerProps } from '@shared/types/file-management';

export const useEndDateManager = ({ 
  selectedDate,
  selectedTime,
  updateEndDateMutation
}: EndDateManagerProps) => {
  
  const handleEndDateUpdate = (fileId: string) => {
    if (!selectedDate) {
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
