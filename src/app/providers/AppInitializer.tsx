import { ReactNode } from 'react';

import { useBranches } from '@shared/hooks/useBranches';

interface AppInitializerProps {
  children: ReactNode;
}

export const AppInitializer = ({ children }: AppInitializerProps) => {
  // This will automatically load branches and sync them with the store
  useBranches();

  return <>{children}</>;
};
