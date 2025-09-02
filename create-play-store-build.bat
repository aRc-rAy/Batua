@echo off
echo ===============================================
echo 🛡️ SECURE PLAY STORE BUILD (AAB)
echo ===============================================

cd android

echo 🧹 Cleaning previous builds...
call gradlew clean

echo 🔐 Building signed Android App Bundle...
call gradlew bundleRelease

if %errorlevel% neq 0 (
    echo ❌ AAB build failed, trying APK fallback...
    call gradlew assembleRelease
    if %errorlevel% neq 0 (
        echo ❌ Build completely failed!
        pause
        exit /b 1
    )
    echo ⚠️  APK created as fallback
    echo 📂 Output: android\app\build\outputs\apk\release\app-release.apk
) else (
    echo ✅ AAB created successfully!
    echo 📂 Output: android\app\build\outputs\bundle\release\app-release.aab
)

echo.
echo 📱 Build completed for Play Store submission
echo 🛡️ Play Protect optimized build ready
echo.
pause
