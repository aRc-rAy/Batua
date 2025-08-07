#!/bin/bash
# Batua Payment Tracker - Quick Deploy Script

echo "🚀 Batua Payment Tracker Deployment"
echo "=================================="

# Check if APK exists
if [ -f "batua-v1.0.0.apk" ]; then
    echo "✅ APK found: batua-v1.0.0.apk ($(du -h batua-v1.0.0.apk | cut -f1))"
else
    echo "❌ APK not found. Building..."
    cd android
    ./gradlew assembleRelease
    cd ..
    cp android/app/build/outputs/apk/release/app-release.apk batua-v1.0.0.apk
fi

echo ""
echo "📱 Your app is ready for deployment!"
echo ""
echo "🌐 Deployment Options:"
echo "1. GitHub Releases (Recommended)"
echo "2. Firebase App Distribution"
echo "3. Direct file sharing"
echo "4. APKPure/APKMirror submission"
echo ""
echo "📁 APK Location: $(pwd)/batua-v1.0.0.apk"
echo "📊 APK Size: $(du -h batua-v1.0.0.apk | cut -f1)"
echo ""
echo "🔗 Next Steps:"
echo "- Upload to GitHub Releases for public download"
echo "- Share directly via cloud storage (Google Drive, Dropbox)"
echo "- Submit to alternative app stores"
echo ""
echo "✨ Your Batua Payment Tracker is ready for the world!"
