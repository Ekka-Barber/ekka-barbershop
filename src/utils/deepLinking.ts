
import { getPlatformType, getInstallationStatus } from "@/services/platformDetection";

export const openExternalLink = (url: string) => {
  const platform = getPlatformType();
  const installStatus = getInstallationStatus();
  const isIOSPWA = platform === 'ios' && installStatus === 'installed';

  if (isIOSPWA) {
    // Create a temporary link element for iOS PWA
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
    
    // These attributes help iOS understand this is an external link
    link.setAttribute('data-external', 'true');
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    // For all other platforms, use window.open
    const newWindow = window.open(url, '_blank');
    if (!newWindow) {
      // If popup was blocked, try direct navigation
      window.location.href = url;
    }
  }
};
