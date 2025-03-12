
/**
 * Updates the manifest link in the document head to use either the regular or admin manifest
 * @param manifestPath Path to the manifest file
 */
export const updateManifestLink = (manifestPath: string): void => {
  let manifestLink = document.querySelector('link[rel="manifest"]');
  
  if (!manifestLink) {
    // Create the link if it doesn't exist
    manifestLink = document.createElement('link');
    manifestLink.setAttribute('rel', 'manifest');
    document.head.appendChild(manifestLink);
  }
  
  // Update the href attribute with the cross-origin attribute preserved
  const currentHref = manifestLink.getAttribute('href') || '';
  const hasParams = currentHref.includes('?');
  
  // Extract any existing query parameters that should be preserved
  const queryParams = hasParams ? currentHref.split('?')[1] : '';
  const newHref = hasParams
    ? `${manifestPath}?${queryParams}`
    : manifestPath;
  
  manifestLink.setAttribute('href', newHref);
  manifestLink.setAttribute('crossorigin', 'use-credentials');
  
  // Update theme color to match the manifest
  const themeColor = document.querySelector('meta[name="theme-color"]');
  if (themeColor) {
    // Gold for regular app, darker for admin
    themeColor.setAttribute('content', manifestPath.includes('admin') ? '#44403C' : '#C4A36F');
  }
  
  console.log(`Manifest updated to: ${manifestPath}`);
};
