# Reviews Database Setup - Complete Guide

## ✅ What's Been Done

### 1. Database Table Created
- `google_reviews` table stores reviews
- ⚠️ **Note**: Google Places API only provides the latest 5 reviews per place
- Language detection (Arabic/English)
- Links to branches and cached avatars

### 2. Edge Function Created
- `sync-reviews` - Fetches and stores reviews from Google
- ⚠️ **Limitation**: Only fetches latest 5 reviews per place (Google API constraint)
- **No language parameter** = Gets original reviews
- Automatic language detection
- Updates existing, adds new reviews

### 3. Frontend Updated
- Fetches from database (not API)
- Filters by language (Arabic/English)
- Randomizes reviews
- Uses cached avatars

## 🚀 Quick Start

### Step 1: Sync Reviews (One-Time)
Call the sync function to populate database:

```bash
POST https://jfnjvphxhzxojxgptmtu.supabase.co/functions/v1/sync-reviews
```

Or use PowerShell:
```powershell
$headers = @{ 
  "Authorization" = "Bearer YOUR_ANON_KEY"; 
  "Content-Type" = "application/json" 
}; 
Invoke-RestMethod -Uri "https://jfnjvphxhzxojxgptmtu.supabase.co/functions/v1/sync-reviews" -Method Post -Headers $headers
```

### Step 2: Verify
Check database:
```sql
SELECT language, COUNT(*) 
FROM google_reviews 
GROUP BY language;
```

### Step 3: Test Frontend
- Load page with reviews
- Switch language → Should see different reviews
- Reviews should be randomized

## 📋 How It Works

### Language Detection
- **Arabic**: Contains Arabic characters (U+0600–U+06FF)
- **English**: Everything else

### Review Flow
1. **Sync Function** → Fetches reviews from Google (latest 5 per place - API limitation)
2. **Language Detection** → Detects Arabic vs English
3. **Database Storage** → Stores with language tag
4. **Frontend Query** → Filters by language (`WHERE language = 'ar'` or `'en'`)
5. **Randomization** → Shuffles reviews before display

### No More API Calls
- ✅ Reviews stored in database
- ✅ Frontend queries database (fast)
- ✅ Sync function updates periodically
- ✅ No overload on Google API

## 🔄 Keeping Reviews Updated

### Option 1: Manual Sync
⚠️ **SECURITY WARNING**: `syncReviewsFromGoogle()` should NOT be called from public frontend code.
It should only be used server-side or behind admin authentication.

For server-side usage:
```typescript
import { syncReviewsFromGoogle } from '@/services/reviewsService';
await syncReviewsFromGoogle();
```

Or call the edge function directly with proper authentication:
```bash
POST /functions/v1/sync-reviews
Authorization: Bearer YOUR_SERVICE_ROLE_KEY
```

### Option 2: Scheduled Sync (Recommended)
Set up a cron job to sync daily:

**Using Supabase Dashboard**:
1. Go to Database → Extensions
2. Enable `pg_cron` extension
3. Create scheduled job:

```sql
SELECT cron.schedule(
  'sync-google-reviews-daily',
  '0 2 * * *', -- Daily at 2 AM UTC
  $$
  SELECT net.http_post(
    url := 'https://jfnjvphxhzxojxgptmtu.supabase.co/functions/v1/sync-reviews',
    headers := jsonb_build_object(
      'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY',
      'Content-Type', 'application/json'
    )
  )::text;
  $$
);
```

### Option 3: Admin Button
Add a button in admin panel to trigger sync manually.

## 📊 Database Schema

```sql
google_reviews
├── id (uuid)
├── google_place_id (text)
├── branch_id (uuid → branches.id)
├── author_name (text)
├── rating (integer 1-5)
├── text (text) - Original review text
├── original_text (text) - Same as text (for consistency)
├── language (text) - 'ar' or 'en' (detected)
├── profile_photo_url (text)
├── cached_avatar_url (text) - Link to cached avatar
├── relative_time_description (text)
├── google_review_time (bigint) - Original timestamp
├── is_active (boolean)
├── created_at (timestamptz)
├── updated_at (timestamptz)
└── last_synced_at (timestamptz)
```

## 🎯 Key Features

### Original Reviews (No Translation)
- ✅ Reviews stored in **original language**
- ✅ Arabic reviews stay Arabic
- ✅ English reviews stay English
- ✅ No Google translation

### Language Filtering
- ✅ Arabic app → Shows Arabic reviews only
- ✅ English app → Shows English reviews only
- ✅ Filtered in database query

### Randomization
- ✅ Reviews randomized in frontend
- ✅ Different order each time
- ✅ Works for both languages

### Performance
- ✅ No API calls on every page load
- ✅ Fast database queries
- ✅ Cached avatars
- ✅ Efficient filtering

## 🔍 Troubleshooting

### No Reviews Showing
1. Check if sync function ran: `SELECT COUNT(*) FROM google_reviews;`
2. Check language distribution: `SELECT language, COUNT(*) FROM google_reviews GROUP BY language;`
3. Verify branches have `google_place_id`: `SELECT id, name, google_place_id FROM branches;`

### Wrong Language Reviews
- Check language detection: `SELECT text, language FROM google_reviews LIMIT 10;`
- Language detection is basic (Arabic characters = 'ar')
- Can be improved with better detection library

### Reviews Not Updating
- Call sync function manually
- Check `last_synced_at` column
- Verify Edge Function is working

## 📝 Summary

**Your Questions Answered**:

1. **Original reviews?** ✅ YES - Stored in original language, no translation
2. **Arabic app = Arabic reviews?** ✅ YES - Filtered by detected language
3. **English app = English reviews?** ✅ YES - Filtered by detected language
4. **No API overload?** ✅ YES - Fetch once, store in DB, update periodically
5. **Randomized?** ✅ YES - Randomized in frontend for both languages
6. **All reviews stored?** ⚠️ NO - Google Places API only provides latest 5 reviews per place

**Architecture**:
- Reviews → Database (not API)
- Sync → Periodic (not every request)
- Language → Detected automatically
- Display → Filtered & Randomized in frontend

