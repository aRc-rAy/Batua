@echo off
echo Building SpendBook APK for Play Protect compatibility testing...
echo.

cd android

echo Cleaning previous builds...
call gradlew clean

echo Building debug APK...
call gradlew assembleDebug

if %errorlevel% neq 0 (
    echo.
    echo ❌ Build failed! Check the errors above.
    pause
    exit /b 1
)

echo.
echo ✅ Build successful!
echo.
echo APK location: android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo You can now test the APK installation on your device.
echo If Google Play Protect still blocks it, try these additional steps:
echo.
echo 1. Go to Google Play Protect settings
echo 2. Temporarily disable "Scan apps with Play Protect"
echo 3. Install the APK
echo 4. Re-enable Play Protect after installation
echo.
echo Or submit the APK to Google for review at:
echo https://play.google.com/console/
echo.

pause
