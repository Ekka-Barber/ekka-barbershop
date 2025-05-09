import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, BarChart2, Clock, DollarSign, Airplay, LineChart, UserCog } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface EmployeeTabsNavigationProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

const TABS_CONFIG = [
  { id: 'employee-grid', label: 'Employee Grid', icon: <UserCog className="h-5 w-5" /> },
  { id: 'employees', label: 'Employees', icon: <Users className="h-5 w-5" /> },
  { id: 'monthly-sales', label: 'Sales', icon: <LineChart className="h-5 w-5" /> },
  { id: 'analytics', label: 'Analytics', icon: <BarChart2 className="h-5 w-5" /> },
  { id: 'schedule', label: 'Schedule', icon: <Clock className="h-5 w-5" /> },
  { id: 'salary', label: 'Salary', icon: <DollarSign className="h-5 w-5" /> },
  { id: 'leave', label: 'Leave', icon: <Airplay className="h-5 w-5" /> },
];

export const EmployeeTabsNavigation: React.FC<EmployeeTabsNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="fixed bottom-0 left-0 w-full bg-background border-t border-border shadow-lg md:hidden z-50">
        <TabsList className="grid h-auto grid-cols-4 p-0">
          {TABS_CONFIG.slice(0, 4).map((tab) => ( // First row for mobile (max 4 tabs)
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-1 h-16 rounded-none",
                "text-xs data-[state=active]:text-primary data-[state=active]:bg-accent data-[state=active]:shadow-none",
                activeTab === tab.id ? 'text-primary bg-accent' : 'text-muted-foreground'
              )}
              aria-label={`${tab.label} tab`}
            >
              {React.cloneElement(tab.icon, { className: cn(tab.icon.props.className, "mb-1") })}
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {TABS_CONFIG.length > 4 && ( // Second row for mobile if more than 4 tabs
           <TabsList className="grid h-auto grid-cols-3 p-0 border-t border-border">
            {TABS_CONFIG.slice(4).map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "flex flex-col items-center justify-center py-2 px-1 h-16 rounded-none",
                  "text-xs data-[state=active]:text-primary data-[state=active]:bg-accent data-[state=active]:shadow-none",
                  activeTab === tab.id ? 'text-primary bg-accent' : 'text-muted-foreground'
                )}
                aria-label={`${tab.label} tab`}
              >
                {React.cloneElement(tab.icon, { className: cn(tab.icon.props.className, "mb-1") })}
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        )}
      </div>
    );
  }

  // Desktop navigation
  return (
    <div className="hidden md:flex justify-between items-center">
      <div className="pb-2 w-full">
        <TabsList className="w-full flex flex-wrap gap-2">
          {TABS_CONFIG.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-sm",
                activeTab === tab.id ? 'bg-accent text-accent-foreground shadow-sm' : 'hover:bg-accent/50'
              )}
              aria-label={`${tab.label} tab`}
            >
              {React.cloneElement(tab.icon, { className: "h-4 w-4"})}
              <span>{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
    </div>
  );
}; 