
type PlatformType = 'ios' | 'android' | 'desktop' | 'unsupported';
type InstallationStatus = 'not-installed' | 'installed' | 'installing' | 'unsupported';
type DeviceModel = 'iPhone' | 'iPad' | 'Android' | 'Desktop' | 'Unknown';
type BrowserType = 'safari' | 'chrome' | 'firefox' | 'edge' | 'opera' | 'samsung' | 'other';
type iOSVersion = { major: number; minor: number; patch: number } | null;
type ConnectionType = 'wifi' | 'cellular' | 'unknown' | 'none';

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
    (window.navigator as any).standalone === true ||
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
    const connection = (navigator as any).connection;
    
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
 * Checks if the device has a notch (iPhone X and newer)
 * @returns True if the device likely has a notch
 */
export const hasNotch = (): boolean => {
  // Check if the device is an iPhone and has iOS 11 or higher (which introduced the notch)
  const userAgent = navigator.userAgent.toLowerCase();
  const isIphone = /iphone/.test(userAgent);
  
  if (!isIphone) return false;
  
  // Check for iOS version 11 or higher
  const iosVersion = userAgent.match(/os (\d+)_/);
  if (iosVersion && parseInt(iosVersion[1], 10) >= 11) {
    // Check if the environment supports safe area insets
    const hasSafeArea = CSS.supports('padding-top: env(safe-area-inset-top)');
    if (hasSafeArea) {
      // Get computed style of an element with safe area padding
      const testDiv = document.createElement('div');
      testDiv.style.paddingTop = 'env(safe-area-inset-top)';
      document.body.appendChild(testDiv);
      const computedStyle = window.getComputedStyle(testDiv);
      document.body.removeChild(testDiv);
      
      // If the safe area inset is greater than 0, the device likely has a notch
      return computedStyle.paddingTop !== '0px';
    }
  }
  
  return false;
};

/**
 * Get detailed information about safe area insets
 * @returns Object with safe area inset values
 */
export const getSafeAreaInsets = () => {
  const testDiv = document.createElement('div');
  Object.assign(testDiv.style, {
    position: 'fixed',
    width: '100%',
    height: '100%',
    paddingTop: 'env(safe-area-inset-top)',
    paddingRight: 'env(safe-area-inset-right)',
    paddingBottom: 'env(safe-area-inset-bottom)',
    paddingLeft: 'env(safe-area-inset-left)'
  });
  
  document.body.appendChild(testDiv);
  const computedStyle = window.getComputedStyle(testDiv);
  
  const insets = {
    top: computedStyle.paddingTop,
    right: computedStyle.paddingRight,
    bottom: computedStyle.paddingBottom,
    left: computedStyle.paddingLeft
  };
  
  document.body.removeChild(testDiv);
  return insets;
};

/**
 * Checks if the device supports specific features like
 * vibration, touch, etc.
 * @returns Object with support flags
 */
export const getDeviceCapabilities = () => {
  return {
    vibration: 'vibrate' in navigator,
    touch: 'ontouchstart' in window,
    orientation: 'orientation' in window || 'orientation' in (window as any).screen,
    motion: 'DeviceMotionEvent' in window,
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
    safeAreaInsets: getSafeAreaInsets()
  };
};
