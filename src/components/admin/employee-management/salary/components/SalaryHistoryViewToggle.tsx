import React from 'react';
import { Button } from '@/components/ui/button';
import { CalendarClock, CalendarRange } from 'lucide-react';

interface SalaryHistoryViewToggleProps {
  currentView: 'month' | 'year';
  onChange: (view: 'month' | 'year') => void;
}

const SalaryHistoryViewToggle: React.FC<SalaryHistoryViewToggleProps> = ({
  currentView,
  onChange
}) => {
  return (
    <div className="flex items-center justify-center space-x-2 bg-muted p-1 rounded-lg">
      <Button 
        variant={currentView === 'month' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onChange('month')}
        className="flex items-center gap-1"
      >
        <CalendarRange className="h-4 w-4" />
        <span>Month View</span>
      </Button>
      <Button 
        variant={currentView === 'year' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onChange('year')}
        className="flex items-center gap-1"
      >
        <CalendarClock className="h-4 w-4" />
        <span>Year View</span>
      </Button>
    </div>
  );
};

export default SalaryHistoryViewToggle; 