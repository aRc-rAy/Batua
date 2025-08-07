@echo off
echo Building Batua with new app icon...
echo.

REM Clean build
echo Cleaning previous build...
cd android
call gradlew clean

REM Build and install
echo Building and installing app...
cd ..
call npx react-native run-android

echo.
echo Build completed! The new Batua icon should now appear on your device.
echo.
pause
