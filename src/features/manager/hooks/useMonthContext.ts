import { useContext } from 'react';

import { MonthContext } from '@/features/manager/context/MonthContextDefinition';
import { MonthContextType } from '@/features/manager/types/month';

export const useMonthContext = (): MonthContextType => {
  const context = useContext(MonthContext);
  if (context === undefined) {
    throw new Error('useMonthContext must be used within a MonthProvider');
  }
  return context;
}; 
