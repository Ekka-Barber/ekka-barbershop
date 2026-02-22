import { useEffect, useRef } from 'react';

type VisibilityCallback = () => void;

const globalListeners = new Set<VisibilityCallback>();
let isGlobalListenerRegistered = false;

const notifyListeners = () => {
  globalListeners.forEach((callback) => {
    try {
      callback();
    } catch {
      // Ignore errors in individual listeners
    }
  });
};

const ensureGlobalListener = () => {
  if (isGlobalListenerRegistered || typeof document === 'undefined') return;
  
  document.addEventListener('visibilitychange', notifyListeners);
  isGlobalListenerRegistered = true;
};

export function useVisibilityChange(callback: VisibilityCallback, enabled = true) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!enabled || typeof document === 'undefined') return;

    const wrappedCallback = () => {
      if (!document.hidden) {
        callbackRef.current();
      }
    };

    globalListeners.add(wrappedCallback);
    ensureGlobalListener();

    return () => {
      globalListeners.delete(wrappedCallback);
    };
  }, [enabled]);
}
