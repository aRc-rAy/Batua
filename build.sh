#!/bin/bash
# SpendBook v4.0.0 Build Script

echo "🚀 Building SpendBook v4.0.0..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
cd android
./gradlew clean

# Build release AAB for Play Store
echo "📦 Building release AAB..."
./gradlew bundleRelease

# Build release APK for direct installation
echo "📱 Building release APK..."
./gradlew assembleRelease

echo "✅ Build completed!"
echo "📁 Files created:"
echo "   - AAB: android/app/build/outputs/bundle/release/app-release.aab"
echo "   - APK: android/app/build/outputs/apk/release/app-release.apk"
