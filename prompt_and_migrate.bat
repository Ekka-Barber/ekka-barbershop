@echo off
echo 🚀 Ekka Barbershop Reviews Migration
echo ====================================
echo.
echo Please enter your SUPABASE_SERVICE_ROLE_KEY:
echo (This is the service_role key from your Supabase project settings)
echo.
set /p SUPABASE_SERVICE_ROLE_KEY="Service Role Key: "
echo.
echo 🔄 Starting migration...
echo SUPABASE_URL: https://jfnjvphxhzxojxgptmtu.supabase.co
echo.

node final_migration.cjs

echo.
echo ✅ Migration completed!
echo Check your app - English reviews should now appear when switching languages!
pause
