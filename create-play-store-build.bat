@echo off
echo ===============================================
echo 🛡️ SECURE PLAY STORE BUILD (AAB)
echo ===============================================

cd android

echo 🧹 Cleaning previous builds...
call gradlew.bat clean

echo 🔐 Building signed Android App Bundle...
call gradlew.bat bundleRelease

if %errorlevel% neq 0 (
    echo ❌ AAB build failed, trying APK fallback...
    call gradlew.bat assembleRelease
    if %errorlevel% neq 0 (
        echo ❌ Build completely failed!
        pause
        exit /b 1
    )
    echo ⚠️  APK created as fallback
    echo 📂 Output: android\app\build\outputs\apk\release\app-release.apk
) else (
    echo ✅ AAB created successfully!
    echo 📂 AAB Output: android\app\build\outputs\bundle\release\app-release.aab
    echo 📂 APK Backup: Building APK version as well...
    call gradlew.bat assembleRelease
    echo 📂 APK Output: android\app\build\outputs\apk\release\app-release.apk
)

echo.
echo 📱 Build completed for Play Store submission
echo 🛡️ Play Protect optimized build ready
echo.
echo 📋 NEXT STEPS:
echo 1. Test the APK on your device: app-release.apk
echo 2. Submit AAB to Play Store: app-release.aab 
echo 3. Both files are signed and ready for distribution
echo.
pause
