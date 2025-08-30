# 📱 SpendBook Payment Tracker - Deployment Guide

## App Information
- **Name**: SpendBook Payment Tracker
- **Version**: 1.0.0
- **Platform**: Android
- **APK Size**: ~21.4 MB
- **Build Date**: August 8, 2025

## Features
✅ Track daily expenses with categories
✅ SMS auto-detection for payments
✅ Analytics with weekly/monthly/yearly views
✅ Export to CSV functionality
✅ Edit/Delete transactions
✅ Professional insights dashboard
✅ Dark/Light theme support

## 🚀 Deployment Options

### Option 1: GitHub Releases (Recommended)
1. **Create GitHub Repository**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - SpendBook Payment Tracker v1.0.0"
   git branch -M main
   git remote add origin https://github.com/yourusername/spendbook-payment-tracker.git
   git push -u origin main
   ```

2. **Create Release**:
   - Go to your GitHub repository
   - Click "Releases" → "Create a new release"
   - Tag: `v1.0.0`
   - Title: `SpendBook Payment Tracker v1.0.0`
   - Upload: `app-release.apk`
   - Publish release

3. **Share Download Link**:
   ```
   https://github.com/yourusername/spendbook-payment-tracker/releases/download/v1.0.0/app-release.apk
   ```

### Option 2: Firebase App Distribution
1. **Setup Firebase**:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init
   ```

2. **Upload APK**:
   ```bash
   firebase appdistribution:distribute app-release.apk --app YOUR_APP_ID --groups "testers"
   ```

### Option 3: Direct Website Hosting
1. **Upload to GitHub Pages/Netlify**
2. **Create download page with APK link**
3. **Add installation instructions**

## 📱 Installation Instructions for Users

### For Android Users:
1. **Enable Unknown Sources**:
   - Settings → Security → Unknown Sources → Enable
   - Or Settings → Apps → Special Access → Install Unknown Apps

2. **Download APK**:
   - Click the download link
   - Wait for download to complete

3. **Install App**:
   - Open downloaded APK file
   - Tap "Install"
   - Wait for installation
   - Tap "Open" to launch

### Permissions Required:
- **SMS Access**: For automatic payment detection
- **Storage**: For CSV export functionality
- **Network**: For potential future updates

## 🔒 Security Notes
- APK is unsigned (for testing/personal use)
- For Play Store deployment, need signed APK
- Users may see "Install anyway" warning (normal for unsigned apps)

## 📊 App Capabilities
- **Expense Tracking**: Add manual payments or auto-detect from SMS
- **Categories**: Food, Travel, Entertainment, Clothes, Bills, Healthcare, Others
- **Analytics**: Visual charts and spending insights
- **Export**: CSV export for external analysis
- **Data**: Stored locally on device (privacy-first)

## 🛠️ Technical Details
- **Framework**: React Native 0.80.2
- **Database**: AsyncStorage (local)
- **Charts**: react-native-chart-kit
- **Icons**: Emoji-based (no external dependencies)
- **Size**: Optimized for minimal download

## 📞 Support
- **GitHub Issues**: For bug reports and feature requests
- **Version**: Check for updates in GitHub releases
- **Privacy**: All data stored locally, no cloud sync

---

**Built with ❤️ using React Native**
