
/**
 * Detects if the current device is running iOS
 */
export const isIOS = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && 
         !(window as any).MSStream;
};

/**
 * Detects if the current device is running Android
 */
export const isAndroid = (): boolean => {
  return /android/i.test(navigator.userAgent);
};

/**
 * Detects if the current device is a mobile device
 */
export const isMobile = (): boolean => {
  return isIOS() || isAndroid();
};

/**
 * Detects if the browser has proper support for overscroll-behavior
 */
export const hasOverscrollBehaviorSupport = (): boolean => {
  // The vast majority of modern browsers support this
  return CSS.supports('overscroll-behavior: contain');
};

/**
 * Platform-specific pull-to-refresh settings type
 */
export interface PlatformPullSettings {
  disabled?: boolean;
  pullResistance?: number;
  topScrollThreshold?: number;
}

/**
 * Provides appropriate pull-to-refresh settings based on the platform
 */
export const getPlatformPullSettings = (): PlatformPullSettings => {
  if (isIOS()) {
    return {
      // iOS has native pull-to-refresh that conflicts with custom implementations
      disabled: true, 
      pullResistance: 0.25, // More resistance if enabled
      topScrollThreshold: 0, // iOS is very strict about top detection
    };
  }
  
  if (isAndroid()) {
    return {
      disabled: false,
      pullResistance: 0.35, // Android can handle slightly more resistance
      topScrollThreshold: 2, // Android allows a little more tolerance
    };
  }
  
  // Default settings for other platforms (desktop)
  return {
    disabled: false,
    pullResistance: 0.3,
    topScrollThreshold: 1,
  };
};
