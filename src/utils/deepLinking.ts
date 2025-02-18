
import { getPlatformType } from "@/services/platformDetection";

// Better iOS PWA detection
const isIOSPWA = () => {
  const isIOS = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
  return isIOS && ('standalone' in window.navigator) && (window.navigator as any).standalone === true;
};

// Format WhatsApp URL for iOS PWA
const formatWhatsAppUrl = (url: string) => {
  if (isIOSPWA()) {
    // Use whatsapp:// scheme for iOS PWA
    const baseUrl = url.replace('https://wa.me/', '');
    return `whatsapp://send/${baseUrl}`;
  }
  return url;
};

export const openExternalLink = (url: string) => {
  const platform = getPlatformType();
  
  // Special handling for WhatsApp URLs
  if (url.includes('wa.me') || url.includes('whatsapp')) {
    const formattedUrl = formatWhatsAppUrl(url);
    
    if (isIOSPWA()) {
      // For iOS PWA, use window.location.href directly
      window.location.href = formattedUrl;
      return;
    }
  }

  // For all other cases, try window.open first
  const newWindow = window.open(url, '_blank');
  if (!newWindow) {
    // If popup was blocked, try direct navigation
    window.location.href = url;
  }
};

