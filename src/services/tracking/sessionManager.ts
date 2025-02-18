
let currentSession: string | null = null;
let lastActivity: number = Date.now();
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export const initializeSession = () => {
  currentSession = generateSessionId();
  lastActivity = Date.now();
};

export const getSessionId = (): string | null => {
  if (!currentSession) {
    initializeSession();
  }
  return currentSession;
};

export const updateLastActivity = () => {
  lastActivity = Date.now();
};

export const isSessionExpired = (): boolean => {
  return Date.now() - lastActivity > SESSION_TIMEOUT;
};

export const generateSessionId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const shouldTrack = (): boolean => {
  if (isSessionExpired()) {
    initializeSession();
  }
  updateLastActivity();
  return true;
};
