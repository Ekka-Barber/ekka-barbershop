import React from 'react';
import { Home, Package, Calendar, Users, FileText, QrCode, Layout } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TabNavigationProps {
  isMobile: boolean;
  activeTab: string;
  onTabChange: (value: string) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ isMobile, activeTab, onTabChange }) => {
  if (isMobile) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t shadow-lg pb-safe">
        <TabsList className="w-full p-2">
          {/* First row */}
          <div className="grid grid-cols-4 gap-2">
            <TabsTrigger 
              value="services" 
              onClick={() => onTabChange('services')}
              className={cn(
                "flex flex-col items-center py-3 px-1 h-auto",
                "data-[state=active]:bg-accent data-[state=active]:text-accent-foreground",
                "active:scale-95 transition-transform",
                activeTab === 'services' && "bg-accent text-accent-foreground"
              )}
            >
              <Home className="h-5 w-5 mb-1.5" />
              <span className="text-[11px] font-medium">Services</span>
            </TabsTrigger>
            <TabsTrigger 
              value="packages" 
              onClick={() => onTabChange('packages')}
              className={cn(
                "flex flex-col items-center py-3 px-1 h-auto",
                "data-[state=active]:bg-accent data-[state=active]:text-accent-foreground",
                "active:scale-95 transition-transform",
                activeTab === 'packages' && "bg-accent text-accent-foreground"
              )}
            >
              <Package className="h-5 w-5 mb-1.5" />
              <span className="text-[11px] font-medium">Packages</span>
            </TabsTrigger>
            <TabsTrigger 
              value="bookings" 
              onClick={() => onTabChange('bookings')}
              className={cn(
                "flex flex-col items-center py-3 px-1 h-auto",
                "data-[state=active]:bg-accent data-[state=active]:text-accent-foreground",
                "active:scale-95 transition-transform",
                activeTab === 'bookings' && "bg-accent text-accent-foreground"
              )}
            >
              <Calendar className="h-5 w-5 mb-1.5" />
              <span className="text-[11px] font-medium">Bookings</span>
            </TabsTrigger>
            <TabsTrigger 
              value="employee" 
              onClick={() => onTabChange('employee')}
              className={cn(
                "flex flex-col items-center py-3 px-1 h-auto",
                "data-[state=active]:bg-accent data-[state=active]:text-accent-foreground",
                "active:scale-95 transition-transform",
                activeTab === 'employee' && "bg-accent text-accent-foreground"
              )}
            >
              <Users className="h-5 w-5 mb-1.5" />
              <span className="text-[11px] font-medium">Employee</span>
            </TabsTrigger>
          </div>
          {/* Second row */}
          <div className="grid grid-cols-3 gap-2 mt-2">
            <TabsTrigger 
              value="files" 
              onClick={() => onTabChange('files')}
              className={cn(
                "flex flex-col items-center py-3 px-1 h-auto",
                "data-[state=active]:bg-accent data-[state=active]:text-accent-foreground",
                "active:scale-95 transition-transform",
                activeTab === 'files' && "bg-accent text-accent-foreground"
              )}
            >
              <FileText className="h-5 w-5 mb-1.5" />
              <span className="text-[11px] font-medium">Files</span>
            </TabsTrigger>
            <TabsTrigger 
              value="qrcodes" 
              onClick={() => onTabChange('qrcodes')}
              className={cn(
                "flex flex-col items-center py-3 px-1 h-auto",
                "data-[state=active]:bg-accent data-[state=active]:text-accent-foreground",
                "active:scale-95 transition-transform",
                activeTab === 'qrcodes' && "bg-accent text-accent-foreground"
              )}
            >
              <QrCode className="h-5 w-5 mb-1.5" />
              <span className="text-[11px] font-medium">QR Codes</span>
            </TabsTrigger>
            <TabsTrigger 
              value="ui-elements" 
              onClick={() => onTabChange('ui-elements')}
              className={cn(
                "flex flex-col items-center py-3 px-1 h-auto",
                "data-[state=active]:bg-accent data-[state=active]:text-accent-foreground",
                "active:scale-95 transition-transform",
                activeTab === 'ui-elements' && "bg-accent text-accent-foreground"
              )}
            >
              <Layout className="h-5 w-5 mb-1.5" />
              <span className="text-[11px] font-medium">UI</span>
            </TabsTrigger>
          </div>
        </TabsList>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-2">
      <TabsList className="w-full sm:w-auto grid grid-cols-7 sm:inline-flex gap-2">
        <TabsTrigger 
          value="services" 
          onClick={() => onTabChange('services')}
          className={cn(
            "px-4 py-2",
            activeTab === 'services' && "bg-accent text-accent-foreground"
          )}
        >
          Services
        </TabsTrigger>
        <TabsTrigger 
          value="packages" 
          onClick={() => onTabChange('packages')}
          className={cn(
            "px-4 py-2",
            activeTab === 'packages' && "bg-accent text-accent-foreground"
          )}
        >
          Packages
        </TabsTrigger>
        <TabsTrigger 
          value="bookings" 
          onClick={() => onTabChange('bookings')}
          className={cn(
            "px-4 py-2",
            activeTab === 'bookings' && "bg-accent text-accent-foreground"
          )}
        >
          Bookings
        </TabsTrigger>
        <TabsTrigger 
          value="employee" 
          onClick={() => onTabChange('employee')}
          className={cn(
            "px-4 py-2",
            activeTab === 'employee' && "bg-accent text-accent-foreground"
          )}
        >
          Employee
        </TabsTrigger>
        <TabsTrigger 
          value="files" 
          onClick={() => onTabChange('files')}
          className={cn(
            "px-4 py-2",
            activeTab === 'files' && "bg-accent text-accent-foreground"
          )}
        >
          Files
        </TabsTrigger>
        <TabsTrigger 
          value="qrcodes" 
          onClick={() => onTabChange('qrcodes')}
          className={cn(
            "px-4 py-2",
            activeTab === 'qrcodes' && "bg-accent text-accent-foreground"
          )}
        >
          QR Codes
        </TabsTrigger>
        <TabsTrigger 
          value="ui-elements" 
          onClick={() => onTabChange('ui-elements')}
          className={cn(
            "px-4 py-2",
            activeTab === 'ui-elements' && "bg-accent text-accent-foreground"
          )}
        >
          UI Elements
        </TabsTrigger>
      </TabsList>
    </div>
  );
};
