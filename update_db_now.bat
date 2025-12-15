@echo off
set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impmbmp2cGh4aHp4b2p4Z3B0bXR1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjcyODIwOSwiZXhwIjoyMDUyMzA0MjA5fQ.gEv5x0uthgFUa6QqLMmACdZBjbe5wPuuQIToeghuU0U

echo 🔄 Updating database - removing Google translations...
echo.

node update_reviews_no_translations.cjs

echo.
echo ✅ Database updated! Google translations removed from all reviews.
pause
