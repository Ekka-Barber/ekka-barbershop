/**
 * Disables error logging by overriding window.onerror and related error handling functions
 */
export const disableErrorLogging = () => {
  // Store original error handlers
  const originalHandlers = {
    onerror: window.onerror,
    onunhandledrejection: window.onunhandledrejection,
    consoleError: console.error
  };

  // No-op error handler
  const noopErrorHandler = () => false;

  // Override global error handlers
  window.onerror = noopErrorHandler;
  window.onunhandledrejection = noopErrorHandler;
  
  // Override console.error (in case it gets restored)
  console.error = () => {};

  // Return function to restore original error handling if needed
  return () => {
    window.onerror = originalHandlers.onerror;
    window.onunhandledrejection = originalHandlers.onunhandledrejection;
    console.error = originalHandlers.consoleError;
  };
}; 
