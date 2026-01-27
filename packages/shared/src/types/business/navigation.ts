// UI navigation types

export interface NavigationTab {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
  badge?: string | number;
}

export interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  tabs?: NavigationTab[];
  badge?: string | number;
  description?: string;
}

export interface NavigationSection {
  id: string;
  label: string;
  items: NavigationItem[];
}

export interface SidebarState {
  isExpanded: boolean;
  expandedItems: string[];
  activeItem: string | null;
  activeTab: string | null;
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface PageHeader {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode[];
}

export interface TabNavigationState {
  activeTab: string;
  tabs: NavigationTab[];
  onTabChange: (tabId: string) => void;
}

export interface MenuItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  path?: string;
  children?: MenuItem[];
  badge?: string | number;
  disabled?: boolean;
  permissions?: string[];
}
