
import { getPlatformType } from "@/services/platformDetection";
import { DeviceType } from './types';

export const mapPlatformToDeviceType = (platform: ReturnType<typeof getPlatformType>): DeviceType => {
  switch (platform) {
    case 'ios':
    case 'android':
      return 'mobile';
    case 'desktop':
    default:
      return 'desktop';
  }
};

export const getBrowserInfo = () => {
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: getPlatformType(),
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
  };
};

export const tryTracking = async (operation: () => Promise<any>, maxRetries = 3): Promise<any> => {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      return await operation();
    } catch (error) {
      retries++;
      if (retries === maxRetries) {
        console.error('Tracking failed after max retries:', error);
        return null;
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * retries));
    }
  }
};
