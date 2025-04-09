
import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Home, Package, Calendar, Users, FileText, QrCode, Layout, Building } from 'lucide-react';

interface TabNavigationProps {
  isMobile: boolean;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ isMobile }) => {
  if (isMobile) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg pb-[env(safe-area-inset-bottom)]">
        <div className="overflow-x-auto">
          <TabsList className="w-full grid grid-cols-8 gap-1 p-2">
            <TabsTrigger value="services" className="flex flex-col items-center py-2 h-auto">
              <Home className="h-5 w-5 mb-1" />
              <span className="text-xs">Services</span>
            </TabsTrigger>
            <TabsTrigger value="packages" className="flex flex-col items-center py-2 h-auto">
              <Package className="h-5 w-5 mb-1" />
              <span className="text-xs">Packages</span>
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex flex-col items-center py-2 h-auto">
              <Calendar className="h-5 w-5 mb-1" />
              <span className="text-xs">Bookings</span>
            </TabsTrigger>
            <TabsTrigger value="employee" className="flex flex-col items-center py-2 h-auto">
              <Users className="h-5 w-5 mb-1" />
              <span className="text-xs">Employee</span>
            </TabsTrigger>
            <TabsTrigger value="branches" className="flex flex-col items-center py-2 h-auto">
              <Building className="h-5 w-5 mb-1" />
              <span className="text-xs">Branches</span>
            </TabsTrigger>
            <TabsTrigger value="files" className="flex flex-col items-center py-2 h-auto">
              <FileText className="h-5 w-5 mb-1" />
              <span className="text-xs">Files</span>
            </TabsTrigger>
            <TabsTrigger value="qrcodes" className="flex flex-col items-center py-2 h-auto">
              <QrCode className="h-5 w-5 mb-1" />
              <span className="text-xs">QR</span>
            </TabsTrigger>
            <TabsTrigger value="ui-elements" className="flex flex-col items-center py-2 h-auto">
              <Layout className="h-5 w-5 mb-1" />
              <span className="text-xs">UI</span>
            </TabsTrigger>
          </TabsList>
        </div>
      </div>
    );
  } 
  
  return (
    <div className="overflow-x-auto pb-2">
      <TabsList className="w-full sm:w-auto grid grid-cols-8 sm:inline-flex">
        <TabsTrigger value="services">Services</TabsTrigger>
        <TabsTrigger value="packages">Packages</TabsTrigger>
        <TabsTrigger value="bookings">Bookings</TabsTrigger>
        <TabsTrigger value="employee">Employee</TabsTrigger>
        <TabsTrigger value="branches">Branches</TabsTrigger>
        <TabsTrigger value="files">Files</TabsTrigger>
        <TabsTrigger value="qrcodes">QR Codes</TabsTrigger>
        <TabsTrigger value="ui-elements">UI Elements</TabsTrigger>
      </TabsList>
    </div>
  );
};
