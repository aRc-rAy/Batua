@echo off
echo Building SpendBook Release APK with proper signing...
echo.

echo Step 1: Navigate to Android directory
cd android

echo Step 2: Clean previous builds...
call gradlew clean

echo Step 3: Check if release keystore exists...
if not exist "app\release-key.keystore" (
    echo.
    echo ⚠️  RELEASE KEYSTORE NOT FOUND!
    echo Please create a release keystore first:
    echo.
    echo cd app
    echo keytool -genkey -v -keystore release-key.keystore -alias release -keyalg RSA -keysize 2048 -validity 10000
    echo.
    echo Then update gradle.properties with your keystore details.
    echo.
    echo Building with debug signing for now...
    echo.
    goto build_debug
)

echo Step 4: Building RELEASE APK with proper signing...
call gradlew assembleRelease
goto check_result

:build_debug
echo Building DEBUG APK...
call gradlew assembleDebug

:check_result
if %errorlevel% neq 0 (
    echo.
    echo ❌ Build failed! Check the errors above.
    pause
    exit /b 1
)

echo.
echo ✅ Build successful!
echo.

if exist "app\build\outputs\apk\release\app-release.apk" (
    echo 📱 Release APK location: android\app\build\outputs\apk\release\app-release.apk
    echo.
    echo 🛡️  This APK should have better Play Protect compatibility
) else (
    echo 📱 Debug APK location: android\app\build\outputs\apk\debug\app-debug.apk
    echo.
    echo ⚠️  This is a debug APK - may still trigger Play Protect warnings
)

echo.
echo 💡 Tips to avoid Play Protect issues:
echo    1. Use release builds with your own keystore
echo    2. Explain SMS permission usage clearly to users
echo    3. Consider uploading to Play Console for validation
echo.
pause
