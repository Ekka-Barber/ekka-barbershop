
type PlatformType = 'ios' | 'android' | 'desktop' | 'unsupported';
type InstallationStatus = 'not-installed' | 'installed' | 'installing' | 'unsupported';
type DeviceModel = 'iPhone' | 'iPad' | 'Android' | 'Desktop' | 'Unknown';
type BrowserType = 'safari' | 'chrome' | 'firefox' | 'edge' | 'opera' | 'samsung' | 'other';

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
 * Checks if the device supports specific features like
 * vibration, touch, etc.
 * @returns Object with support flags
 */
export const getDeviceCapabilities = () => {
  return {
    vibration: 'vibrate' in navigator,
    touch: 'ontouchstart' in window,
    orientation: 'orientation' in window || 'orientation' in window.screen,
    motion: 'DeviceMotionEvent' in window,
    geolocation: 'geolocation' in navigator,
    notification: 'Notification' in window,
    share: 'share' in navigator,
    bluetooth: 'bluetooth' in navigator,
    camera: 'mediaDevices' in navigator
  };
};
