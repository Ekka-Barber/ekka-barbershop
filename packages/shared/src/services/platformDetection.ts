type PlatformType = 'ios' | 'android' | 'desktop' | 'unsupported';
type InstallationStatus = 'not-installed' | 'installed' | 'installing' | 'unsupported';
type BrowserType = 'safari' | 'chrome' | 'firefox' | 'edge' | 'opera' | 'samsung' | 'other';

// Define interfaces for non-standard or experimental APIs
interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

/**
 * Detects user's platform (iOS, Android, Desktop, etc.)
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
 * Detects user's browser
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
 * Checks if app is running in standalone mode (installed as PWA)
 * @returns True if running as installed PWA
 */
export const isRunningAsStandalone = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as NavigatorWithStandalone).standalone === true ||
    document.referrer.includes('android-app://');
};

/**
 * Gets installation status of app
 * @returns The installation status
 */
export const getInstallationStatus = (): InstallationStatus => {
  if (isRunningAsStandalone()) return 'installed';

  const platform = getPlatformType();
  if (platform === 'unsupported' || platform === 'desktop') return 'unsupported';

  return 'not-installed';
};

/**
 * Checks if device can install PWA
 * @returns True if device supports PWA installation
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
