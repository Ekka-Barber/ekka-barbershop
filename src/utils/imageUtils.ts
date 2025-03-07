
/**
 * Utility functions for image optimization and handling
 */

/**
 * Generates a WebP version URL from a standard image URL
 * @param url Original image URL
 * @returns WebP version URL
 */
export function getWebPUrl(url: string): string {
  // Check if URL already has a query parameter
  const hasQuery = url.includes('?');
  // Add format=webp parameter
  return `${url}${hasQuery ? '&' : '?'}format=webp`;
}

/**
 * Calculates aspect ratio dimensions from an original width and height
 * @param originalWidth Original width
 * @param originalHeight Original height
 * @param targetWidth Desired width
 * @returns Object with calculated width and height
 */
export function calculateAspectRatioDimensions(
  originalWidth: number,
  originalHeight: number,
  targetWidth: number
): { width: number; height: number } {
  const aspectRatio = originalWidth / originalHeight;
  const calculatedHeight = Math.round(targetWidth / aspectRatio);
  
  return {
    width: targetWidth,
    height: calculatedHeight
  };
}

/**
 * Generates a responsive image srcset for different screen sizes
 * @param baseUrl Base image URL
 * @param widths Array of widths to generate
 * @returns srcset string
 */
export function generateSrcSet(baseUrl: string, widths: number[]): string {
  return widths
    .map(width => {
      // Check if URL already has a query parameter
      const hasQuery = baseUrl.includes('?');
      // Add width parameter
      return `${baseUrl}${hasQuery ? '&' : '?'}width=${width} ${width}w`;
    })
    .join(', ');
}

/**
 * Detects if WebP is supported in the current browser
 * @returns Promise that resolves to true if WebP is supported
 */
export async function isWebPSupported(): Promise<boolean> {
  // Create a test WebP image in memory
  return new Promise(resolve => {
    const webP = new Image();
    webP.onload = () => resolve(true);
    webP.onerror = () => resolve(false);
    webP.src = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
  });
}

/**
 * Gets image dimensions from a URL
 * @param url Image URL
 * @returns Promise that resolves to image dimensions
 */
export function getImageDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = reject;
    img.src = url;
  });
}
