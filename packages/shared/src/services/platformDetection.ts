type PlatformType = 'ios' | 'android' | 'desktop' | 'unsupported';
type InstallationStatus = 'not-installed' | 'installed' | 'installing' | 'unsupported';

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
 * Checks if app is running in standalone mode (installed as PWA)
 * @returns True if running as installed PWA
 */
const isRunningAsStandalone = (): boolean => {
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
