
import { DeviceType } from './types';
import { PlatformType } from '../platformDetection';

export const mapPlatformToDeviceType = (platform: PlatformType): DeviceType => {
  switch (platform) {
    case 'mobile':
      return 'mobile';
    case 'tablet':
      return 'tablet';
    default:
      return 'desktop';
  }
};

export const getBrowserInfo = (): Record<string, any> => {
  return {
    userAgent: window.navigator.userAgent,
    language: window.navigator.language,
    platform: window.navigator.platform,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight
    }
  };
};

export const tryTracking = async (trackingFn: () => Promise<void>): Promise<void> => {
  try {
    await trackingFn();
  } catch (error) {
    console.error('Tracking operation failed:', error);
  }
};
