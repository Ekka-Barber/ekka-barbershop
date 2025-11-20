# **GOOGLE ADS REINSTATEMENT & POLICY COMPLIANCE IMPLEMENTATION PLAN**

## **Immediate Policy Context**

- Google suspended account `971-447-4158` for Circumventing Systems (Cloaking). Any mismatch between what Ads reviewers see and what real users see (content swaps, hidden redirects, blocked assets, intrusive interstitials) is now treated as a critical violation.
- The landing experience must be identical for Googlebot, AdsBot, and every user: same product, copy, pricing, CTAs, and destination URL over clean HTTPS. Only minor localization (language, currency) is acceptable.
- Google expects a single, documented remediation story in the appeal: show fixes, prove that cloaking is impossible now, demonstrate content parity, and provide evidence artifacts.

## **Design & Experience Guardrails**

- Preserve existing branding, layout, and booking UX. All work below is backend, metadata, or compliance hardening.
- No new intrusive popups or surprise redirects. Accessibility, trust, and content parity outrank visual tweaks.
- Keep the booking flow intact; only add transparency, disclosures, and instrumentation behind the scenes.

---

## **PHASE 1: Anti-Cloaking & Transparency Hardening**
*Duration: 2 days | Priority: Emergency | Dependencies: None*

### **Task 1.1: Landing Flow & Parity Audit**
- [ ] Crawl `https://<production-domain>` with both standard browsers and AdsBot UA (curl -A "AdsBot-Google", PageSpeed Insights) and capture full HTML/JS responses.
- [ ] Diff rendered DOM, network requests, and console output to confirm there is no UA/IP/GCLID based content branching.
- [ ] Verify Supabase edge functions, middleware, and CDN rules never swap URLs or payloads based on request metadata.

### **Task 1.2: Service Worker & Caching Review**
- [ ] Inspect `public/service-worker.js` and remove logic that bypasses caches or serves alternate fallbacks to bots.
- [ ] Ensure precached assets, offline pages, and fallbacks return the exact same booking content for bots and users.
- [ ] Version the worker, document cache policy, and archive HAR files to prove parity.

### **Task 1.3: Redirect, Tracker, and Third-Party Integrity**
- [ ] Map every redirect hop (http->https, www, vanity URLs). Remove chained or JS-only redirects that could look like cloaking.
- [ ] Audit click trackers, deferred deep links, and UTM handling to confirm they resolve to the same landing content advertised.
- [ ] Confirm no popup or interstitial hides primary content on first paint; Google treats that as cloaking.

### **Testing & Evidence**
- [ ] Save parity screenshots, HAR files, and curl outputs (Chrome vs AdsBot) into `/docs/google-ads-evidence/`.
- [ ] Maintain a remediation changelog describing removed rules, scripts, or redirects for the appeal narrative.

---

## **PHASE 2: Landing Page Trust & Message Alignment**
*Duration: 2 days | Priority: Critical | Dependencies: Phase 1*

### **Task 2.1: Ad-to-Landing Consistency**
- [ ] Inventory every active ad headline/description and map it to visible sections in `index.html`.
- [ ] Update either ad copy or landing text so each promise (services, pricing, availability, contact method) appears above the fold.
- [ ] Eliminate sensational claims or unverifiable guarantees that are not backed by the landing page.

### **Task 2.2: Transparency Enhancements**
- [ ] Keep business name, address, phone, and hours visible within existing layout blocks so bots and users read identical info.
- [ ] Publish refund, cancellation, booking, privacy, and data-use policies as static pages linked without modal gates.
- [ ] Clarify WhatsApp/phone CTAs (possible charges, availability) so expectations match ad messaging.

### **Task 2.3: No-JS & Low-Bandwidth Fallbacks**
- [ ] Expand `<noscript>` and other static content in `index.html` to include services summary, contact info, and booking instructions.
- [ ] Provide cached/static equivalents for Supabase-driven sections so bots never see empty shells.

