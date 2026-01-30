import { supabase } from '@shared/lib/supabase/client';

import { accessCodeStorage, sessionAuth } from './storage';

type AccessRole = 'owner' | 'manager' | 'super_manager';

export const normalizeAccessCode = (code: string) => code.trim().toLowerCase();

export const validateAndDetectRole = async (
  code: string
): Promise<AccessRole | null> => {
  const normalized = normalizeAccessCode(code);
  if (!normalized) {
    return null;
  }

  const isOwner = await validateOwnerCode(normalized);
  if (isOwner) {
    return 'owner';
  }

  const isManager = await validateManagerCode(normalized);
  if (!isManager) {
    return null;
  }

  return normalized === 'ma225' ? 'super_manager' : 'manager';
};

const validateOwnerCode = async (code: string) => {
    const normalized = normalizeAccessCode(code);
    if (!normalized) {
      return false;
    }

    const { data: ownerAccess, error: ownerError } = await supabase
      .from('owner_access')
      .select('id')
      .eq('access_code', normalized)
      .maybeSingle();

    if (ownerError) {
      throw ownerError;
    }

    return Boolean(ownerAccess);
  };

  export const setOwnerSession = async (code: string): Promise<boolean> => {
    const normalized = normalizeAccessCode(code);
    if (!normalized) {
      return false;
    }

    const { error: ownerError } = await supabase.rpc('set_owner_access', {
      code: normalized,
    });
    if (ownerError) {
      throw ownerError;
    }

    return true;
  };

const validateManagerCode = async (code: string) => {
    const normalized = normalizeAccessCode(code);
    if (!normalized) {
      return false;
    }

    const { data: manager, error } = await supabase
      .from('branch_managers')
      .select('id')
      .eq('access_code', normalized)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return Boolean(manager);
  };

  export const setManagerSession = async (code: string): Promise<boolean> => {
    const normalized = normalizeAccessCode(code);
    if (!normalized) {
      return false;
    }

    const { error } = await supabase.rpc('set_branch_manager_code', {
      access_code: normalized,
    });

    if (error) {
      throw error;
    }

    return true;
  };

export const ensureOwnerSession = async () => {
  const storedCode = accessCodeStorage.getOwnerAccessCode();
  if (!storedCode) {
    return false;
  }

  const normalized = normalizeAccessCode(storedCode);

  try {
    // Validate the code is still valid
    const isValid = await validateOwnerCode(normalized);
    if (!isValid) {
      accessCodeStorage.clearOwnerAccessCode();
      sessionAuth.clearSession();
      return false;
    }

    // Set the session variable
    await setOwnerSession(normalized);
    
    // Ensure role is set
    sessionAuth.setRole('owner');
    sessionAuth.setAccessCode(normalized);
    return true;
  } catch (_error) {
    // If any error occurs (network, validation, etc.), deny access
    return false;
  }
};

export const ensureManagerSession = async () => {
  const storedCode = accessCodeStorage.getManagerAccessCode();
  if (!storedCode) {
    return false;
  }

  const normalized = normalizeAccessCode(storedCode);

  try {
    // Validate the code is still valid
    const isValid = await validateManagerCode(normalized);
    if (!isValid) {
      accessCodeStorage.clearManagerAccessCode();
      sessionAuth.clearSession();
      return false;
    }

    // Set the session variable
    await setManagerSession(normalized);
    
    // Ensure role is set
    sessionAuth.setRole(normalized === 'ma225' ? 'super_manager' : 'manager');
    sessionAuth.setAccessCode(normalized);
    return true;
  } catch (_error) {
    // If any error occurs (network, validation, etc.), deny access
    return false;
  }
};

export const logout = async (): Promise<void> => {
  try {
    // Clear server-side session variables
    await supabase.rpc('clear_access_codes');
  } catch (_error) {
    // Ignore errors - best effort
  }
  
  // Clear all local storage
  accessCodeStorage.clearOwnerAccessCode();
  accessCodeStorage.clearManagerAccessCode();
  sessionAuth.clearSession();
};
