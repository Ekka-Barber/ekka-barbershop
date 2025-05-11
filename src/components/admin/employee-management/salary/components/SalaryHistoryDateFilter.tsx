import React, { useState } from 'react';
import { Calendar, CalendarDays, ChevronDown, ChevronRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';

export interface DateFilterOption {
  year: string;
  months: string[];
  count: number;
  monthCounts?: Record<string, number>; // Add monthCounts to store count per month
}

interface SalaryHistoryDateFilterProps {
  dateOptions: DateFilterOption[];
  selectedYear: string | null;
  selectedMonth: string | null;
  onYearSelect: (year: string | null) => void;
  onMonthSelect: (year: string, month: string | null) => void;
  currentMonthYear: string; // Format: "YYYY-MM"
}

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June', 
  'July', 'August', 'September', 'October', 'November', 'December'
];

const SalaryHistoryDateFilter: React.FC<SalaryHistoryDateFilterProps> = ({
  dateOptions,
  selectedYear,
  selectedMonth,
  onYearSelect,
  onMonthSelect,
  currentMonthYear
}) => {
  const [expandedYears, setExpandedYears] = useState<string[]>([
    // Default to expanding current year if available
    currentMonthYear.split('-')[0]
  ]);

  // Handler for toggling year expansion
  const handleYearToggle = (year: string) => {
    setExpandedYears(prev => 
      prev.includes(year) 
        ? prev.filter(y => y !== year) 
        : [...prev, year]
    );
  };

  // Parse current month and year
  const [currentYear, currentMonth] = currentMonthYear.split('-');

  if (dateOptions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-4 text-center text-muted-foreground">
        <CalendarDays className="h-8 w-8 mb-2 opacity-50" />
        <p>No payment history data available</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <div className="bg-muted/40 p-2 flex items-center justify-between">
        <h3 className="text-sm font-medium">Filter by Date</h3>
        {selectedYear && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              onYearSelect(null);
              onMonthSelect('', null);
            }}
            className="h-7 text-xs"
          >
            Clear
          </Button>
        )}
      </div>
      
      <div className="p-1 max-h-[320px] overflow-y-auto scrollbar-thin">
        <Accordion
          type="multiple"
          value={expandedYears}
          className="w-full"
        >
          {dateOptions.map(option => (
            <AccordionItem key={option.year} value={option.year} className="border-b-0">
              <div className="flex items-center">
                <Button
                  variant={selectedYear === option.year && !selectedMonth ? "default" : "ghost"}
                  size="sm"
                  onClick={() => {
                    onYearSelect(option.year);
                    onMonthSelect(option.year, null);
                    if (!expandedYears.includes(option.year)) {
                      handleYearToggle(option.year);
                    }
                  }}
                  className={cn(
                    "flex-1 justify-start h-9 rounded-none px-2",
                    selectedYear === option.year && !selectedMonth ? "bg-primary text-primary-foreground" : "",
                    !expandedYears.includes(option.year) ? "rounded-md" : "rounded-t-md rounded-b-none"
                  )}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{option.year}</span>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "ml-auto bg-background/30", 
                      selectedYear === option.year && !selectedMonth ? "border-primary-foreground/20" : ""
                    )}
                  >
                    {option.count}
                  </Badge>
                </Button>
                <AccordionTrigger 
                  className="p-0 pr-2 data-[state=open]:text-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleYearToggle(option.year);
                  }}
                >
                  {expandedYears.includes(option.year) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </AccordionTrigger>
              </div>
              
              <AccordionContent>
                <div className="ml-2 border-l pl-2 py-1 space-y-1">
                  <Button
                    variant={selectedYear === option.year && selectedMonth === null ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => {
                      onYearSelect(option.year);
                      onMonthSelect(option.year, null);
                    }}
                    className="w-full justify-start h-7 text-sm"
                  >
                    <span>All months</span>
                    <Badge 
                      variant="outline" 
                      className="ml-auto bg-background/30"
                    >
                      {option.count}
                    </Badge>
                  </Button>
                  
                  {option.months.map(month => {
                    const monthNumber = month.padStart(2, '0');
                    const monthIndex = parseInt(month) - 1;
                    const isCurrentMonth = option.year === currentYear && monthNumber === currentMonth;
                    
                    // Get the count for this specific month using monthCounts or fallback to 0
                    const monthCount = option.monthCounts?.[monthNumber] || 0;
                    
                    return (
                      <Button
                        key={month}
                        variant={selectedYear === option.year && selectedMonth === monthNumber ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => {
                          onYearSelect(option.year);
                          onMonthSelect(option.year, monthNumber);
                        }}
                        className={cn(
                          "w-full justify-start h-7 text-sm",
                          isCurrentMonth ? "font-medium" : "",
                          selectedYear === option.year && selectedMonth === monthNumber ? "bg-primary/10" : ""
                        )}
                      >
                        <span className="flex items-center">
                          {isCurrentMonth && <Clock className="h-3 w-3 mr-1 text-primary" />}
                          {monthNames[monthIndex]}
                        </span>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "ml-auto bg-background/30",
                            isCurrentMonth ? "border-primary/30" : ""
                          )}
                        >
                          {monthCount}
                        </Badge>
                      </Button>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default SalaryHistoryDateFilter; 