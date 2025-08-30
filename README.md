# 📱 SpendBook - Personal Payment Tracker

A comprehensive Android app for tracking daily expenses with smart SMS detection, analytics, and professional insights.

[![Latest Release](https://img.shields.io/badge/version-2.0.1-blue.svg)](https://github.com/aRc-rAy/Batua/releases/tag/v2.0.1)
[![Platform](https://img.shields.io/badge/platform-Android-green.svg)](https://github.com/aRc-rAy/Batua/releases/download/v2.0.1/spendbook-v2.0.1.apk)

## ✨ Features

### 💰 **Expense Tracking**
- � **Manual Entry**: Add payments with amount, description, and category
- � **SMS Auto-Detection**: Automatically detect payments from bank SMS
- 🏷️ **Smart Categories**: 7 predefined categories with icons (Food 🍽️, Travel ✈️, Clothes 👕, Entertainment 🎬, Bills 📄, Healthcare 🏥, Others 📦)
- ✏️ **Edit & Delete**: Modify or remove transactions easily

### 📊 **Analytics & Insights**
- 📈 **Visual Charts**: Bar charts and pie charts for spending analysis
- 📅 **Time-based Analytics**: Daily, weekly, monthly, and yearly insights
- 🎯 **Smart Insights**: Top spending categories, daily averages, and trends
- 📊 **Dashboard**: Professional insights dashboard with spending patterns

### 💾 **Data Management**
- 📄 **CSV Export**: Export transaction data for external analysis
- 💾 **Local Storage**: Secure local data storage with AsyncStorage
- 🔄 **Data Persistence**: All data saved locally on device

### 🎨 **User Experience**
- 🌙 **Dark/Light Theme**: Professional theme support
- 📱 **Responsive Design**: Optimized for Android devices
- 🎯 **Intuitive Navigation**: Bottom tab navigation with stack navigation
- ⚡ **Fast Performance**: Optimized React Native performance

## 📥 Download & Installation

### Latest Release: v2.0.1
**[⬇️ Download APK](https://github.com/aRc-rAy/Batua/releases/download/v2.0.1/spendbook-v2.0.1.apk)** (27.9 MB)

### Installation Instructions:
1. **Enable Unknown Sources**: Go to Settings → Security → Unknown Sources → Enable
2. **Download APK**: Click the download link above
3. **Install App**: Open the downloaded APK file and tap "Install"
4. **Grant Permissions**: Allow SMS and Storage permissions when prompted
5. **Launch App**: Tap "Open" to start using SpendBook

### System Requirements:
- **Android Version**: 5.0 (API 21) or higher
- **Storage**: 50 MB free space
- **Permissions**: SMS, Storage, Network

## 🔐 Permissions

The app requires the following permissions for full functionality:

- **📱 SMS Access**: For automatic payment detection from bank SMS
- **💾 Storage**: For CSV export functionality and data persistence
- **🌐 Network**: For potential future updates and analytics

## 🏗️ Technical Stack

- **Framework**: React Native 0.80.2 with TypeScript
- **Language**: TypeScript for type safety
- **Database**: AsyncStorage for local data persistence
- **Charts**: react-native-chart-kit for data visualization
- **Navigation**: React Navigation (Bottom Tabs + Stack)
- **Icons**: react-native-vector-icons
- **Platform**: Android (primary), iOS (compatible)
- **Build Tool**: Gradle with Android Gradle Plugin

## 🚀 Getting Started (For Developers)

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Android Studio (for Android development)
- React Native CLI
- Android SDK (API 21+)

### Installation
```bash
# Clone the repository
git clone https://github.com/aRc-rAy/Batua.git
cd Batua

# Install dependencies
npm install

# For iOS (if developing on macOS)
cd ios && bundle exec pod install && cd ..
```

### Running the App
```bash
# Start Metro bundler
npm start
# OR
npx react-native start

# Run on Android
npm run android
# OR
npx react-native run-android

# Run on iOS (macOS only)
npm run ios
# OR
npx react-native run-ios
```

### Building APK
```bash
# Navigate to android directory
cd android

# Build debug APK
./gradlew assembleDebug

# Build release APK
./gradlew assembleRelease

# APK locations:
# Debug: android/app/build/outputs/apk/debug/app-debug.apk
# Release: android/app/build/outputs/apk/release/app-release.apk
```

## 📁 Project Structure

```
SpendBook/
├── android/                    # Android native code
│   ├── app/
│   │   ├── build.gradle       # Android app configuration
│   │   └── src/main/
│   │       ├── AndroidManifest.xml
│   │       ├── java/          # Native Android code
│   │       └── res/           # Android resources
│   └── gradle.properties      # Gradle configuration
├── ios/                       # iOS native code (if needed)
├── src/                       # React Native source code
│   ├── components/            # Reusable UI components
│   ├── navigation/            # Navigation configuration
│   │   └── AppNavigator.tsx   # Main navigation setup
│   ├── screens/               # Screen components
│   │   ├── HomeScreen.tsx     # Main dashboard
│   │   ├── AddPaymentScreen.tsx # Add new payment
│   │   ├── HistoryScreen.tsx  # Transaction history
│   │   ├── AnalyticsScreen.tsx # Analytics dashboard
│   │   ├── EditPaymentScreen.tsx # Edit transactions
│   │   └── SettingsScreen.tsx # App settings
│   ├── services/              # Business logic
│   │   └── PaymentService.ts  # Payment data management
│   └── types/                 # TypeScript definitions
│       └── index.ts           # Type definitions
├── __tests__/                 # Test files
├── android/app/build/outputs/apk/release/ # Built APKs
├── spendbook-v1.0.0.apk       # Latest release APK
├── App.tsx                    # Main app component
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
└── README.md                  # This file
```

## 🎨 Design System

### Typography
- **Primary Font**: System font with optimized sizes
- **Consistent Scaling**: Readable text across all screen sizes
- **Accessibility**: WCAG compliant contrast ratios

### Color Scheme
- **Primary**: Professional blue tones
- **Secondary**: Clean grays and whites
- **Accent**: Category-specific colors
- **Dark Mode**: Full dark theme support

### Components
- **Card-based Layout**: Clean, modern card designs
- **Consistent Spacing**: 8px grid system
- **Touch Targets**: Minimum 44px touch targets
- **Loading States**: Smooth loading indicators

## 🔧 Development Tasks

Available VS Code tasks for development:

- **Start Metro Bundler**: `npm start` - Development server
- **Build and Run Android**: `npm run android` - Launch on Android
- **Build Release APK**: `./gradlew assembleRelease` - Production build

## 📊 App Capabilities

### Core Functionality
- ✅ Manual payment entry with categories
- ✅ SMS transaction auto-detection
- ✅ Transaction history with filtering
- ✅ Edit and delete transactions
- ✅ CSV export functionality
- ✅ Analytics with charts and insights
- ✅ Dark/Light theme support
- ✅ Local data persistence
- ✅ Professional UI/UX

### Future Enhancements
- 🔄 Cloud backup and sync
- 📊 Advanced analytics and reporting
- 🔔 Push notifications for budgets
- 🏠 Home screen widget
- 🔐 Biometric authentication
- 🌍 Multi-language support

## 🐛 Troubleshooting

### Common Issues

**Metro Bundler Issues:**
```bash
# Clear Metro cache
npx react-native start --reset-cache
```

**Android Build Issues:**
```bash
# Clean Android build
cd android && ./gradlew clean && cd ..
```

**Permission Issues:**
- Ensure SMS permissions are granted in Android settings
- Check storage permissions for CSV export

### Debug Mode
- Shake device or press `Ctrl+M` (Android) / `Cmd+D` (iOS) for dev menu
- Enable "Debug JS Remotely" for Chrome debugging
- Check console logs for error messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/aRc-rAy/Batua/issues)
- **Discussions**: [GitHub Discussions](https://github.com/aRc-rAy/Batua/discussions)
- **Email**: For support inquiries

## 🙏 Acknowledgments

- React Native community for the amazing framework
- Open source libraries used in this project
- Contributors and beta testers

---

**Built with ❤️ using React Native and TypeScript**

*Download SpendBook today and take control of your personal finances!* 📱💰

---

**Built with ❤️ using React Native and TypeScript**

*Download SpendBook today and take control of your personal finances!* 📱💰
