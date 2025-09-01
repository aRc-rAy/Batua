@echo off
echo ============================================
echo   SpendBook - Play Store Build Script
echo ============================================
echo.

echo Building release APK for Play Store submission...
echo.

cd /d "%~dp0"

echo Cleaning previous builds...
call npx react-native run-android --variant=release --no-packager
if %errorlevel% neq 0 (
    echo Error during build process
    pause
    exit /b 1
)

echo.
echo Build completed successfully!
echo.
echo APK location: android\app\build\outputs\apk\release\app-release.apk
echo.
echo Before uploading to Play Store:
echo 1. Test the APK thoroughly
echo 2. Fill out the Data Safety form
echo 3. Upload privacy policy to a public URL
echo 4. Submit for review
echo.
echo Press any key to continue...
pause > nul
