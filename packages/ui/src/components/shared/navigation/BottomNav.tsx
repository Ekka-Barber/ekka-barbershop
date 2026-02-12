import { Home, ShieldCheck, Users } from 'lucide-react';
import React from 'react';
import { NavLink } from 'react-router-dom';

import { cn } from '@shared/lib/utils';

export interface BottomNavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
}

const OWNER_BOTTOM_NAV_ITEMS: BottomNavItem[] = [
  {
    icon: Home,
    label: 'Home',
    path: '/owner',
  },
  {
    icon: Users,
    label: 'Employees',
    path: '/owner/employees',
  },
  {
    icon: ShieldCheck,
    label: 'Admin',
    path: '/owner/admin',
  },
];

interface BottomNavProps {
  items?: BottomNavItem[];
}

export const BottomNav = ({ items = OWNER_BOTTOM_NAV_ITEMS }: BottomNavProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/70 bg-background pb-safe-b md:hidden">
      <div className="page-shell page-padding flex h-16 items-center justify-around">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/owner'}
            className={({ isActive }) =>
              cn(
                'flex h-full flex-1 flex-col items-center justify-center gap-1 rounded-2xl transition-colors',
                isActive
                  ? 'bg-primary/10 font-semibold text-primary'
                  : 'text-muted-foreground'
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[11px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
