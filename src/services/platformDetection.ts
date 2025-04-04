type PlatformType = 'ios' | 'android' | 'desktop' | 'unsupported';
type InstallationStatus = 'not-installed' | 'installed' | 'installing' | 'unsupported';
type DeviceModel = 'iPhone' | 'iPad' | 'Android' | 'Desktop' | 'Unknown';
type BrowserType = 'safari' | 'chrome' | 'firefox' | 'edge' | 'opera' | 'samsung' | 'other';
type iOSVersion = { major: number; minor: number; patch: number } | null;
type ConnectionType = 'wifi' | 'cellular' | 'unknown' | 'none';

// Define interfaces for non-standard or experimental APIs
interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

interface NetworkInformation {
  type?: ConnectionType;
  effectiveType?: string;
  saveData?: boolean;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation;
}

/**
 * Detects the user's platform (iOS, Android, Desktop, etc.)
 * @returns The detected platform type
 */
export const getPlatformType = (): PlatformType => {
  const userAgent = navigator.userAgent.toLowerCase();
  
  // iOS detection with specific device models
  if (/iphone|ipad|ipod/.test(userAgent)) return 'ios';
  
  // Android detection
  if (/android/.test(userAgent)) return 'android';
  
  // Desktop detection
  if (/windows|macintosh|linux/.test(userAgent)) return 'desktop';
  
  // Fallback
  return 'unsupported';
};

/**
 * Gets detailed information about the device model
 * @returns The device model information
 */
export const getDeviceModel = (): DeviceModel => {
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (/iphone/.test(userAgent)) return 'iPhone';
  if (/ipad/.test(userAgent)) return 'iPad';
  if (/android/.test(userAgent)) return 'Android';
  if (/windows|macintosh|linux/.test(userAgent)) return 'Desktop';
  
  return 'Unknown';
};

/**
 * Detects the user's browser
 * @returns The detected browser type
 */
export const getBrowserType = (): BrowserType => {
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (/safari/.test(userAgent) && !/chrome/.test(userAgent)) return 'safari';
  if (/chrome/.test(userAgent) && !/edg/.test(userAgent)) return 'chrome';
  if (/firefox/.test(userAgent)) return 'firefox';
  if (/edg/.test(userAgent)) return 'edge';
  if (/opera/.test(userAgent) || /opr/.test(userAgent)) return 'opera';
  if (/samsungbrowser/.test(userAgent)) return 'samsung';
  
  return 'other';
};

/**
 * Gets the iOS version if the user is on an iOS device
 * @returns The iOS version or null if not on iOS
 */
export const getiOSVersion = (): iOSVersion => {
  const userAgent = navigator.userAgent;
  const platform = getPlatformType();
  
  if (platform !== 'ios') return null;
  
  // Match version pattern like "OS 15_4_1" for iOS
  const match = userAgent.match(/OS\s+(\d+)_(\d+)_?(\d+)?/);
  
  if (match) {
    return {
      major: parseInt(match[1], 10),
      minor: parseInt(match[2], 10),
      patch: match[3] ? parseInt(match[3], 10) : 0
    };
  }
  
  return null;
};

/**
 * Checks if the app is running in standalone mode (installed as PWA)
 * @returns True if running as installed PWA
 */
export const isRunningAsStandalone = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as NavigatorWithStandalone).standalone === true ||
    document.referrer.includes('android-app://');
};

/**
 * Gets the installation status of the app
 * @returns The installation status
 */
export const getInstallationStatus = (): InstallationStatus => {
  if (isRunningAsStandalone()) return 'installed';
  
  const platform = getPlatformType();
  if (platform === 'unsupported' || platform === 'desktop') return 'unsupported';
  
  return 'not-installed';
};

/**
 * Checks if the device can install the PWA
 * @returns True if the device supports PWA installation
 */
export const canInstallPWA = (): boolean => {
  const platform = getPlatformType();
  const browser = getBrowserType();
  
  // iOS can only install from Safari
  if (platform === 'ios' && browser === 'safari') return true;
  
  // Android can install from Chrome and Samsung browsers
  if (platform === 'android' && (browser === 'chrome' || browser === 'samsung')) return true;
  
  return false;
};

/**
 * Checks if service workers are supported by the browser
 * @returns True if service workers are supported
 */
export const isServiceWorkerSupported = (): boolean => {
  return 'serviceWorker' in navigator && 'PushManager' in window;
};

/**
 * Gets the connection information of the device
 * @returns The connection type
 */
export const getConnectionInfo = (): { type: ConnectionType, effectiveType?: string, saveData?: boolean } => {
  if ('connection' in navigator) {
    const connection = (navigator as NavigatorWithConnection).connection;
    
    if (connection) {
      let type: ConnectionType = 'unknown';
      
      if (connection.type === 'wifi') type = 'wifi';
      else if (connection.type === 'cellular') type = 'cellular';
      else if (connection.type === 'none') type = 'none';
      
      return {
        type,
        effectiveType: connection.effectiveType,
        saveData: connection.saveData
      };
    }
  }
  
  return { type: 'unknown' };
};

/**
 * Checks if the device supports specific features like
 * vibration, touch, etc.
 * @returns Object with support flags
 */
export const getDeviceCapabilities = () => {
  const typedWindow = window as Window & typeof globalThis;
  return {
    vibration: 'vibrate' in navigator,
    touch: 'ontouchstart' in typedWindow,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    orientation: 'orientation' in window || 'orientation' in (window as any).screen,
    motion: 'DeviceMotionEvent' in typedWindow,
    geolocation: 'geolocation' in navigator,
    notification: 'Notification' in window,
    share: 'share' in navigator,
    bluetooth: 'bluetooth' in navigator,
    camera: 'mediaDevices' in navigator,
    // New capabilities
    batteryAPI: 'getBattery' in navigator,
    screenWakeLock: 'wakeLock' in navigator,
    webPayment: 'PaymentRequest' in window,
    credentials: 'credentials' in navigator,
    offlineStorage: 'storage' in navigator && 'estimate' in (navigator.storage || {})
  };
};

/**
 * Detects if the user prefers reduced motion
 * @returns True if the user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Detects if the user prefers dark mode
 * @returns True if the user prefers dark mode
 */
export const prefersDarkMode = (): boolean => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

/**
 * Registers listeners for online/offline status
 * @param onOnline Function to call when online
 * @param onOffline Function to call when offline
 * @returns Cleanup function
 */
export const registerConnectivityListeners = (
  onOnline: () => void,
  onOffline: () => void
): () => void => {
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);
  
  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
};

/**
 * Gets the device viewport dimensions accounting for safe areas
 * @returns Object with viewport dimensions
 */
export const getViewportDimensions = () => {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
};
