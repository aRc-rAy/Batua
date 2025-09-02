# 📱 PaymentTracker (Batua) - Privacy-First Expense Tracking

A comprehensive Android app for tracking daily expenses with smart SMS detection, analytics, and professional insights. Take control of your finances with intelligent categorization and detailed spending reports.

[![Latest Release](https://img.shields.io/badge/version-1.0.1-blue.svg)](https://github.com/aRc-rAy/Batua/releases/tag/v1.0.1)
[![Platform](https://img.shields.io/badge/platform-Android-green.svg)](https://github.com/aRc-rAy/Batua/releases)
[![Privacy](https://img.shields.io/badge/privacy-first-brightgreen.svg)](https://github.com/aRc-rAy/Batua/blob/main/PRIVACY_POLICY.md)
[![Play Store Ready](https://img.shields.io/badge/Play%20Store-Ready-success.svg)](#)

## 🚀 **Quick Download**

### **📱 Latest Release: v1.0.1 - Play Store Ready**

**[⬇️ Download APK](https://github.com/aRc-rAy/Batua/releases/download/v1.0.1/app-release.apk)** | **[📦 AAB for Play Store](https://github.com/aRc-rAy/Batua/releases/download/v1.0.1/app-release.aab)**

## ✨ **Key Features**

### �️ **Privacy & Security**

- 🔒 **Privacy First**: All data stays on your device - no cloud storage
- 📵 **Selective SMS Reading**: Only reads messages from trusted financial institutions
- 🏦 **Bank SMS Only**: HDFC, ICICI, SBI, Axis, PayTM, GPay, PhonePe, and more
- 🚫 **No Personal Data**: Never accesses personal messages or conversations
- ✋ **User Control**: SMS detection can be disabled anytime in settings
- 🛡️ **Play Store Ready**: Enhanced security for Google Play compliance

### �💰 **Expense Tracking**

- ➕ **Manual Entry**: Add payments with amount, description, and category
- 📱 **SMS Auto-Detection**: Automatically detect payments from bank SMS
- 🏷️ **Smart Categories**: 8 predefined categories (Food, Travel, Clothes, Entertainment, Medical, Utilities, Others)
- ✏️ **Edit & Delete**: Modify or remove transactions easily

### 📊 **Analytics & Insights**

- 📈 **Visual Charts**: Bar charts and pie charts for spending analysis
- 📅 **Time-based Analytics**: 7 days, 1 month, 3 months spending trends
- 🥧 **Category Breakdown**: Pie charts showing spending distribution
- 📊 **Dashboard**: Professional insights with spending patterns

### 💾 **Data Management**

- 📄 **Excel Export**: Export transaction data for external analysis
- 💾 **Local Storage**: Secure SQLite database storage
- 🔄 **Data Persistence**: All data saved locally on device
- 🏠 **Home Widget**: Quick view of daily/monthly spending totals

### 🎨 **User Experience**

- � **Minimalist Design**: Clean, professional interface
- 📱 **Responsive Layout**: Optimized for Android devices  
- 🎯 **Intuitive Navigation**: Easy-to-use tab navigation
- ⚡ **Fast Performance**: Optimized React Native performance

## 📥 **Download & Installation**

### **Latest Release: v1.0.1 - Play Store Ready**

**[⬇️ Download APK](https://github.com/aRc-rAy/Batua/releases/download/v1.0.1/app-release.apk)** (Release APK) | **[📦 AAB Bundle](https://github.com/aRc-rAy/Batua/releases/download/v1.0.1/app-release.aab)** (For Play Store)

### **Installation Instructions:**

1. **Enable Unknown Sources**: Settings → Security → Unknown Sources → Enable
2. **Download APK**: Click the APK download link above  
3. **Install App**: Open downloaded APK file and tap "Install"
4. **Grant Permissions**: Allow SMS and Storage permissions when prompted (optional)
5. **Start Tracking**: Launch the app and start managing your expenses!

### **System Requirements:**
- Android 7.0 (API level 24) or higher
- 50 MB free storage space
- Optional: SMS permission for auto-detection

## 🏦 **Supported Banks & Services**

### **Major Banks**
HDFC Bank | ICICI Bank | State Bank of India | Axis Bank | Kotak Bank | Punjab National Bank | Bank of India | Canara Bank | Union Bank | IndusInd Bank | YES Bank | RBL Bank | Federal Bank | IDFC Bank | Bandhan Bank | AU Small Finance Bank

### **Digital Wallets & UPI**
PayTM | Google Pay | PhonePe | Amazon Pay | MobiKwik | FreeCharge | BHIM | Yono | All UPI Services

### **Card Networks**
Visa | Mastercard | RuPay | American Express

### System Requirements:

- **Android Version**: 5.0 (API 21) or higher
- **Storage**: 50 MB free space
- **Permissions**: SMS, Storage, Network

## 🔐 Permissions

The app requires the following permissions for full functionality:

- **📱 SMS Access**: For automatic payment detection from bank SMS
- **💾 Storage**: For Excel export functionality and data persistence
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
- ✅ Excel export functionality
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

_Download SpendBook today and take control of your personal finances!_ 📱💰
