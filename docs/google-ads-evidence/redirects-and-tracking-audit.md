# Redirects and Tracking Audit - Google Ads Compliance

## Redirect Analysis

### HTTP to HTTPS Redirects
- **Mechanism**: Automatic browser/Cloudflare redirect
- **Impact**: Standard security redirect, affects all user agents equally
- **Compliance**: ✅ PASS - No content changes based on user agent

### Client-Side Redirects (React Router)
**Location**: `src/App.tsx`
```javascript
// Root redirect
<Route path="/" element={<Navigate to="/customer" replace />} />

// Catch-all redirect
<Route path="*" element={<Navigate to="/customer" replace />} />
```
- **Purpose**: Single Page Application routing
- **Trigger**: Automatic on page load
- **Impact**: Same redirect for all user agents
- **Compliance**: ✅ PASS - Standard SPA behavior, no cloaking

### QR Code Redirects
**Location**: `supabase/functions/qr-redirect/index.ts`
```javascript
return new Response(null, {
  status: 302,
  headers: {
    'Location': qrCode.url,
    'Cache-Control': 'no-cache'
  }
})
```
- **Purpose**: QR code URL redirection
- **Trigger**: User scans QR code
- **Impact**: Server-side redirect based on database lookup
- **Compliance**: ✅ PASS - No user-agent dependent logic

## Tracking Parameters Audit

### Google Ads Parameters (GCLID)
- **Detection**: No GCLID handling found in codebase
- **Impact**: Parameters are ignored, no content changes
- **Compliance**: ✅ PASS - Parameters don't affect content

### UTM Parameters
- **Detection**: No UTM parameter processing in application logic
- **Impact**: URL parameters don't change content or routing
- **Compliance**: ✅ PASS - Standard tracking parameters only

### Analytics Implementation
**Google Analytics 4 (GA4)**:
```javascript
gtag('config', 'G-85975JPERF');
```
- **Location**: `public/index.html` and `dist/index.html`
- **Impact**: Client-side tracking only, no server-side content changes
- **Compliance**: ✅ PASS - Measurement only, no cloaking

**TikTok Pixel**:
```javascript
ttq.load('CURE1FJC77UAVCG31EJG');
```
- **Location**: `public/index.html` and `dist/index.html`
- **Impact**: Client-side tracking only
- **Compliance**: ✅ PASS - Measurement only, no cloaking

## Popup/Modal Analysis

### Marketing Dialog
**Location**: `src/hooks/useMarketingDialog.ts`
```javascript
const [dialogState, setDialogState] = useState<MarketingDialogState>({
  open: false,  // ← Starts closed
  contentType: 'menu',
  currentIndex: 0
});
```
- **Trigger**: User interaction only (button clicks)
- **Impact**: No automatic popups on first paint
- **Compliance**: ✅ PASS - User-initiated only

## Conclusion
All redirects and tracking mechanisms are compliant with Google Ads policies:
- No user-agent based content branching
- No automatic popups hiding primary content
- Tracking parameters don't affect content display
- Standard web redirects that work identically for all clients
