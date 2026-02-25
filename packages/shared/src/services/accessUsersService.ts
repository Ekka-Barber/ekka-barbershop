import { toast } from 'sonner';

import { supabase } from '@shared/lib/supabase/client';
import type {
  AccessUser,
  AccessRole,
  CreateAccessUserInput,
  CanDeleteOwnerResult,
  DeleteOwnerResult,
} from '@shared/types/domains';

export async function getOwners(): Promise<AccessUser[]> {
  const { data, error } = await supabase.rpc('get_owners');

  if (error) {
    toast.error('Failed to load owners');
    throw error;
  }

  return (data ?? []).map((item: { id: string; name: string; created_at: string; updated_at: string; last_login: string | null }) => ({
    id: item.id,
    name: item.name,
    role: 'owner' as AccessRole,
    branch_id: null,
    branch_name: null,
    is_super_manager: false,
    last_login: item.last_login,
    created_at: item.created_at,
    updated_at: item.updated_at,
  }));
}

export async function getManagers(): Promise<AccessUser[]> {
  const { data, error } = await supabase.rpc('get_managers');

  if (error) {
    toast.error('Failed to load managers');
    throw error;
  }

  return (data ?? []).map((item: { id: string; name: string; branch_id: string | null; branch_name: string | null; is_super_manager: boolean; created_at: string; updated_at: string; last_login: string | null }) => ({
    id: item.id,
    name: item.name,
    role: item.is_super_manager ? ('super_manager' as AccessRole) : ('manager' as AccessRole),
    branch_id: item.branch_id,
    branch_name: item.branch_name,
    is_super_manager: item.is_super_manager ?? false,
    last_login: item.last_login,
    created_at: item.created_at,
    updated_at: item.updated_at,
  }));
}

export async function getHRUsers(): Promise<AccessUser[]> {
  const { data, error } = await supabase.rpc('get_hr_users');

  if (error) {
    toast.error('Failed to load HR users');
    throw error;
  }

  return (data ?? []).map((item: { id: string; name: string; created_at: string; updated_at: string; last_login: string | null }) => ({
    id: item.id,
    name: item.name,
    role: 'hr' as AccessRole,
    branch_id: null,
    branch_name: null,
    is_super_manager: false,
    last_login: item.last_login,
    created_at: item.created_at,
    updated_at: item.updated_at,
  }));
}

export async function createOwner(
  input: CreateAccessUserInput
): Promise<string> {
  const { data, error } = await supabase.rpc('create_owner_access_user', {
    p_name: input.name,
    p_access_code: input.access_code,
  });

  if (error) {
    toast.error(error.message || 'Failed to create owner');
    throw error;
  }

  toast.success('Owner created successfully');
  return data;
}

export async function createManager(
  input: CreateAccessUserInput
): Promise<string> {
  const { data, error } = await supabase.rpc('create_manager_access_user', {
    p_name: input.name,
    p_branch_id: input.branch_id ?? null,
    p_access_code: input.access_code,
    p_is_super_manager: input.is_super_manager ?? false,
  });

  if (error) {
    toast.error(error.message || 'Failed to create manager');
    throw error;
  }

  toast.success('Manager created successfully');
  return data;
}

export async function createHRUser(
  input: CreateAccessUserInput
): Promise<string> {
  const { data, error } = await supabase.rpc('create_hr_access_user', {
    p_name: input.name,
    p_access_code: input.access_code,
  });

  if (error) {
    toast.error(error.message || 'Failed to create HR user');
    throw error;
  }

  toast.success('HR user created successfully');
  return data;
}

export async function updateOwnerName(
  userId: string,
  name: string
): Promise<boolean> {
  const { data, error } = await supabase.rpc('update_owner_name', {
    p_user_id: userId,
    p_new_name: name,
  });

  if (error) {
    toast.error(error.message || 'Failed to update owner name');
    throw error;
  }

  toast.success('Owner name updated');
  return data;
}

