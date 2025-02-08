
type PlatformType = 'ios' | 'android' | 'desktop' | 'unsupported';
type InstallationStatus = 'not-installed' | 'installed' | 'installing' | 'unsupported';

export const getPlatformType = (): PlatformType => {
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
