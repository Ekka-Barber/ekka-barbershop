import { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import AppLayout from '@/components/layout/AppLayout';
import { AdminHeader } from '@/components/admin/layout/AdminHeader';
import { TabContent } from '@/components/admin/tabs/TabContent';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Home, FileText, QrCode, Layout } from 'lucide-react';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('branches');
  const isMobile = useIsMobile();

  const navigationItems = [
    { id: 'branches', label: 'Branches', icon: Home },
    { id: 'files', label: 'Files', icon: FileText },
    { id: 'qrcodes', label: 'QR Codes', icon: QrCode },
    { id: 'ui-elements', label: 'UI Elements', icon: Layout },
  ];

  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <AdminHeader />

        {/* Navigation Tabs */}
        <div className="border-b bg-white px-4 py-3 shadow-sm">
          <div className="container mx-auto max-w-7xl">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList
                className={`
                  ${isMobile
                    ? 'grid w-full grid-cols-2 h-auto p-1 gap-1'
                    : 'grid w-full grid-cols-4 h-12 p-1'
                  }
                  bg-gray-100 rounded-lg
                `}
                role="tablist"
                aria-label="Admin navigation"
              >
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <TabsTrigger
                      key={item.id}
                      value={item.id}
                      className={`
                        ${isMobile
                          ? 'flex flex-col items-center justify-center gap-1 py-2 px-1 text-xs h-auto'
                          : 'flex items-center gap-2 py-2 px-4'
                        }
                        data-[state=active]:bg-white
                        data-[state=active]:shadow-sm
                        data-[state=active]:text-blue-700
                        transition-all duration-200
                        hover:bg-gray-50
                        focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                        rounded-md
                      `}
                      aria-label={`Switch to ${item.label} tab`}
                    >
                      <Icon className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4'}`} aria-hidden="true" />
                      <span className={`${isMobile ? 'text-xs' : 'text-sm font-medium'}`}>
                        {isMobile ? item.label.split(' ')[0] : item.label}
                      </span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className={`
            container mx-auto max-w-7xl
            ${isMobile ? 'px-4 py-4 pb-24' : 'px-6 py-8'}
          `}>
            <TabsPrimitive.Root value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabContent />
            </TabsPrimitive.Root>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Admin;