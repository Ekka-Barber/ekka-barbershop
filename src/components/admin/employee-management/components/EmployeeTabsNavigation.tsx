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
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg pb-safe">
        <TabsList className="w-full p-1">
          {/* First row */}
          <div className="grid grid-cols-3 gap-1">
            <TabsTrigger 
              value="employee-grid" 
              onClick={() => onTabChange('employee-grid')}
              className={cn(
                "flex flex-col items-center py-3 px-1 h-auto",
                "data-[state=active]:bg-accent data-[state=active]:text-accent-foreground",
                activeTab === 'employee-grid' && "bg-accent text-accent-foreground"
              )}
            >
              <Users className="h-5 w-5 mb-1" />
              <span className="text-[10px]">Employees</span>
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              onClick={() => onTabChange('analytics')}
              className={cn(
                "flex flex-col items-center py-3 px-1 h-auto",
                "data-[state=active]:bg-accent data-[state=active]:text-accent-foreground",
                activeTab === 'analytics' && "bg-accent text-accent-foreground"
              )}
            >
              <BarChart2 className="h-5 w-5 mb-1" />
              <span className="text-[10px]">Analytics</span>
            </TabsTrigger>
            <TabsTrigger 
              value="schedule" 
              onClick={() => onTabChange('schedule')}
              className={cn(
                "flex flex-col items-center py-3 px-1 h-auto",
                "data-[state=active]:bg-accent data-[state=active]:text-accent-foreground",
                activeTab === 'schedule' && "bg-accent text-accent-foreground"
              )}
            >
              <Clock className="h-5 w-5 mb-1" />
              <span className="text-[10px]">Schedule</span>
            </TabsTrigger>
          </div>
          {/* Second row */}
          <div className="grid grid-cols-3 gap-1 mt-1">
            <TabsTrigger 
              value="team" 
              onClick={() => onTabChange('team')}
              className={cn(
                "flex flex-col items-center py-3 px-1 h-auto",
                "data-[state=active]:bg-accent data-[state=active]:text-accent-foreground",
                activeTab === 'team' && "bg-accent text-accent-foreground"
              )}
            >
              <Users className="h-5 w-5 mb-1" />
              <span className="text-[10px]">Team</span>
            </TabsTrigger>
            <TabsTrigger 
              value="salary" 
              onClick={() => onTabChange('salary')}
              className={cn(
                "flex flex-col items-center py-3 px-1 h-auto",
                "data-[state=active]:bg-accent data-[state=active]:text-accent-foreground",
                activeTab === 'salary' && "bg-accent text-accent-foreground"
              )}
            >
              <DollarSign className="h-5 w-5 mb-1" />
              <span className="text-[10px]">Salary</span>
            </TabsTrigger>
            <TabsTrigger 
              value="leave" 
              onClick={() => onTabChange('leave')}
              className={cn(
                "flex flex-col items-center py-3 px-1 h-auto",
                "data-[state=active]:bg-accent data-[state=active]:text-accent-foreground",
                activeTab === 'leave' && "bg-accent text-accent-foreground"
              )}
            >
              <Airplay className="h-5 w-5 mb-1" />
              <span className="text-[10px]">Leave</span>
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
          >
            <Clock className="h-4 w-4" />
            <span>Scheduling</span>
          </TabsTrigger>
          <TabsTrigger 
            value="team" 
            onClick={() => onTabChange('team')}
            className={cn(
              "flex items-center gap-1",
              activeTab === 'team' && "bg-accent text-accent-foreground"
            )}
          >
            <Users className="h-4 w-4" />
            <span>Team</span>
          </TabsTrigger>
          <TabsTrigger 
            value="salary" 
            onClick={() => onTabChange('salary')}
            className={cn(
              "flex items-center gap-1",
              activeTab === 'salary' && "bg-accent text-accent-foreground"
            )}
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
          >
            <Airplay className="h-4 w-4" />
            <span>Leave</span>
          </TabsTrigger>
        </TabsList>
      </div>
    </div>
  );
}; 