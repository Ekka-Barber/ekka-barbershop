# Avatar Cache Setup Guide

## Overview
This solution caches Google review profile avatars in Supabase Storage to avoid rate limiting (429 errors) from Google's CDN.

## What Was Implemented

### 1. Database Table
- **Table**: `review_avatar_cache`
- **Purpose**: Maps Google avatar URLs to cached Supabase Storage URLs
- **Fields**:
  - `google_avatar_url`: Original Google URL (unique)
  - `cached_avatar_url`: Supabase Storage URL
  - `author_name`: Reviewer name (optional)
  - `last_accessed_at`: Last time avatar was used
  - `access_count`: How many times avatar was accessed

### 2. Storage Bucket
✅ **COMPLETED**: The `review_avatars` bucket has been created automatically via Edge Function

The bucket is:
- ✅ Public (accessible without authentication)
- ✅ Configured for image files (JPEG, PNG, WebP, GIF)
- ✅ 5MB file size limit

**Note**: If you need to recreate it, you can call the Edge Function:
```bash
POST https://jfnjvphxhzxojxgptmtu.supabase.co/functions/v1/create-avatar-bucket
```

### 3. Code Components

#### Services:
- `src/services/avatarCacheService.ts` - Handles downloading and caching avatars

#### Hooks:
- `src/hooks/useCachedAvatar.ts` - React hook for avatar caching

#### Components:
- `src/components/ui/cached-avatar.tsx` - Drop-in replacement for Avatar component
- Updated components:
  - `ReviewCarousel.tsx`
  - `ReviewModal.tsx`
  - `ReviewsShowcase.tsx`

## How It Works

1. **First Request**: When a review avatar is displayed:
   - Checks database cache
   - If not cached, downloads from Google
   - Uploads to Supabase Storage
   - Saves mapping in database
   - Returns cached URL

2. **Subsequent Requests**: 
   - Finds cached URL in database
   - Updates access stats
   - Returns cached URL (no Google request)

3. **Rate Limiting**: 
   - If Google returns 429, gracefully falls back to avatar fallback
   - No errors shown to user

## Benefits

✅ **No More 429 Errors**: Avatars cached locally  
✅ **Faster Loading**: Cached images load from Supabase CDN  
✅ **Reduced Google Requests**: Only fetch once per avatar  
✅ **Automatic Cleanup**: Old unused avatars can be cleaned up  

## Cleanup (Optional)

To clean up old unused avatars (30+ days old), call:
```typescript
import { cleanupOldAvatars } from '@/services/avatarCacheService';
await cleanupOldAvatars();
```

You can run this periodically via a cron job or Edge Function.

## Testing

1. Create the storage bucket (see above)
2. Load a page with reviews
3. Check browser network tab - should see requests to Supabase Storage instead of Google
4. Refresh page - avatars should load instantly from cache

## Troubleshooting

**Issue**: Avatars not caching
- **Check**: Storage bucket `review_avatars` exists and is public
- **Check**: Database table `review_avatar_cache` exists
- **Check**: Browser console for errors

**Issue**: Still getting 429 errors
- **Check**: First-time cache is working (check database)
- **Check**: Cached URLs are being used (check network tab)

