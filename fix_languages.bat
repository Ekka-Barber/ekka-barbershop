@echo off
set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impmbmp2cGh4aHp4b2p4Z3B0bXR1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjcyODIwOSwiZXhwIjoyMDUyMzA0MjA5fQ.gEv5x0uthgFUa6QqLMmACdZBjbe5wPuuQIToeghuU0U

echo 🔧 Fixing language detection for all reviews...
echo.

node update_languages.cjs

echo.
echo ✅ Language detection fixed! English reviews should now show in English mode.
pause
