# Analytics Stack Documentation - Google Ads Compliance

## Overview
This document outlines the analytics and tracking implementation for Ekka Barbershop, demonstrating that all tracking is purely for measurement purposes and does not affect content delivery or user experience.

## Analytics Implementation

### Google Analytics 4 (GA4)
- **Purpose**: Website traffic analysis and user behavior tracking
- **Implementation**: Standard gtag.js async loading
- **Configuration ID**: `G-85975JPERF`
- **Loading Method**: Asynchronous, non-blocking
- **Content Impact**: None - does not modify DOM, URLs, or routing
- **Compliance**: ✅ Does not interfere with content parity between bots and users

**Code Location**: `index.html` lines 12-20
```javascript
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-85975JPERF"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-85975JPERF');
</script>
```

### TikTok Pixel
- **Purpose**: Social media advertising attribution and audience building
- **Implementation**: Standard TikTok pixel with page view tracking
- **Pixel ID**: `CURE1FJC77UAVCG31EJG`
- **Loading Method**: Asynchronous after page load
- **Content Impact**: None - passive measurement only
- **Compliance**: ✅ Does not interfere with content parity between bots and users

**Code Location**: `index.html` lines 116-128
```javascript
<!-- TikTok Pixel Code Start -->
<script>
  window.addEventListener('load', function() {
    !function (w, d, t) {
      // Standard TikTok pixel implementation
      ttq.load('CURE1FJC77UAVCG31EJG');
      ttq.page();
    }(window, document, 'ttq');
  });
</script>
<!-- TikTok Pixel Code End -->
```

## Parameter Handling

### GCLID/UTM Parameters
- **Current Implementation**: No client-side processing of GCLID or UTM parameters
- **Content Modification**: None - parameters are not used to change content, routing, or user experience
- **Server-side Logging**: Parameters may be logged server-side by hosting platform for attribution
- **Compliance**: ✅ No content changes based on tracking parameters

### Admin Access Tokens
- **Purpose**: Administrative access to management features
- **Implementation**: URL parameter checking (`?access=` or `?token=`) for admin authentication
- **Scope**: Admin panel access only (`/admin` route)
- **Content Impact**: None for regular users - only affects admin authentication
- **Compliance**: ✅ Does not affect landing page content or user experience

## Measurement-Only Guarantee

### Code Analysis
1. **No Content Branching**: No conditional rendering based on UTM/GCLID parameters
2. **No URL Rewriting**: Analytics code does not modify browser URL or history
3. **No DOM Manipulation**: Tracking pixels do not alter page content or structure
4. **Async Loading**: All tracking scripts load asynchronously and don't block rendering
5. **No Redirects**: No automatic redirects based on tracking parameters

### Verification Methods
- **Content Parity Testing**: Same HTML served to all user agents
- **HAR File Analysis**: No additional network requests or content changes based on parameters
- **DOM Diff Testing**: Identical DOM structure for all visitors

## Compliance Evidence
- **Robots.txt**: Allows all crawlers including AdsBot access to all resources
- **Sitemap.xml**: Lists only legitimate landing pages
- **Structured Data**: Consistent business information across all implementations
- **No-JS Fallbacks**: Identical content available without JavaScript

## Maintenance Notes
- Analytics configurations should only be modified for measurement purposes
- Any new tracking implementations must be reviewed for content neutrality
- Regular audits should verify no tracking code affects content delivery
- Server-side parameter logging (if implemented) must not influence client-side content

---

**Document Version**: 1.0
**Last Updated**: November 20, 2025
**Compliance Status**: ✅ Google Ads Policy Compliant
