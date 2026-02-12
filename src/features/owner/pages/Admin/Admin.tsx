import {
  Building,
  Users,
  ShieldCheck,
  FileText,
  QrCode,
  Layout,
  Cog,
  ChevronRight,
} from 'lucide-react';
import { Suspense, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

import { BranchesTab } from '@features/owner/admin/branch-management/BranchesTab';
import { TabContent as AdminTabContent } from '@features/owner/admin/tabs/TabContent';


import { Card } from '@shared/ui/components/card';
import { Separator } from '@shared/ui/components/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@shared/ui/components/tabs';

import { SponsorManagement } from '@/features/owner/settings/components';
import { EmployeeManagement } from '@/features/owner/settings/components/EmployeeManagement';

const Management = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get('tab') || 'branches';

  const navigationItems = useMemo(() => [
    { id: 'branches', label: 'Studio Network', icon: Building, description: 'Locations & details' },
    { id: 'employees', label: 'Staff Authority', icon: Users, description: 'Staff access & roles' },
    { id: 'sponsors', label: 'Partner Hub', icon: ShieldCheck, description: 'Sponsorships' },
    { id: 'files', label: 'Asset Library', icon: FileText, description: 'System resources' },
    { id: 'qrcodes', label: 'Smart Codes', icon: QrCode, description: 'QR analytics' },
    { id: 'ui-elements', label: 'Interface Lab', icon: Layout, description: 'Visual overrides' },
    { id: 'general', label: 'System Core', icon: Cog, description: 'Global preferences' },
  ], []);

  const handleTabChange = (tab: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', tab);
    setSearchParams(newParams, { replace: true });
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border/50">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
            <Link to="/owner" className="hover:text-foreground transition-colors">Owner</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">System Setup</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Administration
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage system configurations, branches, and high-level assets.
          </p>
        </div>
      </div>

      <Card className="border-border/50 shadow-soft overflow-hidden">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <div className="bg-muted/30 border-b border-border/50">
            <TabsList className="tabs-underline-list px-4 sm:px-6 h-14 bg-transparent border-none">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <TabsTrigger
                    key={item.id}
                    value={item.id}
                    className="tabs-underline-trigger min-w-max h-full data-[state=active]:bg-transparent"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </div>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          <div className="p-6 md:p-8 lg:p-10">
            <Suspense fallback={
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            }>
              {/* Branch Management (Admin version - Superior) */}
              <TabsContent value="branches" className="m-0 focus-visible:outline-none">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold tracking-tight">Branches</h2>
                  </div>
                  <Separator className="opacity-50" />
                  <BranchesTab />
                </div>
              </TabsContent>

              {/* Employee Admin */}
              <TabsContent value="employees" className="m-0 focus-visible:outline-none">
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold tracking-tight">System Access</h2>
                  <Separator className="opacity-50" />
                  <EmployeeManagement />
                </div>
              </TabsContent>

              {/* Sponsors */}
              <TabsContent value="sponsors" className="m-0 focus-visible:outline-none">
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold tracking-tight">Sponsor Management</h2>
                  <Separator className="opacity-50" />
                  <SponsorManagement />
                </div>
              </TabsContent>

              {/* Admin Shared Tabs (Files, QR Codes, UI) */}
              <AdminTabContent />

              {/* General Settings */}
              <TabsContent value="general" className="m-0 focus-visible:outline-none">
                <div className="space-y-6 text-center py-20 bg-muted/20 rounded-3xl border border-dashed border-border">
                  <Cog className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-xl font-bold">General System Preferences</h2>
                  <p className="text-muted-foreground">General settings are coming soon to this unified interface.</p>
                </div>
              </TabsContent>
            </Suspense>
          </div>
        </Tabs>
      </Card>
    </div>
  );
};

export default Management;