import { useSyncExternalStore } from 'react';

type ViewportState = {
  width: number;
  height: number;
};

let listeners: Array<(state: ViewportState) => void> = [];
let viewportState: ViewportState = {
  width: typeof window !== 'undefined' ? window.innerWidth : 1024,
  height: typeof window !== 'undefined' ? window.innerHeight : 768,
};
let isListenerAttached = false;

const updateViewportState = () => {
  viewportState = {
    width: window.innerWidth,
    height: window.innerHeight,
  };
  listeners.forEach((listener) => listener(viewportState));
};

const attachResizeListener = () => {
  if (!isListenerAttached && typeof window !== 'undefined') {
    window.addEventListener('resize', updateViewportState, { passive: true });
    isListenerAttached = true;
  }
};

const detachResizeListener = () => {
  if (isListenerAttached && listeners.length === 0) {
    window.removeEventListener('resize', updateViewportState);
    isListenerAttached = false;
  }
};

const subscribe = (listener: (state: ViewportState) => void) => {
  listeners.push(listener);
  attachResizeListener();

  return () => {
    listeners = listeners.filter((l) => l !== listener);
    detachResizeListener();
  };
};

const getSnapshot = (): ViewportState => viewportState;

const getServerSnapshot = (): ViewportState => ({
  width: 1024,
  height: 768,
});

function useViewport(): ViewportState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useViewportWidth(): number {
  const { width } = useViewport();
  return width;
}
