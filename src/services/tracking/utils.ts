
import { DeviceType } from './types';

export const mapPlatformToDeviceType = (platform: string): DeviceType => {
  switch (platform) {
    case 'ios':
    case 'android':
      return 'mobile';
    default:
      return 'desktop';
  }
};

export const createTrackingEvent = (type: string): { interaction_type: string; created_at: string } => {
  return {
    interaction_type: type,
    created_at: new Date().toISOString()
  };
};
