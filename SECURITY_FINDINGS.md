# Security Audit Findings - Ekka Barbershop Application

**Audit Date:** February 12, 2026  
**Auditor:** Security Expert Analysis  
**Project ID:** jfnjvphxhzxojxgptmtu  
**Organization:** Ekka Barbershop (koqnyhlxvfsshhxdkhik)

## Executive Summary

A comprehensive security audit of the Ekka Barbershop application and Supabase database revealed **multiple critical vulnerabilities** that make the application susceptible to attacks. The most severe issues involve **exposed Google API keys**, **hardcoded backdoor credentials**, and **insufficient access controls**. Immediate remediation is required before production deployment.

## Risk Assessment Summary

| Risk Level | Count | Description |
|------------|-------|-------------|
| 🔴 **Critical** | 4 | Direct paths to data breach, financial loss, or system compromise |
| 🟠 **High** | 3 | Serious vulnerabilities requiring urgent attention |
| 🟡 **Medium** | 4 | Important security improvements needed |
| 🟢 **Low** | 2 | Minor issues or best practice recommendations |

## 🔴 Critical Vulnerabilities

### 1. Google Places API Keys Publicly Exposed
**Location:** `public.branches` table, RLS policy `public_branches_read`  
**Impact:** Financial loss, service disruption, potential Google account compromise  
**Root Cause:** RLS policy allows anonymous SELECT access to branches table  
**Evidence:**
- Both branches (`Al-Waslyia`, `Ash-Sharai`) store `google_places_api_key` in plaintext
- Policy `public_branches_read` has `qual: true` allowing public read access
- SQL confirmation: `SELECT id, name, google_places_api_key IS NOT NULL as has_api_key FROM public.branches;`

**Exploit Path:**
1. Extract Supabase anon key from client-side code
2. Query `branches` table via REST API
3. Use stolen API keys for unauthorized Google API calls
4. Potential quota exhaustion and billing impact

### 2. Hardcoded Super Manager Backdoor
**Location:** `public.detect_access_role()` function in migration `20260208_hr_security_hardening.sql:159`  
**Impact:** Unauthorized privilege escalation to super_manager role  
**Root Cause:** Conditional check for hardcoded credential `'ma225'`

**Vulnerable Code:**
```sql
if public.verify_manager_access(normalized) then
  if normalized = 'ma225' then       -- HARDCODED BACKDOOR
    return 'super_manager';
  end if;
  return 'manager';
end if;
```

**Exploit:** Any user submitting `x-ekka-access-code: ma225` header gains full administrative access.

### 3. Plaintext Access Codes in Database
**Location:** `public.branch_managers` table  
**Impact:** Weak authentication, potential credential theft  
**Root Cause:** `verify_manager_access()` function checks plaintext column only

**Evidence:**
- All 3 branch managers have both `access_code` (plaintext) and `access_code_hash` populated
- Verification logic ignores hashes: `where access_code = normalized`
- Query: `SELECT id, access_code IS NULL as code_null, access_code_hash IS NOT NULL as hash_not_null FROM public.branch_managers;`

### 4. Security Definer View Bypasses RLS
**Location:** `public.qr_scan_counts_daily` view  
**Impact:** Potential RLS policy circumvention  
**Root Cause:** View defined with `SECURITY DEFINER` property

**Supabase Advisor Finding:**
```
ERROR: Security Definer View
View `public.qr_scan_counts_daily` is defined with the SECURITY DEFINER property.
These views enforce Postgres permissions and row level security policies (RLS) 
of the view creator, rather than that of the querying user.
```

## 🟠 High Severity Vulnerabilities

### 5. Weak Manager Authentication Verification
**Location:** `public.verify_manager_access()` function  
**Impact:** Insecure authentication allowing potential brute-force attacks  
**Root Cause:** Function only checks plaintext codes, ignoring hash verification

**Current Implementation:**
```sql
return exists (
  select 1
  from public.branch_managers
  where access_code = normalized  -- PLAINTEXT CHECK ONLY
);
```

**Missing:** No verification against `access_code_hash` column.

### 6. Custom Header-Based Authentication Vulnerabilities
**Location:** `public.request_access_code()` function  
**Impact:** Header manipulation, session hijacking  
**Root Cause:** Reliance on client-controlled headers without server-side validation

**Implementation Details:**
- Headers read from `current_setting('request.headers', true)`
- Client-side code in `packages/shared/src/lib/supabase/client.ts` injects headers
- No session tokens, JWT validation, or CSRF protection

### 7. Leaked Password Protection Disabled
**Location:** Supabase Auth settings  
**Impact:** Users can set compromised passwords  
**Advisory:** "Leaked password protection is currently disabled. Supabase Auth prevents the use of compromised passwords by checking against HaveIBeenPwned.org."

## 🟡 Medium Severity Vulnerabilities

### 8. Overly Permissive RLS Policies
**Location:** Multiple tables with `public_read` policies  
**Impact:** Unnecessary data exposure

