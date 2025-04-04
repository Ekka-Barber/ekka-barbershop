
import { useState, useMemo } from 'react';
import { Tabs } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';
import AppLayout from '@/components/layout/AppLayout';
import { AdminHeader } from '@/components/admin/layout/AdminHeader';
import { TabNavigation } from '@/components/admin/layout/TabNavigation';
import { TabContent } from '@/components/admin/tabs/TabContent';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('services');
  const isMobile = useIsMobile();

  return (
    <AppLayout>
      <AdminHeader />

      <div className="w-full container mx-auto px-4 py-6 pb-24 md:pb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabNavigation isMobile={isMobile} />
          <TabContent />
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Admin;
