import { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import AppLayout from '@/components/layout/AppLayout';
import { AdminHeader } from '@/components/admin/layout/AdminHeader';
import { TabContent } from '@/components/admin/tabs/TabContent';
import { cn } from '@/lib/utils';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { SidebarProvider, SidebarWrapper, SidebarInset } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/layout/AdminSidebar';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('services');
  const isMobile = useIsMobile();

  return (
    <AppLayout>
      <SidebarProvider>
        <SidebarWrapper>
          <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
          <SidebarInset className="bg-background overflow-x-hidden">
            <AdminHeader />
            <div
              className={cn(
                "w-full container mx-auto px-4 py-6",
                isMobile ? "pb-32" : "pb-6"
              )}
            >
              <TabsPrimitive.Root value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabContent />
              </TabsPrimitive.Root>
            </div>
          </SidebarInset>
        </SidebarWrapper>
      </SidebarProvider>
    </AppLayout>
  );
};

export default Admin;