**Affected Tables:**
- `branches` - `public_branches_read` with `qual: true`
- `google_reviews` - `google_reviews_public_read` with `qual: true`
- `marketing_files` - `marketing_files_public_read` with `qual: true`
- `ui_elements` - `ui_elements_public_read` with `qual: true`
- `document_types` - `document_types_public_read` with `qual: true`

**Risk:** Sensitive business information potentially exposed to anonymous users.

### 9. Hardcoded Fallback Credentials
**Location:** `packages/shared/src/lib/supabase/client.ts`  
**Impact:** Compilation of production credentials into frontend bundle

**Code Snippet:**
```typescript
const FALLBACK_SUPABASE_URL = 'https://jfnjvphxhzxojxgptmtu.supabase.co';
const FALLBACK_ANON_KEY = 'eyJhbGciOiJIUzI1NiIs...';
```

**Note:** While anon keys are public by design, hardcoding them violates security best practices.

### 10. Unused Indexes Performance Impact
**Location:** Multiple unused database indexes  
**Impact:** Database performance degradation, maintenance overhead

**Examples from Supabase Performance Advisor:**
- `idx_branch_managers_branch_id` on `public.branch_managers`
- `idx_employee_bonuses_employee_id` on `public.employee_bonuses`
- `idx_employee_documents_employee_id` on `public.employee_documents`
- 20+ additional unused indexes

### 11. Session Storage Vulnerabilities
**Location:** `packages/shared/src/lib/access-code/storage.ts`  
**Impact:** XSS attacks could steal access codes

**Implementation:**
- Access codes stored in `window.sessionStorage`
- No encryption or additional protection
- Vulnerable to XSS attacks

## 🟢 Low Severity Findings

### 12. No SQL Injection Vulnerabilities Found
**Status:** ✅ Clean  
**Finding:** No dynamic SQL construction found in application code. All database interactions use Supabase client with parameterized queries.

### 13. No XSS Vulnerabilities in Frontend
**Status:** ✅ Clean  
**Finding:** No usage of `dangerouslySetInnerHTML`, `innerHTML`, or `eval()` found in `.tsx` files.

### 14. Dependency Security
**Status:** ✅ Clean  
**Finding:** `npm audit` shows no known vulnerabilities in dependencies.

## Attack Scenarios

### Scenario 1: API Key Theft & Financial Impact
**Difficulty:** Trivial  
**Steps:**
1. Extract Supabase anon key from frontend JavaScript
2. Query: `GET /rest/v1/branches?select=google_places_api_key`
3. Use stolen API keys for unauthorized Google Maps/Places API calls
4. Result: Exhausted quotas, unexpected billing charges

### Scenario 2: Privilege Escalation via Backdoor
**Difficulty:** Easy  
**Steps:**
1. Discover hardcoded credential `ma225` (could be found via code inspection)
2. Set HTTP header: `x-ekka-access-code: ma225`
3. Gain `super_manager` privileges
4. Full access to all business data: employees, salaries, documents

### Scenario 3: Brute-Force Access Code Attack
**Difficulty:** Moderate  
**Steps:**
1. Write script enumerating common access codes
2. Direct Supabase API calls with different headers
3. No rate limiting makes attack feasible
4. Compromise manager accounts for data access

## Technical Details

### Database Schema Vulnerabilities
```sql
-- Exposed API keys
SELECT table_name, column_name 
FROM information_schema.columns 
WHERE column_name LIKE '%api_key%' 
AND table_schema = 'public';
-- Result: branches.google_places_api_key

-- RLS Policy Analysis
SELECT schemaname, tablename, policyname, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
AND qual = 'true';
-- Shows multiple tables with unrestricted public read access
```

### Authentication Flow Analysis
```
Client → Sets x-ekka-access-code header → Supabase Middleware
       ↓
request_access_code() → Reads current_setting('request.headers')
       ↓
normalize_access_code() → Lowercase and trim
       ↓
detect_access_role() → Checks tables for matching code
       ↓
can_access_business_data() → Returns true if role in allowed list
```

**All functions use `SECURITY DEFINER` with `SET search_path TO 'public'`.**

## Remediation Plan

### Immediate Actions (24-48 Hours)

#### 1. Remove Google API Keys from Database
```sql
-- Step 1: Restrict RLS on branches table
DROP POLICY public_branches_read ON branches;
CREATE POLICY secure_branches_read ON branches 
FOR SELECT USING (can_access_business_data());

-- Step 2: Move API keys to environment variables
-- Step 3: Implement server-side proxy for Google API calls
```

#### 2. Eliminate Hardcoded Backdoor
```sql
-- Update detect_access_role() function
CREATE OR REPLACE FUNCTION public.detect_access_role(code text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  normalized text := public.normalize_access_code(code);
  mgr_record record;
BEGIN
  -- ... existing checks ...
  
  -- Check branch managers (updated to use hash)
  SELECT is_super_manager INTO mgr_record
  FROM public.branch_managers
  WHERE access_code_hash IS NOT NULL 
    AND extensions.crypt(normalized, access_code_hash) = access_code_hash;

  IF found THEN
    IF mgr_record.is_super_manager THEN
      RETURN 'super_manager';
    ELSE
      RETURN 'manager';
    END IF;
  END IF;
  
  -- ... rest of function ...
END;
$$;
```

