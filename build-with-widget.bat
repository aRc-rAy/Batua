@echo off
echo ===============================================
echo 🔄 REBUILDING SPENDBOOK WITH ENHANCED WIDGET
echo ===============================================
echo.

echo 🧹 Cleaning previous builds...
cd android
call gradlew clean
cd ..

echo.
echo 📱 Building APK with enhanced widget...
echo    ✨ Today's, Weekly, Monthly spending
echo    🔘 Add Payment button
echo    🚀 Open App button  
echo    🎨 Beautiful gradient design
echo.

cd android
call gradlew assembleDebug

if %errorlevel% neq 0 (
    echo.
    echo ❌ Build failed! Check the errors above.
    pause
    exit /b 1
)

echo.
echo ===============================================
echo ✅ BUILD COMPLETED SUCCESSFULLY!
echo ===============================================
echo.
echo 📱 APK Location: android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo 🎯 WIDGET FEATURES:
echo    📊 Today's spending with 📅 icon
echo    📈 Weekly spending with 📊 icon
echo    💰 Monthly spending with 📈 icon
echo    ➕ Add Payment button (green)
echo    📱 Open App button (blue)
echo    🕐 Last updated timestamp
echo.
echo 📋 INSTALLATION STEPS:
echo    1. Install the APK on your device
echo    2. Long press on home screen
echo    3. Select "Widgets"
echo    4. Find "SpendBook Spending Widget"
echo    5. Drag it to your home screen
echo    6. Resize as needed (4x3 grid recommended)
echo.
echo 💡 WIDGET TIPS:
echo    • Widget updates every 15 minutes automatically
echo    • Tap "Add Payment" to quickly add expenses
echo    • Tap "Open App" or widget background to open full app
echo    • Widget shows real-time spending data
echo.
pause
