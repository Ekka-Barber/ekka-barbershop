
// Service worker version
const VERSION = '1.0.0';

/**
 * Log an informational message from the service worker
 * @param {string} message - The message to log
 * @param {*} data - Optional data to include with the log
 */
export function log(message, data) {
  const timestamp = new Date().toISOString();
  const prefix = `[ServiceWorker ${VERSION}] ${timestamp} - `;
  
  if (data) {
    console.log(prefix + message, data);
  } else {
    console.log(prefix + message);
  }
}

/**
 * Log an error message from the service worker
 * @param {string} message - The error message
 * @param {Error|*} error - The error object or data
 */
export function logError(message, error) {
  const timestamp = new Date().toISOString();
  const prefix = `[ServiceWorker ${VERSION}] ${timestamp} - `;
  
  console.error(prefix + message, error);
}
