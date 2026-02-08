const OWNER_ACCESS_CODE_KEY = 'owner_access_code';
const MANAGER_ACCESS_CODE_KEY = 'branch_manager_code';
const HR_ACCESS_CODE_KEY = 'hr_access_code';
const ROLE_KEY = 'ekka_role';
const ACCESS_CODE_KEY = 'ekka_access_code';
const BRANCH_ID_KEY = 'ekka_branch_id';

const canUseStorage = () => typeof window !== 'undefined';

const getItem = (key: string) => {
  if (!canUseStorage()) {
    return null;
  }
  return window.sessionStorage.getItem(key);
};

const setItem = (key: string, value: string) => {
  if (!canUseStorage()) {
    return;
  }
  window.sessionStorage.setItem(key, value);
};

const removeItem = (key: string) => {
  if (!canUseStorage()) {
    return;
  }
  window.sessionStorage.removeItem(key);
};

export const accessCodeStorage = {
  getOwnerAccessCode: () => getItem(OWNER_ACCESS_CODE_KEY),
  setOwnerAccessCode: (code: string) => setItem(OWNER_ACCESS_CODE_KEY, code),
  clearOwnerAccessCode: () => removeItem(OWNER_ACCESS_CODE_KEY),
  getManagerAccessCode: () => getItem(MANAGER_ACCESS_CODE_KEY),
  setManagerAccessCode: (code: string) => setItem(MANAGER_ACCESS_CODE_KEY, code),
  clearManagerAccessCode: () => removeItem(MANAGER_ACCESS_CODE_KEY),
  getHRAccessCode: () => getItem(HR_ACCESS_CODE_KEY),
  setHRAccessCode: (code: string) => setItem(HR_ACCESS_CODE_KEY, code),
  clearHRAccessCode: () => removeItem(HR_ACCESS_CODE_KEY),
};

export const sessionAuth = {
  getRole: () => getItem(ROLE_KEY),
  setRole: (role: string) => setItem(ROLE_KEY, role),
  clearRole: () => removeItem(ROLE_KEY),
  getAccessCode: () => getItem(ACCESS_CODE_KEY),
  setAccessCode: (code: string) => setItem(ACCESS_CODE_KEY, code),
  clearAccessCode: () => removeItem(ACCESS_CODE_KEY),
  getBranchId: () => getItem(BRANCH_ID_KEY),
  setBranchId: (branchId: string) => setItem(BRANCH_ID_KEY, branchId),
  clearBranchId: () => removeItem(BRANCH_ID_KEY),
  clearSession: () => {
    removeItem(ROLE_KEY);
    removeItem(ACCESS_CODE_KEY);
    removeItem(BRANCH_ID_KEY);
    removeItem(OWNER_ACCESS_CODE_KEY);
    removeItem(MANAGER_ACCESS_CODE_KEY);
    removeItem(HR_ACCESS_CODE_KEY);
  },
};
