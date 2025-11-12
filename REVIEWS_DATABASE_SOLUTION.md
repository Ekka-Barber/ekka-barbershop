# Reviews Database Solution

## ✅ What Was Implemented

### 1. Database Table: `google_reviews`
- Stores reviews in their **original language** (no translations)
- ⚠️ **Note**: Google Places API only provides the latest 5 reviews per place, so only those can be stored
- Detects language automatically (Arabic vs English)
- Links to branches and cached avatars
- Tracks sync timestamps

### 2. Edge Function: `sync-reviews`
- Fetches reviews from Google Places API (⚠️ **Note: Google Places Details API only returns the latest 5 reviews per place**)
- **No language parameter** = Gets reviews in their original language
- Detects language (Arabic/English) automatically
- Stores in database
- Updates existing reviews, adds new ones
- **Limitation**: Cannot fetch historical reviews beyond the latest 5 per place due to Google API constraints

### 3. Frontend Updates
- Fetches from **database** instead of API
- Filters by **detected language** (Arabic reviews for Arabic app, English for English)
- **Randomizes** reviews in frontend
- Uses cached avatars from database

## How Language Works

### Google Places API Language Parameter
- **WITH language parameter** (`language=ar` or `language=en`):
  - Affects place names, addresses, etc.
  - **Reviews are STILL in their original language** (Google doesn't translate reviews)
  
- **WITHOUT language parameter** (our implementation):
  - Gets ALL reviews in their **original language**
  - Arabic reviews stay Arabic
  - English reviews stay English

### Our Solution
1. **Fetch reviews** from Google Places API (latest 5 per place - API limitation)
2. **Detect language** automatically (checks for Arabic characters)
3. **Store in database** with language tag
4. **Filter in frontend** by detected language
5. **Randomize** for display

## How It Works

### Initial Sync (One-Time Setup)
```bash
# Call sync function to populate database
POST https://jfnjvphxhzxojxgptmtu.supabase.co/functions/v1/sync-reviews
```

### Periodic Updates
- Reviews are updated when sync function runs
- Can be scheduled via cron job or called manually
- Updates existing reviews, adds new ones

### Frontend Flow
1. User selects language (Arabic/English)
2. Frontend queries database: `WHERE language = 'ar'` or `WHERE language = 'en'`
3. Gets reviews in that language
4. Randomizes order
5. Displays reviews

## Benefits

✅ **No API Overload**: Fetch once, store in DB  
✅ **Original Reviews**: No translations, pure original text  
✅ **Fast Loading**: Database queries are fast  
✅ **Language Filtering**: Frontend filters by detected language  
✅ **Randomization**: Reviews randomized in frontend  
✅ **Always Updated**: Sync function keeps reviews fresh  

## Language Detection

Current implementation detects:
- **Arabic**: Contains Arabic characters (U+0600–U+06FF)
- **English**: Everything else (default)

This is basic but works for Arabic/English. Can be improved with better language detection library if needed.

## Scheduled Sync

To keep reviews updated, you can:

1. **Manual Sync**: Call the Edge Function when needed
2. **Cron Job**: Set up a scheduled task (e.g., daily)
3. **Supabase Cron**: Use Supabase's pg_cron extension

Example cron (daily at 2 AM):
```sql
SELECT cron.schedule(
  'sync-google-reviews',
  '0 2 * * *', -- Daily at 2 AM
  $$SELECT net.http_post(
    url := 'https://jfnjvphxhzxojxgptmtu.supabase.co/functions/v1/sync-reviews',
    headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
  )$$
);
```

## Testing

1. **Sync Reviews**:
   ```bash
   POST /functions/v1/sync-reviews
   ```
   Should sync all reviews from Google

2. **Check Database**:
   ```sql
   SELECT language, COUNT(*) 
   FROM google_reviews 
   GROUP BY language;
   ```
   Should show Arabic and English reviews

3. **Test Frontend**:
   - Switch to Arabic → Should see Arabic reviews only
   - Switch to English → Should see English reviews only
   - Reviews should be randomized

## Summary

**Question**: Do I get original reviews (not translated)?
**Answer**: ✅ **YES** - Reviews are stored in their original language

**Question**: Arabic app shows Arabic reviews, English shows English?
**Answer**: ✅ **YES** - Filtered by detected language in frontend

**Question**: No API overload?
**Answer**: ✅ **YES** - Fetch once, store in DB, update periodically

**Question**: Randomized in frontend?
**Answer**: ✅ **YES** - Reviews are randomized before display

