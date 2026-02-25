import { LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useLogout } from '@shared/hooks/auth/useLogout';
import { Button } from '@shared/ui/components/button';

import { useAppStore } from '@/app/stores/appStore';
import { BranchSelector } from '@/features/owner/branches/components/BranchSelector';

interface TopBarProps {
  title: string;
  showBranchSelector?: boolean;
  homePath?: string;
  settingsPath?: string;
}


export const TopBar = ({
  title,
  showBranchSelector = false,
  homePath = '/owner',
}: TopBarProps) => {
  const { selectedBranch, setSelectedBranch } = useAppStore();
  const logout = useLogout();

  const handleLogout = () => logout();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/80 backdrop-blur-md app-fade-in print:hidden">
      <div className="page-shell page-padding flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to={homePath} aria-label={title} className="flex items-center gap-3 shrink-0">
            <div className="logo-mark h-9 w-9 sm:h-10 sm:w-10">
              <img
                src="/logo_Header/logo12.svg"
                alt="Ekka Barbershop Logo"
                className="h-full w-full object-contain block"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src =
                    '/lovable-uploads/7eb81221-fbf5-4b1d-8327-eb0e707236d8.webp';
                }}
              />
            </div>
            <div className="flex flex-col leading-tight hidden xs:flex">
              <span className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-semibold">
                Studio
              </span>
              <span className="font-display text-base font-bold tracking-tight text-foreground">
                {title}
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {showBranchSelector && (
            <BranchSelector
              value={selectedBranch}
              onChange={setSelectedBranch}
            />
          )}
          <Button
            variant="ghost"
            size="icon"
            className="min-h-[44px] min-w-[44px] hover:bg-destructive/5 group"
            aria-label="Logout"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 text-muted-foreground group-hover:text-destructive transition-colors" />
          </Button>
        </div>
      </div>
    </header>
  );
};