### **Testing & Evidence**
- [ ] Capture screenshots with JS enabled/disabled to show identical offerings.
- [ ] Record HTTP 200 responses for policy/terms URLs when fetched with AdsBot UA.

---

## **PHASE 3: Structured Data, SEO, and Tracking Integrity**
*Duration: 2 days | Priority: High | Dependencies: Phase 2 business info*

### **Task 3.1: Schema & Metadata Consistency**
- [ ] Update JSON-LD in `index.html` with LocalBusiness, Organization, and ContactPoint schemas using the same values shown to users.
- [ ] Re-check `<title>`, meta description, and canonical tags to ensure they match ad destinations and avoid alternate variants.
- [ ] Add `<link rel="alternate">` only if genuine localization exists; otherwise enforce a single canonical URL.

### **Task 3.2: Robots, Sitemap, and Accessibility**
- [ ] Confirm `robots.txt` allows AdsBot/Googlebot access to JS, CSS, service worker, Supabase endpoints, and policy pages.
- [ ] Refresh `sitemap.xml` so it lists only active landing URLs referenced in ads.
- [ ] Improve semantic HTML/ARIA labeling so crawlers and screen readers access identical hierarchy and CTAs.

### **Task 3.3: Measurement Hygiene**
- [ ] Retain only required Google Ads/GA4 tags and ensure none of them rewrite URLs or block rendering.
- [ ] Standardize GCLID/UTM handling: log values server-side but never change content or routing based on them.
- [ ] Document the analytics stack to prove that tracking exists purely for measurement.

### **Testing & Evidence**
- [ ] Store Rich Results Test, Mobile-Friendly Test, and URL Inspection screenshots showing crawlable content.
- [ ] Archive rendered HTML snapshots used to validate schema.

---

## **PHASE 4: Security & Infrastructure Integrity**
*Duration: 3 days | Priority: High | Dependencies: Supabase admin access*

### **Task 4.1: Supabase RLS & Function Hardening**
- [ ] Enable or verify Row Level Security on every public table to prevent unexpected alternate views.
- [ ] Set explicit `search_path` on all functions and switch SECURITY DEFINER views to invoker or add security barriers.
- [ ] Run Supabase Security Advisor and resolve all critical findings.

### **Task 4.2: Extension & Network Controls**
- [ ] Isolate extensions (pg_net, etc.) into dedicated schemas and restrict execution roles.
- [ ] Lock down anonymous REST/RPC endpoints so bots cannot reach hidden content via alternate URLs.
- [ ] Rotate leaked or unused API keys and note the rotation schedule in ops docs.

### **Task 4.3: Domain & TLS Verification**
- [ ] Confirm the SSL certificate covers the exact ad destination, is valid, and auto-renews.
- [ ] Remove stale subdomains or alternate hostnames that might look like cloaking mirrors.
- [ ] Capture SSL Labs or Qualys reports for the appeal evidence bundle.

### **Testing & Evidence**
- [ ] Save Supabase Security Advisor before/after screenshots.
- [ ] Run automated parity tests (Chrome vs AdsBot headers) against booking APIs and archive the logs.

---

## **PHASE 5: Performance, Reliability & Accessibility**
*Duration: 2 days | Priority: Medium | Dependencies: Phase 3*

### **Task 5.1: Bundle & Asset Hygiene**
- [ ] Re-run bundle analysis and remove dead code that might create conditional routes on slow networks.
- [ ] Inline only critical CSS/JS that stays identical for bots and users; defer everything else.
- [ ] Optimize font loading (swap/fallback) so primary text renders immediately for all clients.

### **Task 5.2: Critical Rendering Path Stability**
- [ ] Ensure lazy-loaded sections never hide core service descriptions; preload hero copy and CTA assets.
- [ ] Provide deterministic skeleton states so AdsBot never captures empty placeholders.
- [ ] Align service worker prefetch lists with real user navigation to avoid parity gaps.

### **Task 5.3: Accessibility Pass**
- [ ] Run Lighthouse, axe, and manual audits to confirm headings, buttons, and CTAs are exposed identically to assistive tech.
- [ ] Add aria-labels or roles only where necessary without altering the layout.

