
let currentSession: string | null = null;
let lastActivity: number = Date.now();
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export const generateSessionId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const getSessionId = (): string => {
  if (!currentSession) {
    currentSession = generateSessionId();
  }
  lastActivity = Date.now();
  return currentSession;
};

export const shouldTrack = (): boolean => {
  if (Date.now() - lastActivity > SESSION_TIMEOUT) {
    currentSession = null;
  }
  return !window.location.hostname.includes('preview--');
};

export const cleanupSession = (): void => {
  currentSession = null;
};
