import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@shared/lib/query-keys';
import {
  accessUsersService,
  getOwners,
  getManagers,
  getHRUsers,
  createOwner,
  createManager,
  createHRUser,
  deleteOwner,
  deleteManager,
  deleteHRUser,
  updateOwnerAccessCode,
  updateManagerAccessCode,
  updateHRAccessCode,
  updateOwnerName,
  updateManagerName,
  updateHRName,
  updateManagerBranch,
} from '@shared/services/accessUsersService';
import type {
  AccessUser,
  CreateAccessUserInput,
} from '@shared/types/domains';

export { accessUsersService };

export function useOwners() {
  return useQuery({
    queryKey: queryKeys.accessUsers.owners(),
    queryFn: getOwners,
    staleTime: 1000 * 60 * 5,
  });
}

export function useManagers() {
  return useQuery({
    queryKey: queryKeys.accessUsers.managers(),
    queryFn: getManagers,
    staleTime: 1000 * 60 * 5,
  });
}

export function useHRUsers() {
  return useQuery({
    queryKey: queryKeys.accessUsers.hr(),
    queryFn: getHRUsers,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateAccessUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateAccessUserInput): Promise<string> => {
      switch (input.role) {
        case 'owner':
          return createOwner(input);
        case 'manager':
        case 'super_manager':
          return createManager(input);
        case 'hr':
          return createHRUser(input);
        default:
          throw new Error(`Unknown role: ${input.role}`);
      }
    },
    onSuccess: (_, variables) => {
      invalidateRoleQueries(queryClient, variables.role);
    },
  });
}

export function useUpdateAccessUserName() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      userId: string;
      name: string;
      role: string;
    }): Promise<boolean> => {
      switch (input.role) {
        case 'owner':
          return updateOwnerName(input.userId, input.name);
        case 'manager':
        case 'super_manager':
          return updateManagerName(input.userId, input.name);
        case 'hr':
          return updateHRName(input.userId, input.name);
        default:
          throw new Error(`Unknown role: ${input.role}`);
      }
    },
    onSuccess: (_, variables) => {
      invalidateRoleQueries(queryClient, variables.role);
    },
  });
}

export function useUpdateAccessUserCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      userId: string;
      newCode: string;
      role: string;
    }): Promise<boolean> => {
      switch (input.role) {
        case 'owner':
          return updateOwnerAccessCode(input.userId, input.newCode);
        case 'manager':
        case 'super_manager':
          return updateManagerAccessCode(input.userId, input.newCode);
        case 'hr':
          return updateHRAccessCode(input.userId, input.newCode);
        default:
          throw new Error(`Unknown role: ${input.role}`);
      }
    },
    onSuccess: (_, variables) => {
      invalidateRoleQueries(queryClient, variables.role);
    },
  });
}

export function useUpdateManagerBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      userId: string;
      branchId: string | null;
    }): Promise<boolean> => {
      return updateManagerBranch(input.userId, input.branchId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accessUsers.managers() });
    },
  });
}

export function useDeleteAccessUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      userId: string;
      role: string;
    }): Promise<boolean> => {
      switch (input.role) {
        case 'owner': {
          const result = await deleteOwner(input.userId);
          return result.success;
        }
        case 'manager':
        case 'super_manager':
          return deleteManager(input.userId);
        case 'hr':
          return deleteHRUser(input.userId);
        default:
          throw new Error(`Unknown role: ${input.role}`);
      }
    },
    onSuccess: (_, variables) => {
      invalidateRoleQueries(queryClient, variables.role);
    },
  });
}

function invalidateRoleQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  role: string
) {
  switch (role) {
    case 'owner':
      queryClient.invalidateQueries({ queryKey: queryKeys.accessUsers.owners() });
      break;
    case 'manager':
    case 'super_manager':
      queryClient.invalidateQueries({ queryKey: queryKeys.accessUsers.managers() });
      break;
    case 'hr':
      queryClient.invalidateQueries({ queryKey: queryKeys.accessUsers.hr() });
      break;
  }
}

export type { AccessUser, CreateAccessUserInput };
