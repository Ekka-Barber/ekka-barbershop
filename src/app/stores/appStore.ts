import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import type { Branch } from '@shared/types/domains';

interface AppState {
  selectedBranch: string;
  branches: Branch[];
  theme: 'light' | 'dark' | 'system';
  sidebarCollapsed: boolean;
  isLoadingBranches: boolean;
  setSelectedBranch: (branchId: string) => void;
  setBranches: (branches: Branch[]) => void;
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLoadingBranches: (loading: boolean) => void;
  getSelectedBranchData: () => Branch | null;
  isBranchSelected: (branchId: string) => boolean;
  getAllBranchIds: () => string[];
}

type PersistedState = Pick<AppState, 'selectedBranch' | 'theme' | 'sidebarCollapsed'>;

const CURRENT_VERSION = 1;

const migratePersistedState = (persistedState: unknown, version: number): PersistedState => {
  const defaultState: PersistedState = {
    selectedBranch: 'all',
    theme: 'system',
    sidebarCollapsed: false,
  };

  if (!persistedState || typeof persistedState !== 'object') {
    return defaultState;
  }

  const state = persistedState as Partial<PersistedState>;

  if (version < 1) {
    return {
      selectedBranch: typeof state.selectedBranch === 'string' ? state.selectedBranch : 'all',
      theme: state.theme || 'system',
      sidebarCollapsed: typeof state.sidebarCollapsed === 'boolean' ? state.sidebarCollapsed : false,
    };
  }

  return {
    selectedBranch: state.selectedBranch ?? defaultState.selectedBranch,
    theme: state.theme ?? defaultState.theme,
    sidebarCollapsed: state.sidebarCollapsed ?? defaultState.sidebarCollapsed,
  };
};

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        selectedBranch: 'all',
        branches: [],
        theme: 'system',
        sidebarCollapsed: false,
        isLoadingBranches: false,

        // Actions
        setSelectedBranch: (branchId) =>
          set((state) => {
            state.selectedBranch = branchId;
          }),

        setBranches: (branches) =>
          set((state) => {
            state.branches = branches;
          }),

        toggleSidebar: () =>
          set((state) => {
            state.sidebarCollapsed = !state.sidebarCollapsed;
          }),

        setTheme: (theme) =>
          set((state) => {
            state.theme = theme;
          }),

        setLoadingBranches: (loading) =>
          set((state) => {
            state.isLoadingBranches = loading;
          }),

        // Branch utilities
        getSelectedBranchData: () => {
          const { selectedBranch, branches } = get();
          if (selectedBranch === 'all') return null;
          return (
            branches.find((branch) => branch.id === selectedBranch) || null
          );
        },

        isBranchSelected: (branchId) => {
          const { selectedBranch } = get();
          return selectedBranch === branchId || selectedBranch === 'all';
        },

        getAllBranchIds: () => {
          const { branches } = get();
          return branches.map((branch) => branch.id);
        },
      })),
      {
        name: 'app-storage',
        version: CURRENT_VERSION,
        storage: createJSONStorage(() => localStorage),
        partialize: (state): PersistedState => ({
          selectedBranch: state.selectedBranch,
          theme: state.theme,
          sidebarCollapsed: state.sidebarCollapsed,
        }),
        migrate: migratePersistedState,
      }
    ),
    {
      name: 'app-store',
    }
  )
);
