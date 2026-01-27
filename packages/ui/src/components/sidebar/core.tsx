import * as React from 'react';

import { cn } from '@shared/lib/utils';

import { useSidebar } from './context';

export const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & {
    side?: 'left' | 'right';
    variant?: 'sidebar' | 'floating' | 'inset';
    collapsible?: 'offcanvas' | 'icon' | 'none';
  }
>(
  (
    {
      side = 'left',
      variant = 'sidebar',
      collapsible = 'none',
      className,
      children,
      ...props
    },
    ref
  ) => {
    const { state } = useSidebar();

    if (collapsible === 'none') {
      return (
        <div
          className={cn(
            'flex h-full w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground',
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className="group peer block text-sidebar-foreground"
        data-state={state}
        data-collapsible={collapsible}
        data-variant={variant}
        data-side={side}
      >
        <div
          className={cn(
            'duration-300 relative h-svh w-[--sidebar-width] bg-transparent transition-all ease-in-out',
            'group-data-[state=collapsed]:w-0',
            'group-data-[side=right]:rotate-180',
            variant === 'floating' || variant === 'inset'
              ? 'group-data-[state=collapsed]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))]'
              : 'group-data-[state=collapsed]:w-[--sidebar-width-icon]'
          )}
        />
        <div
          className={cn(
            'duration-300 fixed inset-y-0 z-10 h-svh w-[--sidebar-width] transition-all ease-in-out hidden md:flex bg-sidebar',
            side === 'left'
              ? 'left-0 group-data-[collapsible=offcanvas]:group-data-[state=collapsed]:left-[calc(var(--sidebar-width)*-1)]'
              : 'right-0 group-data-[collapsible=offcanvas]:group-data-[state=collapsed]:right-[calc(var(--sidebar-width)*-1)]',
            variant === 'floating' || variant === 'inset'
              ? 'p-2 group-data-[state=collapsed]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4)_+2px)]'
              : 'group-data-[state=collapsed]:w-[--sidebar-width-icon] group-data-[side=left]:border-r group-data-[side=right]:border-l',
            className
          )}
          {...props}
        >
          <div
            data-sidebar="sidebar"
            className="flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow"
          >
            {children}
          </div>
        </div>
      </div>
    );
  }
);
Sidebar.displayName = 'Sidebar';
