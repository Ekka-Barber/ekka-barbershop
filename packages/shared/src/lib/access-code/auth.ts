import { supabase } from '@shared/lib/supabase/client';

import { accessCodeStorage, sessionAuth } from './storage';

type AccessRole = 'owner' | 'manager' | 'super_manager' | 'hr';

export const normalizeAccessCode = (code: string) => code.trim().toLowerCase();

const isAccessRole = (value: unknown): value is AccessRole => {
  return value === 'owner' || value === 'manager' || value === 'super_manager' || value === 'hr';
};

const detectRoleByCode = async (code: string): Promise<AccessRole | null> => {
  const normalized = normalizeAccessCode(code);
  if (!normalized) {
    return null;
  }

  const { data, error } = await supabase.rpc('detect_access_role', {
    code: normalized,
  });

  if (error) {
    throw error;
  }

  if (!isAccessRole(data)) {
    return null;
  }

  return data;
};

const validateOwnerCode = async (code: string) => {
  const normalized = normalizeAccessCode(code);
  if (!normalized) {
    return false;
  }

  const { data, error } = await supabase.rpc('verify_owner_access', {
    code: normalized,
  });

  if (error) {
    throw error;
  }

  return data === true;
};

const validateManagerCode = async (code: string) => {
  const normalized = normalizeAccessCode(code);
  if (!normalized) {
    return false;
  }

  const { data, error } = await supabase.rpc('verify_manager_access', {
    code: normalized,
  });

  if (error) {
    throw error;
  }

  return data === true;
};

const validateHRCode = async (code: string) => {
  const normalized = normalizeAccessCode(code);
  if (!normalized) {
    return false;
  }

  const { data, error } = await supabase.rpc('verify_hr_access', {
    code: normalized,
  });

  if (error) {
    throw error;
  }

  return data === true;
};

export const validateAndDetectRole = async (
  code: string
): Promise<AccessRole | null> => {
  return detectRoleByCode(code);
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

    // Detect role from database (checks is_super_manager column)
    const role = await detectRoleByCode(normalized);
    sessionAuth.setRole(role ?? 'manager');
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
  accessCodeStorage.clearHRAccessCode();
  sessionAuth.clearSession();
};

export const setHRSession = async (code: string): Promise<boolean> => {
  const normalized = normalizeAccessCode(code);
  if (!normalized) {
    return false;
  }

  const { error: hrError } = await supabase.rpc('set_hr_access', {
    code: normalized,
  });
  if (hrError) {
    throw hrError;
  }

  return true;
};

export const ensureHRSession = async () => {
  const storedCode = accessCodeStorage.getHRAccessCode();
  if (!storedCode) {
    return false;
  }

  const normalized = normalizeAccessCode(storedCode);

  try {
    // Validate the code is still valid
    const isValid = await validateHRCode(normalized);
    if (!isValid) {
      accessCodeStorage.clearHRAccessCode();
      sessionAuth.clearSession();
      return false;
    }

    // Set the session variable
    await setHRSession(normalized);

    // Ensure role is set
    sessionAuth.setRole('hr');
    sessionAuth.setAccessCode(normalized);
    sessionAuth.clearBranchId();
    return true;
  } catch (_error) {
    // If any error occurs (network, validation, etc.), deny access
    return false;
  }
};
