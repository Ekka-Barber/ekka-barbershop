import { useState } from 'react';

import type { AccessRole } from '@shared/types/domains';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@shared/ui/components/tabs';

import { AddUserDialog } from './AddUserDialog';
import { UserAccessTab } from './UserAccessTab';

export function AccessControlTab() {
  const [activeTab, setActiveTab] = useState<'owners' | 'managers' | 'hr'>('managers');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const getDefaultRole = (tab: 'owners' | 'managers' | 'hr'): AccessRole => {
    switch (tab) {
      case 'owners':
        return 'owner';
      case 'managers':
        return 'manager';
      case 'hr':
        return 'hr';
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList>
          <TabsTrigger value="owners">Owners</TabsTrigger>
          <TabsTrigger value="managers">Managers</TabsTrigger>
          <TabsTrigger value="hr">HR</TabsTrigger>
        </TabsList>

        <TabsContent value="owners" className="mt-6">
          <UserAccessTab
            type="owners"
            onAddUser={() => setIsAddDialogOpen(true)}
          />
        </TabsContent>

        <TabsContent value="managers" className="mt-6">
          <UserAccessTab
            type="managers"
            onAddUser={() => setIsAddDialogOpen(true)}
          />
        </TabsContent>

        <TabsContent value="hr" className="mt-6">
          <UserAccessTab
            type="hr"
            onAddUser={() => setIsAddDialogOpen(true)}
          />
        </TabsContent>
      </Tabs>

      <AddUserDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        defaultRole={getDefaultRole(activeTab)}
      />
    </div>
  );
}
