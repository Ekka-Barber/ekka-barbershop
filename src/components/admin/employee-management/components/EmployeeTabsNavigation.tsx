import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, BarChart2, Clock, DollarSign, Airplay } from 'lucide-react';

export const EmployeeTabsNavigation: React.FC = () => {
  return (
    <div className="flex justify-between items-center">
      <div className="pb-2 w-full">
        <TabsList className="w-full flex flex-wrap gap-2">
          <TabsTrigger value="employee-grid" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>Employees</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-1">
            <BarChart2 className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>Scheduling</span>
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>Team</span>
          </TabsTrigger>
          <TabsTrigger value="salary" className="flex items-center gap-1">
            <DollarSign className="h-4 w-4" />
            <span>Salary</span>
          </TabsTrigger>
          <TabsTrigger value="leave" className="flex items-center gap-1">
            <Airplay className="h-4 w-4" />
            <span>Leave</span>
          </TabsTrigger>
        </TabsList>
      </div>
    </div>
  );
}; 