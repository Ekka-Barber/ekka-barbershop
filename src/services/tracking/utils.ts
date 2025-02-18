
import { DeviceType } from './types/base';

export const mapPlatformToDeviceType = (platform: string): DeviceType => {
  switch (platform) {
    case 'ios':
    case 'android':
      return 'mobile';
    case 'tablet':
      return 'tablet';
    default:
      return 'desktop';
  }
};

export const formatTimestamp = (date: Date): string => {
  return date.toISOString();
};

export const tryTracking = async (fn: () => Promise<void>): Promise<void> => {
  try {
    await fn();
  } catch (error) {
    console.error('Error in tracking operation:', error);
  }
};

export const createTrackingEvent = (type: string): { 
  interaction_type: string; 
  timestamp: string;
} => {
  return {
    interaction_type: type,
    timestamp: formatTimestamp(new Date())
  };
};
