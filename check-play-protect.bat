@echo off
echo ===============================================
echo 🔍 GOOGLE PLAY PROTECT COMPATIBILITY CHECKER
echo ===============================================
echo.

set "issues=0"
set "warnings=0"

echo Checking configuration for Play Protect compatibility...
echo.

:: Check 1: Release keystore
if exist "android\app\release-key.keystore" (
    echo ✅ Release keystore found
) else (
    echo ❌ Release keystore missing
    set /a issues+=1
    echo    Solution: Run create-secure-apk.bat to generate keystore
)

:: Check 2: Gradle properties for signing
findstr /c:"MYAPP_RELEASE_STORE_FILE=release-key.keystore" android\gradle.properties >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Release signing configured in gradle.properties
) else (
    echo ❌ Release signing not configured
    set /a issues+=1
    echo    Solution: Update android\gradle.properties with keystore details
)

:: Check 3: ProGuard enabled
findstr /c:"enableProguardInReleaseBuilds = true" android\app\build.gradle >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ ProGuard enabled for release builds
) else (
    echo ❌ ProGuard disabled
    set /a issues+=1
    echo    Solution: Set enableProguardInReleaseBuilds = true in build.gradle
)

:: Check 4: Network security config
if exist "android\app\src\main\res\xml\network_security_config.xml" (
    echo ✅ Network security configuration present
) else (
    echo ⚠️  Network security config missing
    set /a warnings+=1
    echo    Recommendation: Add network security config for HTTPS enforcement
)

:: Check 5: Proper app signing for release
findstr /c:"signingConfig signingConfigs.release" android\app\build.gradle >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Release build uses proper signing config
) else (
    echo ❌ Release build not using proper signing
    set /a issues+=1
    echo    Solution: Ensure release buildType uses signingConfigs.release
)

:: Check 6: Debug flags disabled in release
findstr /c:"debuggable false" android\app\build.gradle >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Debug flags disabled in release builds
) else (
    echo ⚠️  Debug flags not explicitly disabled
    set /a warnings+=1
    echo    Recommendation: Add debuggable false to release buildType
)

:: Check 7: Version code check
findstr /c:"versionCode" android\app\build.gradle | findstr /v "1" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Version code updated from default
) else (
    echo ⚠️  Version code still at default (1)
    set /a warnings+=1
    echo    Recommendation: Update versionCode for better recognition
)

:: Check 8: Permissions with proper attributes
findstr /c:"maxSdkVersion" android\app\src\main\AndroidManifest.xml >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Storage permissions scoped to specific Android versions
) else (
    echo ⚠️  Storage permissions not scoped
    set /a warnings+=1
    echo    Recommendation: Add maxSdkVersion to storage permissions
)

echo.
echo ===============================================
echo 📊 COMPATIBILITY SUMMARY
echo ===============================================

if %issues% equ 0 (
    echo ✅ CRITICAL ISSUES: None
    echo 🛡️  Your APK should have good Play Protect compatibility!
) else (
    echo ❌ CRITICAL ISSUES: %issues%
    echo ⚠️  These issues MUST be fixed for best compatibility
)

if %warnings% equ 0 (
    echo ✅ WARNINGS: None
) else (
    echo ⚠️  WARNINGS: %warnings%
    echo 💡 These are recommendations for further improvement
)

echo.
echo ===============================================
echo 🚀 NEXT STEPS
echo ===============================================

if %issues% gtr 0 (
    echo 1. Fix the critical issues listed above
    echo 2. Run create-secure-apk.bat to generate a signed release APK
    echo 3. Test the APK on different devices
    echo.
) else (
    echo 1. Run create-secure-apk.bat to build your secure APK
    echo 2. Test installation on different Android devices
    echo 3. Consider uploading to Play Console for further validation
    echo.
)

echo 💡 ADDITIONAL TIPS:
echo    • Always explain SMS permission usage to users
echo    • Test on devices with different Play Protect settings
echo    • Keep your release keystore secure and backed up
echo    • Consider gradual rollout when publishing
echo.

pause
