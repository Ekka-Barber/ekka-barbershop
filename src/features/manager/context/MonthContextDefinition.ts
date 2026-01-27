import { createContext } from 'react';

import { MonthContextType } from '@/features/manager/types/month';

export const MonthContext = createContext<MonthContextType | undefined>(undefined); 
