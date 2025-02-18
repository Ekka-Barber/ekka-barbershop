
import { v4 as uuidv4 } from 'uuid';
import { SessionData } from './types';

let sessionId: string | null = null;

const shouldTrack = (): boolean => {
  return window.location.hostname === 'ekka-barbershop.lovable.app';
};

export const getSessionId = (): string | null => {
  if (!shouldTrack()) return null;

  if (!sessionId) {
    const stored = localStorage.getItem('tracking_session_id');
    if (stored) {
      const sessionData: SessionData = JSON.parse(stored);
      if (Date.now() - sessionData.timestamp < 30 * 60 * 1000) { // 30 minutes
        sessionId = sessionData.id;
      }
    }
    
    if (!sessionId) {
      const newSession: SessionData = {
        id: uuidv4(),
        timestamp: Date.now()
      };
      localStorage.setItem('tracking_session_id', JSON.stringify(newSession));
      sessionId = newSession.id;
    }
  }
  return sessionId;
};

export { shouldTrack };
