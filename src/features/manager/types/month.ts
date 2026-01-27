export interface MonthContextType {
  selectedMonth: string; // Format: "YYYY-MM-01"
  setSelectedMonth: (month: string) => void;
  getMonthDisplay: (month: string) => string;
} 
