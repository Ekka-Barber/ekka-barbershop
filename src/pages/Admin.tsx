import { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import AppLayout from '@/components/layout/AppLayout';
import { AdminHeader } from '@/components/admin/layout/AdminHeader';
import { TabNavigation } from '@/components/admin/layout/TabNavigation';
import { TabContent } from '@/components/admin/tabs/TabContent';
import { cn } from '@/lib/utils';
import * as TabsPrimitive from '@radix-ui/react-tabs';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('services');
  const isMobile = useIsMobile();

  return (
    <AppLayout>
      <AdminHeader />

      <div className={cn(
        "w-full container mx-auto px-4 py-6",
        isMobile ? "pb-32" : "pb-6"
      )}>
        <TabsPrimitive.Root value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabNavigation 
            isMobile={isMobile} 
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
          <TabContent />
        </TabsPrimitive.Root>
      </div>
    </AppLayout>
  );
};

export default Admin;