### **Testing & Evidence**
- [ ] Store Lighthouse reports (Performance, SEO, Accessibility) in `/audits/google-ads/`.
- [ ] Capture WebPageTest or PageSpeed Insights runs showing consistent HTML across fetches.

---

## **PHASE 6: Validation, Documentation & Appeal Submission**
*Duration: 2 days | Priority: Critical | Dependencies: All previous phases*

### **Task 6.1: Policy Validation Suite**
- [ ] Run Google Ads landing page diagnostic, Mobile-Friendly Test, Rich Results Test, and SSL checks; record URLs and timestamps.
- [ ] Use Ads Transparency Center style checks (Chrome DevTools throttling + AdsBot UA) to capture parity logs.
- [ ] Test with JS disabled, multiple IP regions, and different browsers to prove there is no geo or UA cloaking.

### **Task 6.2: Evidence & Narrative Assembly**
- [ ] Create `docs/google-ads-reinstatement.md` summarizing each fix with before/after notes plus links to commits and screenshots.
- [ ] Bundle HAR files, schema validation, security scans, and SSL reports into a single ZIP archive.
- [ ] Draft an honest explanation covering suspected cause, remediation actions, monitoring, and commitments to policy compliance.

### **Task 6.3: Appeal Submission & Monitoring**
- [ ] Submit the appeal in Google Ads with concise summary plus evidence references. Stress that bots and users now get identical content.
- [ ] Set reminders for the five business day SLA and monitor the Policy Manager inbox.
- [ ] If denied, use the evidence package to escalate rather than opening new Google Ads accounts (explicitly forbidden).

### **Testing & Evidence**
- [ ] Maintain a signed checklist from engineering and marketing stakeholders.
- [ ] Store copies of appeal form responses and confirmation emails.

---

## **CRITICAL SUCCESS METRICS**

- Landing page diagnostic shows no violations and AdsBot captures full content identical to Chrome.
- Rich Results Test, Mobile-Friendly Test, and PSI SEO score >= 90; SSL/TLS scans are clean.
- Supabase Security Advisor reports zero critical findings; RLS is enforced everywhere.
- Structured data validates in Google tools; sitemap and robots are fetched successfully.
- A complete evidence bundle exists for audits and follow-up reviews.

---

## **RISK MITIGATION & ROLLBACK**

- **Service worker or routing changes**: keep the previous version and cache-bust plan in case parity issues appear.
- **Database and security updates**: take Supabase logical backups before altering policies; script rollback migrations.
- **Copy and policy updates**: stage behind feature flags, preview internally, and archive pre-change HTML for traceability.
- **Monitoring**: add alerts for spikes in HTTP 302/307 responses, blocked requests, or AdsBot vs Chrome diff failures.

---

## **TIMELINE SUMMARY**

| Phase | Duration | Dependencies | Goal |
|-------|----------|--------------|------|
| 1: Anti-Cloaking & Transparency | 2 days | None | Guarantee the same experience for bots and users |
| 2: Landing Page Trust Alignment | 2 days | Phase 1 | Keep ad promises and landing copy perfectly aligned |
| 3: Structured Data & Tracking Integrity | 2 days | Phase 2 | Provide crawlable, policy-compliant metadata |
| 4: Security & Infrastructure Integrity | 3 days | Supabase access | Remove backend vectors for cloaking or abuse |
| 5: Performance & Accessibility | 2 days | Phase 3 | Deliver stable, identical rendering on every client |
| 6: Validation & Appeal Submission | 2 days | All previous | Prove compliance and submit the reinstatement appeal |

**Total Estimated Duration: 13 days (can be compressed with parallel owners).**

---

## **FINAL NOTES**

- Do not open new Google Ads accounts while suspended; Google warned they will be auto-suspended.
- Keep every artifact (HAR files, screenshots, logs) for possible follow-up questions.
- Focus on transparency, matching ad messaging to landing content, and eliminating every code path that treats bots differently from humans. This plan keeps the UI untouched while making the experience entirely Google Ads friendly.
