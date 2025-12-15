@echo off
set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impmbmp2cGh4aHp4b2p4Z3B0bXR1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjcyODIwOSwiZXhwIjoyMDUyMzA0MjA5fQ.gEv5x0uthgFUa6QqLMmACdZBjbe5wPuuQIToeghuU0U

echo 🚀 Starting Ekka Barbershop Reviews Migration...
echo SUPABASE_URL: https://jfnjvphxhzxojxgptmtu.supabase.co
echo.

node final_migration.cjs

echo.
echo ✅ Migration completed!
echo English reviews should now appear in your app when switching languages!
pause
