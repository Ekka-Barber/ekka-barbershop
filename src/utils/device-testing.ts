/**
 * Device testing utilities for responsive design testing
 */

// Device viewport definitions
export const deviceViewports = {
  // Mobile devices
  iphoneSE: {
    width: 375,
    height: 667,
    deviceScaleFactor: 2,
    name: 'iPhone SE',
    type: 'mobile'
  },
  iphone14: {
    width: 390,
    height: 844,
    deviceScaleFactor: 3,
    name: 'iPhone 14',
    type: 'mobile'
  },
  iphone14ProMax: {
    width: 430,
    height: 932,
    deviceScaleFactor: 3,
    name: 'iPhone 14 Pro Max',
    type: 'mobile'
  },
  pixel7: {
    width: 412,
    height: 915,
    deviceScaleFactor: 2.8,
    name: 'Google Pixel 7',
    type: 'mobile'
  },
  galaxyS23: {
    width: 360,
    height: 800,
    deviceScaleFactor: 3,
    name: 'Samsung Galaxy S23',
    type: 'mobile'
  },
  
  // Tablets
  ipadAir: {
    width: 820,
    height: 1180,
    deviceScaleFactor: 2,
    name: 'iPad Air',
    type: 'tablet'
  },
  galaxyTabS8: {
    width: 800,
    height: 1280,
    deviceScaleFactor: 2,
    name: 'Samsung Galaxy Tab S8',
    type: 'tablet'
  },
  
  // Desktop breakpoints
  desktop: {
    width: 1280,
    height: 800,
    deviceScaleFactor: 1,
    name: 'Desktop',
    type: 'desktop'
  },
  desktopLarge: {
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
    name: 'Desktop Large',
    type: 'desktop'
  }
};

export type DeviceType = 'mobile' | 'tablet' | 'desktop';
export type DeviceOrientation = 'portrait' | 'landscape';

/**
 * Detect the current device type based on window width
 * @returns The detected device type
 */
