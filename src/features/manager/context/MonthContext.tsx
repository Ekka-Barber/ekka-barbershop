import React, { useState, ReactNode } from 'react';

import { getCurrentMonth } from '@shared/utils/date/dateUtils';

import { MonthContext } from './MonthContextDefinition';

import { MonthContextType } from '@/features/manager/types/month';

interface MonthProviderProps {
  children: ReactNode;
}

const MonthProvider: React.FC<MonthProviderProps> = ({ children }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonth());

  const getMonthDisplay = (month: string): string => {
    const date = new Date(month);
    return new Intl.DateTimeFormat('ar', {
      year: 'numeric',
      month: 'long',
      calendar: 'gregory'
    }).format(date);
  };

  const contextValue: MonthContextType = {
    selectedMonth,
    setSelectedMonth,
    getMonthDisplay,
  };

  return (
    <MonthContext.Provider value={contextValue}>
      {children}
    </MonthContext.Provider>
  );
};

export default MonthProvider; 
