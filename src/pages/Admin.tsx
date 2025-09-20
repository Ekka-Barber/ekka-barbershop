import { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import AppLayout from '@/components/layout/AppLayout';
import { AdminHeader } from '@/components/admin/layout/AdminHeader';
import { TabContent } from '@/components/admin/tabs/TabContent';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { SidebarProvider, SidebarWrapper, SidebarInset } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/layout/AdminSidebar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Home, FileText, QrCode, Layout, TrendingUp } from 'lucide-react';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('services');
  const isMobile = useIsMobile();

  const navigationItems = [
    { id: 'services', label: 'Services', icon: Home },
    { id: 'branches', label: 'Branches', icon: Home },
    { id: 'files', label: 'Files', icon: FileText },
    { id: 'qrcodes', label: 'QR Codes', icon: QrCode },
    { id: 'ui-elements', label: 'UI Elements', icon: Layout },
    { id: 'google-ads', label: 'Google Ads', icon: TrendingUp },
  ];

  return (
    <AppLayout>
      <SidebarProvider>
        <SidebarWrapper>
          {/* Only show sidebar on mobile */}
          {isMobile && <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />}

          {isMobile ? (
            <SidebarInset className="bg-background">
              <AdminHeader />
              <div className="w-full container mx-auto px-4 py-6 pb-20 sm:pb-32">
                <TabsPrimitive.Root value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                  <TabContent />
                </TabsPrimitive.Root>
              </div>
            </SidebarInset>
          ) : (
            <div className="min-h-screen bg-background">
              <AdminHeader />
              <div className="border-b bg-white px-4 py-2">
                <div className="container mx-auto">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-6 bg-gray-100" role="tablist" aria-label="Admin navigation">
                      {navigationItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <TabsTrigger
                            key={item.id}
                            value={item.id}
                            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            aria-label={`Switch to ${item.label} tab`}
                          >
                            <Icon className="h-4 w-4" aria-hidden="true" />
                            <span className="hidden lg:inline">{item.label}</span>
                          </TabsTrigger>
                        );
                      })}
                    </TabsList>
                  </Tabs>
                </div>
              </div>
              <div className="w-full container mx-auto px-4 py-6 pb-6">
                <TabsPrimitive.Root value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                  <TabContent />
                </TabsPrimitive.Root>
              </div>
            </div>
          )}
        </SidebarWrapper>
      </SidebarProvider>
    </AppLayout>
  );
};

export default Admin;