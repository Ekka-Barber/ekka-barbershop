import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import type { Branch } from '@shared/types/domains';

interface AppState {
  // Branch Management
  selectedBranch: string;
  branches: Branch[];

  // User Preferences
  theme: 'light' | 'dark' | 'system';
  sidebarCollapsed: boolean;

  // Loading states
  isLoadingBranches: boolean;

  // Actions
  setSelectedBranch: (branchId: string) => void;
  setBranches: (branches: Branch[]) => void;
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLoadingBranches: (loading: boolean) => void;

  // Branch utilities
  getSelectedBranchData: () => Branch | null;
  isBranchSelected: (branchId: string) => boolean;
  getAllBranchIds: () => string[];
}

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
        partialize: (state) => ({
          selectedBranch: state.selectedBranch,
          theme: state.theme,
          sidebarCollapsed: state.sidebarCollapsed,
          // Don't persist branches - they should be fetched fresh
        }),
      }
    ),
    {
      name: 'app-store',
    }
  )
);