export const detectDeviceType = (): DeviceType => {
  if (typeof window === 'undefined') return 'desktop';
  
  const width = window.innerWidth;
  if (width < 640) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

/**
 * Detect the current device orientation
 * @returns The current orientation
 */
export const detectOrientation = (): DeviceOrientation => {
  if (typeof window === 'undefined') return 'portrait';
  return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
};

/**
 * Check if the current viewport matches a specific device
 * @param device The device to check against
 * @returns Whether the current viewport matches the device
 */
export const isDevice = (device: keyof typeof deviceViewports): boolean => {
  if (typeof window === 'undefined') return false;
  
  const targetDevice = deviceViewports[device];
  const currentWidth = window.innerWidth;
  
  // Allow a small margin of error (5%)
  const marginOfError = targetDevice.width * 0.05;
  return Math.abs(currentWidth - targetDevice.width) <= marginOfError;
};

/**
 * Get the device name that most closely matches the current viewport
 * @returns The name of the closest matching device
 */
export const getClosestDeviceName = (): string => {
  if (typeof window === 'undefined') return 'Unknown';
  
  const currentWidth = window.innerWidth;
  let closestDevice = 'Unknown';
  let smallestDifference = Number.MAX_VALUE;
  
  Object.entries(deviceViewports).forEach(([, deviceInfo]) => {
    const difference = Math.abs(currentWidth - deviceInfo.width);
    if (difference < smallestDifference) {
      smallestDifference = difference;
      closestDevice = deviceInfo.name;
    }
  });
  
  return closestDevice;
};

/**
 * Hook to track window resize events and detect device changes
 * @param onDeviceChange Callback when device type changes
 */
export const useDeviceDetection = (
  onDeviceChange?: (deviceType: DeviceType, orientation: DeviceOrientation) => void
) => {
  if (typeof window === 'undefined') return;
  
  let lastDeviceType = detectDeviceType();
  let lastOrientation = detectOrientation();
  
  const handleResize = () => {
    const currentDeviceType = detectDeviceType();
    const currentOrientation = detectOrientation();
    
    if (
      currentDeviceType !== lastDeviceType || 
      currentOrientation !== lastOrientation
    ) {
      lastDeviceType = currentDeviceType;
      lastOrientation = currentOrientation;
      
      if (onDeviceChange) {
        onDeviceChange(currentDeviceType, currentOrientation);
      }
    }
  };
  
  window.addEventListener('resize', handleResize);
  
  return () => {
    window.removeEventListener('resize', handleResize);
  };
};

/**
 * Get testing information about the current device/viewport
 * @returns Object with device testing information
 */
export const getDeviceInfo = () => {
  const deviceType = detectDeviceType();
  const orientation = detectOrientation();
  const closestDevice = getClosestDeviceName();
  
  return {
    deviceType,
    orientation,
    closestDevice,
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    devicePixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : 1,
    isTouch: typeof navigator !== 'undefined' && 
      ('maxTouchPoints' in navigator && navigator.maxTouchPoints > 0)
  };
};

/**
 * Class to help simulate different device viewports for testing
 */
export class DeviceSimulator {
  private originalBodyOverflow: string;
  private simulationElement: HTMLDivElement | null = null;
  
  constructor() {
    if (typeof document !== 'undefined') {
      this.originalBodyOverflow = document.body.style.overflow;
    } else {
      this.originalBodyOverflow = 'auto';
    }
  }
  
  /**
   * Simulate a specific device viewport
   * @param device The device to simulate
   * @param orientation The orientation to simulate
   */
  simulateDevice(device: keyof typeof deviceViewports, orientation: DeviceOrientation = 'portrait') {
    if (typeof document === 'undefined') return;
    
    const deviceInfo = deviceViewports[device];
    
    // Create simulation container if it doesn't exist
    if (!this.simulationElement) {
      this.simulationElement = document.createElement('div');
      this.simulationElement.style.position = 'fixed';
      this.simulationElement.style.top = '0';
      this.simulationElement.style.left = '0';
      this.simulationElement.style.zIndex = '9999';
      this.simulationElement.style.backgroundColor = '#f0f0f0';
      this.simulationElement.style.border = '2px solid #333';
      this.simulationElement.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';
      this.simulationElement.style.overflow = 'auto';
      document.body.appendChild(this.simulationElement);
    }
    
    // Set dimensions based on orientation
    const width = orientation === 'portrait' ? deviceInfo.width : deviceInfo.height;
    const height = orientation === 'portrait' ? deviceInfo.height : deviceInfo.width;
    
    // Position in center of screen
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    // Calculate scale to fit screen (max 1.0)
    const scale = Math.min(
      1.0,
      (screenWidth * 0.9) / width,
      (screenHeight * 0.9) / height
    );
    
    // Set simulation container style
    this.simulationElement.style.width = `${width}px`;
    this.simulationElement.style.height = `${height}px`;
    this.simulationElement.style.transform = `scale(${scale})`;
    this.simulationElement.style.transformOrigin = 'top left';
    
    // Center in viewport
    const leftPos = (screenWidth - (width * scale)) / 2;
    const topPos = (screenHeight - (height * scale)) / 2;
    this.simulationElement.style.left = `${leftPos}px`;
    this.simulationElement.style.top = `${topPos}px`;
    
    // Lock body scroll
    document.body.style.overflow = 'hidden';
    
    // Add device info banner
    const banner = document.createElement('div');
    banner.style.backgroundColor = '#333';
    banner.style.color = '#fff';
    banner.style.padding = '5px 10px';
    banner.style.fontSize = '12px';
    banner.style.position = 'absolute';
    banner.style.top = '0';
    banner.style.left = '0';
    banner.style.right = '0';
    banner.style.zIndex = '1';
    banner.style.textAlign = 'center';
    banner.innerHTML = `
      <div>${deviceInfo.name} - ${orientation}</div>
      <div>${width} × ${height} (${deviceInfo.deviceScaleFactor}x)</div>
    `;
    
    this.simulationElement.innerHTML = '';
    this.simulationElement.appendChild(banner);
    
    // Clone the current page content
    const contentContainer = document.createElement('div');
    contentContainer.style.width = '100%';
    contentContainer.style.height = 'calc(100% - 30px)';
    contentContainer.style.marginTop = '30px';
    contentContainer.style.overflow = 'auto';
    contentContainer.style.position = 'relative';
    
    // Wrap current page content
    const pageContent = document.querySelector('#root') || document.querySelector('body > div:first-child');
    if (pageContent) {
      const clonedContent = pageContent.cloneNode(true) as HTMLElement;
      contentContainer.appendChild(clonedContent);
    } else {
      contentContainer.innerHTML = '<div style="padding: 20px">Content could not be cloned for simulation</div>';
    }
    
    this.simulationElement.appendChild(contentContainer);
  }
  
  /**
   * Stop device simulation and restore original view
   */
  stopSimulation() {
    if (typeof document === 'undefined') return;
    
    // Remove simulation container if it exists
    if (this.simulationElement && this.simulationElement.parentNode) {
      this.simulationElement.parentNode.removeChild(this.simulationElement);
      this.simulationElement = null;
    }
    
    // Restore body scroll
    document.body.style.overflow = this.originalBodyOverflow;
  }
}

// Singleton instance for easy access
export const deviceSimulator = typeof window !== 'undefined' ? new DeviceSimulator() : null; 