#### 3. Hash All Access Codes
```sql
-- Migrate plaintext codes to hashes only
UPDATE branch_managers SET access_code = NULL WHERE access_code_hash IS NOT NULL;
ALTER TABLE branch_managers ALTER COLUMN access_code DROP NOT NULL;

-- Update verify_manager_access to use hashes
CREATE OR REPLACE FUNCTION public.verify_manager_access(code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  normalized text := public.normalize_access_code(code);
BEGIN
  IF normalized = '' THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.branch_managers
    WHERE access_code_hash IS NOT NULL
      AND extensions.crypt(normalized, access_code_hash) = access_code_hash
  );
END;
$$;
```

### Short-term Actions (1 Week)

#### 4. Fix Security Definer View
```sql
ALTER VIEW qr_scan_counts_daily SET (security_invoker = true);
```

#### 5. Enable Leaked Password Protection
- Navigate to Supabase Dashboard → Authentication → Settings
- Enable "Leaked Password Protection"

#### 6. Implement Rate Limiting
```sql
-- Create rate limiting table
CREATE TABLE IF NOT EXISTS auth_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address inet NOT NULL,
  attempt_count integer DEFAULT 1,
  last_attempt timestamptz DEFAULT now(),
  blocked_until timestamptz
);

-- Create function to check/update attempts
CREATE OR REPLACE FUNCTION check_auth_rate_limit(ip inet)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Clean old attempts
  DELETE FROM auth_attempts 
  WHERE last_attempt < now() - interval '1 hour';
  
  -- Check if blocked
  IF EXISTS (
    SELECT 1 FROM auth_attempts 
    WHERE ip_address = ip 
    AND blocked_until > now()
  ) THEN
    RETURN false;
  END IF;
  
  -- Update or insert attempt
  INSERT INTO auth_attempts (ip_address)
  VALUES (ip)
  ON CONFLICT (ip_address) 
  DO UPDATE SET 
    attempt_count = auth_attempts.attempt_count + 1,
    last_attempt = now(),
    blocked_until = CASE 
      WHEN auth_attempts.attempt_count >= 5 
      THEN now() + interval '15 minutes'
      ELSE null
    END;
  
  RETURN true;
END;
$$;
```

### Long-term Improvements (1 Month)

#### 7. Migrate to Supabase Authentication
- Replace custom access code system with Supabase Auth
- Implement proper JWT-based authentication
- Use built-in session management

#### 8. Security Headers Implementation
- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Frame-Options, X-Content-Type-Options

#### 9. Regular Security Scans
- Monthly dependency audits
- Weekly Supabase advisor checks
- Quarterly penetration testing

## Files Requiring Changes

### Database Migrations Needed
1. New migration to fix `detect_access_role()` function
2. Migration to update `verify_manager_access()` function
3. Migration to restrict RLS policies on sensitive tables
4. Migration to clean unused indexes

### Frontend Changes
1. `packages/shared/src/lib/supabase/client.ts` - Remove hardcoded fallbacks
2. `packages/shared/src/lib/access-code/auth.ts` - Update to use proper Supabase Auth
3. Environment configuration updates

## Monitoring & Detection

### Recommended Alerts
1. **Failed Authentication Attempts:** Alert on >10 failures/hour from single IP
2. **Unusual Data Access:** Alert on access patterns outside business hours
3. **API Key Usage:** Monitor Google API key usage for anomalies
4. **Privilege Escalation:** Log and alert on role changes

### Audit Logging
```sql
CREATE TABLE security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_time timestamptz DEFAULT now(),
  user_ip inet,
  action_type text,
  resource_type text,
  resource_id uuid,
  details jsonb
);

-- Add triggers to log sensitive operations
```

## Conclusion

The Ekka Barbershop application exhibits **multiple critical security flaws** requiring immediate attention. The most urgent issues are the **exposed Google API keys** and **hardcoded backdoor credential**, which present direct paths to financial loss and data breaches.

The custom authentication system introduces unnecessary complexity and risk. While it functions, it lacks the robustness of established authentication frameworks. A migration to Supabase Auth is strongly recommended for production use.

**Next Steps:**
1. Implement all Critical remediation items within 24-48 hours
2. Deploy High priority fixes within 1 week
3. Schedule migration to Supabase Auth within 1 month
4. Establish ongoing security monitoring and review processes

**Final Risk Assessment:** The application is currently **NOT production-ready** from a security perspective and should not be exposed to untrusted users until critical vulnerabilities are resolved.

---
*This security audit was conducted using automated tools, manual code review, and security testing methodologies. Findings are based on the codebase state as of February 12, 2026.*