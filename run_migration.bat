@echo off
REM Set your Supabase credentials here
set SUPABASE_URL=https://jfnjvphxhzxojxgptmtu.supabase.co
set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

echo 🚀 Starting reviews migration...
echo SUPABASE_URL: %SUPABASE_URL%
echo.

node migrate_reviews_with_proper_language.cjs

echo.
echo ✅ Migration completed!
pause
