import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

interface MonthYearPickerProps {
  selectedDate: Date;
  onChange: (date: Date) => void;
}

export const MonthYearPicker: React.FC<MonthYearPickerProps> = ({ 
  selectedDate,
  onChange
}) => {
  const months = [
    'January', 'February', 'March', 'April', 
    'May', 'June', 'July', 'August', 
    'September', 'October', 'November', 'December'
  ];
  
  const thisYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => thisYear - 2 + i);
  
  const [currentMonth, setCurrentMonth] = useState(selectedDate.getMonth());
  const [currentYear, setCurrentYear] = useState(selectedDate.getFullYear());
  const [displayDate, setDisplayDate] = useState(format(selectedDate, 'MMMM yyyy'));
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | undefined>(undefined);
  
  // Sync component state with prop
  useEffect(() => {
    setCurrentMonth(selectedDate.getMonth());
    setCurrentYear(selectedDate.getFullYear());
    setDisplayDate(format(selectedDate, 'MMMM yyyy'));
  }, [selectedDate]);
  
  const handleMonthChange = (valueString: string) => {
    const month = parseInt(valueString, 10);
    const newDate = new Date(currentYear, month, 1);
    onChange(newDate);
    animateTransition();
  };
  
  const handleYearChange = (valueString: string) => {
    const year = parseInt(valueString, 10);
    const newDate = new Date(year, currentMonth, 1);
    onChange(newDate);
    animateTransition();
  };
  
  const goToPreviousMonth = () => {
    const newDate = new Date(currentYear, currentMonth - 1, 1);
    onChange(newDate);
    animateTransition('left');
  };
  
  const goToNextMonth = () => {
    const newDate = new Date(currentYear, currentMonth + 1, 1);
    onChange(newDate);
    animateTransition('right');
  };
  
  const animateTransition = (direction: 'left' | 'right' | undefined = undefined) => {
    setSlideDirection(direction);
    setIsTransitioning(true);
    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center space-x-2 mb-1">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">Select Month</span>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={goToPreviousMonth}
          aria-label="Previous month"
          className="hover:bg-primary/5 active:scale-95 transition-transform"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div 
              key={displayDate}
              initial={isTransitioning ? { 
                opacity: 0,
                x: slideDirection === 'left' ? 20 : slideDirection === 'right' ? -20 : 0,
                scale: 0.95
              } : { opacity: 1 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="flex items-center space-x-2"
            >
              <Select value={currentMonth.toString()} onValueChange={handleMonthChange}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue>{months[currentMonth]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {months.map((month, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={currentYear.toString()} onValueChange={handleYearChange}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue>{currentYear}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>
          </AnimatePresence>
        </div>
        
        <Button 
          variant="outline" 
          size="icon" 
          onClick={goToNextMonth}
          aria-label="Next month"
          className="hover:bg-primary/5 active:scale-95 transition-transform"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default MonthYearPicker; 