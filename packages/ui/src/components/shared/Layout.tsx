import React from 'react';

import { useAppStore } from '@app/stores/appStore';

import { NAVIGATION_CONFIG } from '@shared/constants/navigation';
import { useIsMobile } from '@shared/hooks/use-mobile';
import type { NavigationSection } from '@shared/types/navigation';
import { SidebarProvider, Sidebar } from '@shared/ui/components/sidebar';
import { EnhancedSidebar } from '@shared/ui/components/sidebar/EnhancedSidebar';

import { BottomNav } from './navigation/BottomNav';
import type { BottomNavItem } from './navigation/BottomNav';
import { TopBar } from './navigation/TopBar';

interface LayoutProps {
  children: ({ selectedBranch }: { selectedBranch: string }) => React.ReactNode;
  title?: string;
  showBranchSelector?: boolean;
  homePath?: string;
  navigationConfig?: NavigationSection[];
  bottomNavItems?: BottomNavItem[];
  showBottomNav?: boolean;
}

const Layout = ({
  children,
  title = 'Ekka Barbershop',
  showBranchSelector = true,
  homePath = '/owner',
  navigationConfig = NAVIGATION_CONFIG,
  bottomNavItems,
  showBottomNav = true,
}: LayoutProps) => {
  const { selectedBranch } = useAppStore();
  const isMobile = useIsMobile();

  return (
    <SidebarProvider>
      <div className="flex h-[100dvh] min-h-[100dvh] bg-transparent overflow-hidden">
        {/* Enhanced Desktop Sidebar with hierarchical navigation */}
        {!isMobile && (
          <Sidebar collapsible="none">
            <EnhancedSidebar navigationConfig={navigationConfig} />
          </Sidebar>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex min-w-0 flex-col min-h-0">
          {/* Top Bar - visible on all screens */}
          <TopBar
            title={title}
            showBranchSelector={showBranchSelector}
            homePath={homePath}
            settingsPath="/owner/settings"
          />

          {/* Page Content - Spacer at end keeps content above fixed bottom nav on mobile */}
          <main className="relative z-0 flex-1 min-h-full overflow-y-auto pb-6 momentum-scroll touch-action-pan-y">
            <div className="page-shell page-padding py-4 md:py-6">
              <div className="app-surface app-rise-in">
                {children({ selectedBranch })}
              </div>
              {/* Fixed-height spacer so last content (e.g. Submit Sales) scrolls above bottom nav on mobile */}
              <div aria-hidden className="h-32 shrink-0 md:h-0 md:invisible" />
            </div>
          </main>

          {/* Bottom Nav - visible only on mobile */}
          {isMobile && showBottomNav && <BottomNav items={bottomNavItems} />}
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
