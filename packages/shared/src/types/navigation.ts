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