export async function updateManagerName(
  userId: string,
  name: string
): Promise<boolean> {
  const { data, error } = await supabase.rpc('update_manager_name', {
    p_user_id: userId,
    p_new_name: name,
  });

  if (error) {
    toast.error(error.message || 'Failed to update manager name');
    throw error;
  }

  toast.success('Manager name updated');
  return data;
}

export async function updateHRName(
  userId: string,
  name: string
): Promise<boolean> {
  const { data, error } = await supabase.rpc('update_hr_name', {
    p_user_id: userId,
    p_new_name: name,
  });

  if (error) {
    toast.error(error.message || 'Failed to update HR name');
    throw error;
  }

  toast.success('HR name updated');
  return data;
}

export async function updateOwnerAccessCode(
  userId: string,
  newCode: string
): Promise<boolean> {
  const { data, error } = await supabase.rpc('update_owner_access_code', {
    p_user_id: userId,
    p_new_code: newCode,
  });

  if (error) {
    toast.error(error.message || 'Failed to update access code');
    throw error;
  }

  toast.success('Access code updated');
  return data;
}

export async function updateManagerAccessCode(
  userId: string,
  newCode: string
): Promise<boolean> {
  const { data, error } = await supabase.rpc('update_manager_access_code', {
    p_user_id: userId,
    p_new_code: newCode,
  });

  if (error) {
    toast.error(error.message || 'Failed to update access code');
    throw error;
  }

  toast.success('Access code updated');
  return data;
}

export async function updateHRAccessCode(
  userId: string,
  newCode: string
): Promise<boolean> {
  const { data, error } = await supabase.rpc('update_hr_access_code', {
    p_user_id: userId,
    p_new_code: newCode,
  });

  if (error) {
    toast.error(error.message || 'Failed to update access code');
    throw error;
  }

  toast.success('Access code updated');
  return data;
}

export async function updateManagerBranch(
  userId: string,
  branchId: string | null
): Promise<boolean> {
  const { data, error } = await supabase.rpc('update_manager_branch', {
    p_user_id: userId,
    p_branch_id: branchId,
  });

  if (error) {
    toast.error(error.message || 'Failed to update branch');
    throw error;
  }

  toast.success('Branch updated');
  return data;
}

export async function canDeleteOwner(userId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('can_delete_owner', {
    p_user_id: userId,
  });

  if (error) {
    throw error;
  }

  const result = data as CanDeleteOwnerResult;
  return result.can_delete;
}

export async function deleteOwner(userId: string): Promise<DeleteOwnerResult> {
  const canDelete = await canDeleteOwner(userId);
  if (!canDelete) {
    toast.error('Cannot delete the last owner account');
    return { success: false, error: 'Cannot delete the last owner account' };
  }

  const { data, error } = await supabase.rpc('delete_owner_access_user', {
    p_user_id: userId,
  });

  if (error) {
    toast.error(error.message || 'Failed to delete owner');
    throw error;
  }

  const result = data as DeleteOwnerResult;
  if (result.success) {
    toast.success('Owner deleted successfully');
  } else {
    toast.error(result.error || 'Failed to delete owner');
  }

  return result;
}

export async function deleteManager(userId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('delete_manager_access_user', {
    p_user_id: userId,
  });

  if (error) {
    toast.error(error.message || 'Failed to delete manager');
    throw error;
  }

  toast.success('Manager deleted successfully');
  return data;
}

export async function deleteHRUser(userId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('delete_hr_access_user', {
    p_user_id: userId,
  });

  if (error) {
    toast.error(error.message || 'Failed to delete HR user');
    throw error;
  }

  toast.success('HR user deleted successfully');
  return data;
}

export function generateRandomCode(length = 12): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const accessUsersService = {
  getOwners,
  getManagers,
  getHRUsers,
  createOwner,
  createManager,
  createHRUser,
  updateOwnerName,
  updateManagerName,
  updateHRName,
  updateOwnerAccessCode,
  updateManagerAccessCode,
  updateHRAccessCode,
  updateManagerBranch,
  canDeleteOwner,
  deleteOwner,
  deleteManager,
  deleteHRUser,
  generateRandomCode,
};
