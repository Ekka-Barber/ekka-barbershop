
import { v4 as uuidv4 } from 'uuid';
import { SessionData } from './types';

let sessionId: string | null = null;

const isProductionDomain = (hostname: string): boolean => {
  return hostname === 'ekka-barbershop.lovable.app';
};

const isLocalDevelopment = (hostname: string): boolean => {
  return hostname === 'localhost' || hostname === '127.0.0.1';
};

const shouldTrack = (): boolean => {
  const hostname = window.location.hostname;
  
  // Never track in local development
  if (isLocalDevelopment(hostname)) {
    console.log('Tracking disabled in local development');
    return false;
  }

  // Only track on production domain
  if (isProductionDomain(hostname)) {
    console.log(`Tracking enabled for production domain`);
    return true;
  }

  // Disable tracking for all other domains (including preview)
  console.log('Tracking disabled for non-production domain:', hostname);
  return false;
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
