import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, BarChart2, Clock, DollarSign, Airplay } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface EmployeeTabsNavigationProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

export const EmployeeTabsNavigation: React.FC<EmployeeTabsNavigationProps> = ({ 
  activeTab, 
  onTabChange 
}) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="sticky top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b shadow-sm">
        <TabsList className="w-full p-2">
          {/* First row */}
          <div className="grid grid-cols-3 gap-2">
            <TabsTrigger 
              value="employee-grid" 
              onClick={() => onTabChange('employee-grid')}
              className={cn(
                "flex flex-col items-center justify-center py-4 px-2 h-auto min-h-[60px]",
                "data-[state=active]:bg-accent data-[state=active]:text-accent-foreground",
                activeTab === 'employee-grid' && "bg-accent text-accent-foreground"
              )}
              aria-label="Employees tab"
            >
              <Users className="h-6 w-6 mb-1" />
              <span className="text-xs">Employees</span>
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              onClick={() => onTabChange('analytics')}
              className={cn(
                "flex flex-col items-center justify-center py-4 px-2 h-auto min-h-[60px]",
                "data-[state=active]:bg-accent data-[state=active]:text-accent-foreground",
                activeTab === 'analytics' && "bg-accent text-accent-foreground"
              )}
              aria-label="Analytics tab"
            >
              <BarChart2 className="h-6 w-6 mb-1" />
              <span className="text-xs">Analytics</span>
            </TabsTrigger>
            <TabsTrigger 
              value="schedule" 
              onClick={() => onTabChange('schedule')}
              className={cn(
                "flex flex-col items-center justify-center py-4 px-2 h-auto min-h-[60px]",
                "data-[state=active]:bg-accent data-[state=active]:text-accent-foreground",
                activeTab === 'schedule' && "bg-accent text-accent-foreground"
              )}
              aria-label="Schedule tab"
            >
              <Clock className="h-6 w-6 mb-1" />
              <span className="text-xs">Schedule</span>
            </TabsTrigger>
          </div>
          {/* Second row */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            <TabsTrigger 
              value="salary" 
              onClick={() => onTabChange('salary')}
              className={cn(
                "flex flex-col items-center justify-center py-4 px-2 h-auto min-h-[60px]",
                "data-[state=active]:bg-accent data-[state=active]:text-accent-foreground",
                activeTab === 'salary' && "bg-accent text-accent-foreground"
              )}
              aria-label="Salary tab"
            >
              <DollarSign className="h-6 w-6 mb-1" />
              <span className="text-xs">Salary</span>
            </TabsTrigger>
            <TabsTrigger 
              value="leave" 
              onClick={() => onTabChange('leave')}
              className={cn(
                "flex flex-col items-center justify-center py-4 px-2 h-auto min-h-[60px]",
                "data-[state=active]:bg-accent data-[state=active]:text-accent-foreground",
                activeTab === 'leave' && "bg-accent text-accent-foreground"
              )}
              aria-label="Leave tab"
            >
              <Airplay className="h-6 w-6 mb-1" />
              <span className="text-xs">Leave</span>
            </TabsTrigger>
          </div>
        </TabsList>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center">
      <div className="pb-2 w-full">
        <TabsList className="w-full flex flex-wrap gap-2">
          <TabsTrigger 
            value="employee-grid" 
            onClick={() => onTabChange('employee-grid')}
            className={cn(
              "flex items-center gap-1",
              activeTab === 'employee-grid' && "bg-accent text-accent-foreground"
            )}
            aria-label="Employees tab"
          >
            <Users className="h-4 w-4" />
            <span>Employees</span>
          </TabsTrigger>
          <TabsTrigger 
            value="analytics" 
            onClick={() => onTabChange('analytics')}
            className={cn(
              "flex items-center gap-1",
              activeTab === 'analytics' && "bg-accent text-accent-foreground"
            )}
            aria-label="Analytics tab"
          >
            <BarChart2 className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
          <TabsTrigger 
            value="schedule" 
            onClick={() => onTabChange('schedule')}
            className={cn(
              "flex items-center gap-1",
              activeTab === 'schedule' && "bg-accent text-accent-foreground"
            )}
            aria-label="Scheduling tab"
          >
            <Clock className="h-4 w-4" />
            <span>Scheduling</span>
          </TabsTrigger>
          <TabsTrigger 
            value="salary" 
            onClick={() => onTabChange('salary')}
            className={cn(
              "flex items-center gap-1",
              activeTab === 'salary' && "bg-accent text-accent-foreground"
            )}
            aria-label="Salary tab"
          >
            <DollarSign className="h-4 w-4" />
            <span>Salary</span>
          </TabsTrigger>
          <TabsTrigger 
            value="leave" 
            onClick={() => onTabChange('leave')}
            className={cn(
              "flex items-center gap-1",
              activeTab === 'leave' && "bg-accent text-accent-foreground"
            )}
            aria-label="Leave tab"
          >
            <Airplay className="h-4 w-4" />
            <span>Leave</span>
          </TabsTrigger>
        </TabsList>
      </div>
    </div>
  );
}; 