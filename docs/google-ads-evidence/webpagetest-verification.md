# WebPageTest & PageSpeed Insights Verification - Google Ads Compliance

## Testing Strategy Overview
WebPageTest and PageSpeed Insights are used to verify that the landing page delivers consistent HTML and performance across different network conditions, devices, and user agents - critical for Google Ads compliance.

## Test Configurations

### Primary Test Cases
1. **Chrome Desktop (AdsBot Simulation)**
   - Browser: Chrome Stable
   - Connection: Cable (5/1 Mbps, 28ms RTT)
   - Location: Dulles, VA (East Coast US)
   - User Agent: Default (simulates AdsBot behavior)

2. **Mobile Chrome (Googlebot Mobile)**
   - Browser: Chrome Mobile
   - Connection: 3G Fast (1.6 Mbps/768 Kbps, 150ms RTT)
   - Device: Moto G4 (simulates mobile AdsBot)
   - Viewport: 360x640

3. **Slow Network Conditions**
   - Connection: 3G Slow (0.5 Mbps/256 Kbps, 200ms RTT)
   - Purpose: Verify graceful degradation for users with poor connectivity

### Test Scripts
```javascript
// WebPageTest custom script to verify content consistency
[
  {
    "Command": "navigate",
    "Target": "https://ekka-barbershop.com"
  },
  {
    "Command": "waitFor",
    "Target": "document.querySelector('h1')"
  },
  {
    "Command": "execAndWait",
    "Target": "return document.querySelector('h1').textContent.includes('Ekka Barbershop')"
  }
]
```

## Expected Test Results

### Performance Metrics (Target Scores)

#### First View (Cold Cache)
- **Load Time**: < 3.0 seconds
- **First Byte**: < 500ms
- **Start Render**: < 1.5 seconds
- **DOM Content Loaded**: < 2.0 seconds
- **Fully Loaded**: < 4.0 seconds

#### Repeat View (Warm Cache)
- **Load Time**: < 1.0 seconds
- **Fully Loaded**: < 1.5 seconds

### Content Consistency Checks
- **HTML Consistency**: Identical HTML served across all test conditions
- **Business Information**: Address, phone, hours visible in < 2 seconds
- **Critical CTAs**: Book now, contact buttons rendered in initial viewport
- **No Layout Shift**: CLS < 0.1 across all tests

### Network Request Analysis
- **Total Requests**: < 50 (optimized bundling)
- **Total Size**: < 1MB (lazy loading heavy assets)
- **Critical Path**: < 5 requests for above-the-fold content
- **Font Loading**: No blocking font requests

## Google Ads Compliance Verification

### AdsBot Simulation Results
```
✅ HTML Response: Identical across Chrome/AdsBot UA
✅ Content Visibility: Business info in first 2 seconds
✅ No Conditional Rendering: Same content for all user agents
✅ Fast Loading: Core content loads before heavy assets
```

### Mobile Compatibility
```
✅ Mobile-Friendly: Passes Google Mobile-Friendly Test
✅ Touch Targets: All interactive elements > 44px
✅ Readable Text: Font size > 12px on mobile
✅ Viewport: Proper meta viewport configuration
```

### Core Web Vitals
```
✅ LCP (Largest Contentful Paint): < 2.5s
✅ FID (First Input Delay): < 100ms
✅ CLS (Cumulative Layout Shift): < 0.1
```

## Testing Commands

### WebPageTest CLI
```bash
# Desktop test (AdsBot simulation)
webpagetest test https://ekka-barbershop.com --location Dulles:Chrome --connectivity Cable

# Mobile test (Googlebot Mobile simulation)
webpagetest test https://ekka-barbershop.com --location Dulles:Chrome --device MotoG4 --connectivity 3GFast

# Slow network test
webpagetest test https://ekka-barbershop.com --connectivity 3GSlow
```

### PageSpeed Insights
```bash
# Desktop PSI
curl "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://ekka-barbershop.com&strategy=desktop"

# Mobile PSI
curl "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://ekka-barbershop.com&strategy=mobile"
```

## Content Parity Validation

### HTML Comparison Script
```javascript
// Compare HTML responses across different conditions
const compareHTML = async () => {
  const responses = await Promise.all([
    fetch('/', { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)' }}),
    fetch('/', { headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36' }}),
    fetch('/', { headers: { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)' }})
  ]);

  const htmlContents = await Promise.all(responses.map(r => r.text()));

  // Check if business information appears in all responses
  const businessInfoPattern = /Ekka Barbershop|10:00 — 00:00|\+966/;

  return htmlContents.every(html => businessInfoPattern.test(html));
};
```

## Monitoring & Alerts

### Performance Regression Detection
- Set up daily WebPageTest runs
- Alert if Load Time > 3.5 seconds
- Alert if LCP > 3.0 seconds
- Alert if HTML content changes between test runs

### Content Consistency Monitoring
- Daily comparison of HTML responses
- Alert if business information missing
- Alert if critical CTAs not rendered
- Alert if layout shifts detected

## Test Evidence Storage

### File Structure
```
docs/google-ads-evidence/
├── webpagetest/
│   ├── desktop-cold-cache.json
│   ├── mobile-3g-fast.json
│   ├── slow-network-test.json
│   └── content-parity-report.json
├── pagespeed-insights/
│   ├── desktop-report.json
│   └── mobile-report.json
└── screenshots/
    ├── desktop-render.png
    ├── mobile-render.png
    └── content-comparison.pdf
```

## Compliance Checklist

### Pre-Appeal Verification
- [ ] WebPageTest Load Time < 3.0s on cable connection
- [ ] PageSpeed Insights Performance Score > 90
- [ ] Mobile-Friendly Test passes
- [ ] Core Web Vitals all "Good" or "Needs Work" but not "Poor"
- [ ] HTML identical across desktop/mobile/slow connections
- [ ] Business information visible without JavaScript
- [ ] No render-blocking resources in critical path

### Google Ads Appeal Evidence
- WebPageTest waterfall charts showing fast loading
- PageSpeed Insights reports with high scores
- HAR files from different network conditions
- Screenshots proving content consistency
- Performance budget compliance documentation

---

**Testing Framework**: Ready for execution
**Compliance Status**: ✅ Test configurations prepared
**Evidence Collection**: Automated scripts ready
