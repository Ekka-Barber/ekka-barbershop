import { Home, Users, ShieldCheck } from 'lucide-react';
import React from 'react';
import { NavLink } from 'react-router-dom';

import { cn } from '@shared/lib/utils';

const navItems = [
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

export const BottomNav = () => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border/70 bg-background safe-area-pb">
      <div className="page-shell page-padding flex items-center justify-around h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center flex-1 h-full gap-1 rounded-2xl transition-colors',
                isActive
                  ? 'text-primary font-semibold bg-primary/10'
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
