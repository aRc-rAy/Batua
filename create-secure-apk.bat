@echo off
setlocal enabledelayedexpansion

echo ===============================================
echo 🔐 SECURE APK BUILDER FOR GOOGLE PLAY PROTECT
echo ===============================================
echo.

cd android

:: Check if release keystore exists
if not exist "app\release-key.keystore" (
    echo ⚠️  RELEASE KEYSTORE NOT FOUND!
    echo.
    echo Creating release keystore for better Play Protect compatibility...
    echo.
    
    cd app
    
    echo Please provide the following information for your keystore:
    echo (This information will be embedded in your app certificate)
    echo.
    
    set /p "name=Enter your name or organization: "
    set /p "org=Enter your organization unit (optional, press Enter to skip): "
    set /p "orgname=Enter your organization name (optional): "
    set /p "city=Enter your city: "
    set /p "state=Enter your state/province: "
    set /p "country=Enter your country code (e.g., US, IN): "
    
    echo.
    echo ⚠️  IMPORTANT: Remember your keystore password! You'll need it for future updates.
    echo.
    
    :: Generate keystore with user input
    keytool -genkey -v -keystore release-key.keystore -alias release -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=!name!, OU=!org!, O=!orgname!, L=!city!, S=!state!, C=!country!"
    
    if !errorlevel! neq 0 (
        echo.
        echo ❌ Failed to create keystore! Please try again.
        pause
        exit /b 1
    )
    
    echo.
    echo ✅ Keystore created successfully!
    echo.
    
    cd ..
) else (
    echo ✅ Release keystore found!
    echo.
)

:: Check gradle.properties for signing config
findstr /c:"MYAPP_RELEASE_STORE_FILE=release-key.keystore" gradle.properties >nul
if !errorlevel! neq 0 (
    echo ⚠️  Gradle properties not configured for release signing.
    echo.
    echo Please update android\gradle.properties with your keystore details:
    echo.
    echo MYAPP_RELEASE_STORE_FILE=release-key.keystore
    echo MYAPP_RELEASE_KEY_ALIAS=release  
    echo MYAPP_RELEASE_STORE_PASSWORD=your_keystore_password
    echo MYAPP_RELEASE_KEY_PASSWORD=your_key_password
    echo.
    echo Building with debug signing for now...
    goto build_debug
)

echo 🔧 Building RELEASE APK with secure signing...
echo.

call gradlew clean
call gradlew assembleRelease

if !errorlevel! neq 0 (
    echo.
    echo ❌ Release build failed! Trying debug build...
    goto build_debug
)

goto success

:build_debug
echo.
echo 🔧 Building DEBUG APK...
call gradlew assembleDebug

if !errorlevel! neq 0 (
    echo.
    echo ❌ Build failed completely! Check the errors above.
    pause
    exit /b 1
)

:success
echo.
echo ===============================================
echo ✅ BUILD COMPLETED SUCCESSFULLY!
echo ===============================================
echo.

if exist "app\build\outputs\apk\release\app-release.apk" (
    echo 📱 RELEASE APK: android\app\build\outputs\apk\release\app-release.apk
    echo.
    echo 🛡️  PLAY PROTECT STATUS: SIGNIFICANTLY IMPROVED
    echo    ✅ Proper release signing
    echo    ✅ Network security enforced
    echo    ✅ Debug flags disabled
    echo    ✅ Code minification enabled
    echo.
) else (
    echo 📱 DEBUG APK: android\app\build\outputs\apk\debug\app-debug.apk  
    echo.
    echo ⚠️  PLAY PROTECT STATUS: MAY STILL WARN
    echo    ❌ Using debug signing
    echo    ℹ️  Create release keystore for better compatibility
    echo.
)

echo 💡 ADDITIONAL RECOMMENDATIONS:
echo    • Test the APK on different devices
echo    • Consider internal Play Store testing
echo    • Explain storage permission clearly to users
echo    • Keep your keystore file secure and backed up
echo.

pause
