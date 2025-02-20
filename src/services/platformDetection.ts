
type PlatformType = 'ios' | 'android' | 'desktop' | 'unsupported';
type InstallationStatus = 'not-installed' | 'installed' | 'installing' | 'unsupported';

interface DevOverrides {
  platform?: PlatformType;
  installed?: boolean;
}

// Development overrides - only active in development
const DEV_MODE = import.meta.env.DEV;
let devOverrides: DevOverrides = {};

export const setDeviceOverride = (platform: PlatformType | null) => {
  if (DEV_MODE) {
    devOverrides.platform = platform || undefined;
  }
};

export const setInstalledOverride = (installed: boolean | null) => {
  if (DEV_MODE) {
    devOverrides.installed = installed === null ? undefined : installed;
  }
};

export const getPlatformType = (): PlatformType => {
  // If we have a development override, use it
  if (DEV_MODE && devOverrides.platform) {
    return devOverrides.platform;
  }

  const userAgent = navigator.userAgent.toLowerCase();
  const standalone = (window.navigator as any).standalone;
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  const isAndroid = /android/.test(userAgent);
  
  if (isIOS) return 'ios';
  if (isAndroid) return 'android';
  if (/windows|macintosh|linux/.test(userAgent)) return 'desktop';
  return 'unsupported';
};

export const getInstallationStatus = (): InstallationStatus => {
  // If we have a development override, use it
  if (DEV_MODE && devOverrides.installed !== undefined) {
    return devOverrides.installed ? 'installed' : 'not-installed';
  }

  const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone ||
    document.referrer.includes('android-app://');

  if (isStandalone) return 'installed';
  
  const platform = getPlatformType();
  if (platform === 'unsupported') return 'unsupported';
  
  return 'not-installed';
};

export const canInstallPWA = (): boolean => {
  const platform = getPlatformType();
  return platform === 'ios' || platform === 'android';
};

export const isServiceWorkerSupported = (): boolean => {
  return 'serviceWorker' in navigator && 'PushManager' in window;
};
