# 📱 SpendBook - Privacy-First Expense Tracking

A comprehensive Android app for tracking daily expenses with smart SMS detection, analytics, and professional insights. Take control of your finances with intelligent categorization and detailed spending reports.

[![Latest Release](https://img.shields.io/badge/version-3.0.1-blue.svg)](https://github.com/aRc-rAy/Batua/releases/tag/v3.0.1)
[![Platform](https://img.shields.io/badge/platform-Android-green.svg)](https://github.com/aRc-rAy/Batua/releases)
[![Privacy](https://img.shields.io/badge/privacy-first-brightgreen.svg)](https://github.com/aRc-rAy/Batua/blob/main/PRIVACY_POLICY.md)
[![Play Store Ready](https://img.shields.io/badge/Play%20Store-Ready-success.svg)](#)

## 🚀 **Quick Download**

### **📱 Latest Release: v3.0.1 - Play Store Ready**

**[⬇️ Download APK](https://github.com/aRc-rAy/Batua/releases/download/v3.0.1/SpendBook-v3.0.1.apk)** | **[📦 AAB for Play Store](https://github.com/aRc-rAy/Batua/releases/download/v3.0.1/SpendBook-v3.0.1.aab)**

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

### **Latest Release: v3.0.1 - Play Store Ready**

**[⬇️ Download APK](https://github.com/aRc-rAy/Batua/releases/download/v3.0.1/SpendBook-v3.0.1.apk)** (Release APK) | **[📦 AAB Bundle](https://github.com/aRc-rAy/Batua/releases/download/v3.0.1/SpendBook-v3.0.1.aab)** (For Play Store)

### **Installation Instructions:**

1. **Enable Unknown Sources**: Settings → Security → Unknown Sources → Enable
2. **Download APK**: Click the APK download link above
3. **Install App**: Open downloaded APK file and tap "Install"
4. **Grant Permissions**: Allow SMS and Storage permissions when prompted (optional)
5. **Start Tracking**: Launch the app and start managing your expenses!

### **System Requirements:**

- **Android Version**: 7.0 (API 24) or higher
- **Target**: Android 14 (API 34)
- **Storage**: 50 MB free storage space
- **RAM**: 2 GB minimum, 4 GB recommended
- **Permissions**: SMS (optional), Storage (for exports)
- **Play Store**: Fully compatible with Google Play Store
- **Security**: Enhanced privacy controls and Google Play Protect ready

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

- **Framework**: React Native 0.74.1 with TypeScript
- **Language**: TypeScript for type safety and better development experience
- **Database**: AsyncStorage for local data persistence
- **Charts**: react-native-chart-kit for data visualization and analytics
- **Navigation**: React Navigation (Bottom Tabs + Stack Navigation)
- **Icons**: react-native-vector-icons for consistent iconography
- **SMS**: react-native-sms-android for SMS reading capabilities
- **Excel**: react-native-csv for data export functionality
- **Platform**: Android (primary target), iOS (compatible)
- **Build Tool**: Gradle with Android Gradle Plugin 8.3.0
- **Minimum Android**: API 24 (Android 7.0)
- **Target Android**: API 34 (Android 14)
- **Security**: ProGuard obfuscation for release builds

## 🚀 Getting Started (For Developers)

### Prerequisites

- **Node.js**: v18 or higher (LTS recommended)
- **npm**: v8 or higher (or yarn as alternative)
- **Android Studio**: Latest version with Android SDK
- **React Native CLI**: `npm install -g @react-native-community/cli`
- **Android SDK**: API 24-34 (Android 7.0 to Android 14)
- **Java**: OpenJDK 17 (required for Android builds)
- **VS Code**: Recommended IDE with React Native extensions

### Optional (for iOS development)
- **macOS**: Required for iOS development
- **Xcode**: Latest version from Mac App Store
- **CocoaPods**: `gem install cocoapods`

### Installation

```bash
# Clone the repository
git clone https://github.com/aRc-rAy/Batua.git
cd Batua

# Install dependencies
npm install

# For iOS (if developing on macOS)
cd ios && pod install && cd ..
```

### Running the App

```bash
# Start Metro bundler
npm start
# OR
npx react-native start

# Run on Android (recommended)
npm run android
# OR
npx react-native run-android

# Run on iOS (macOS only, requires Xcode)
npm run ios
# OR
npx react-native run-ios
```

### Building for Release

```bash
# Build Android APK (debug)
cd android && ./gradlew assembleDebug

# Build Android APK (release) - Play Store ready
cd android && ./gradlew assembleRelease

# Build Android App Bundle (AAB) - for Play Store
cd android && ./gradlew bundleRelease

# Output locations:
# Debug APK: android/app/build/outputs/apk/debug/
# Release APK: android/app/build/outputs/apk/release/
# Release AAB: android/app/build/outputs/bundle/release/
```

### Windows Build Scripts

For Windows users, convenient batch files are available:

```bash
# Start development server
npm start

# Build release APK
build-release-apk.bat

# Build Play Store bundle
create-play-store-build.bat
```

## 📁 Project Structure

```
PaymentTracker/
├── android/                    # Android native code
│   ├── app/
│   │   ├── build.gradle       # Android app configuration
│   │   ├── debug.keystore     # Debug signing keystore
│   │   ├── proguard-rules.pro # ProGuard configuration
│   │   └── src/main/
│   │       ├── AndroidManifest.xml # App permissions and metadata
│   │       ├── java/          # Native Android code
│   │       ├── res/           # Android resources
│   │       │   ├── xml/       # Backup and security rules
│   │       │   ├── mipmap/    # App icons
│   │       │   └── values/    # Styles and strings
│   │       └── assets/        # Static assets
│   ├── build.gradle           # Project-level build configuration
│   ├── gradle.properties      # Gradle configuration
│   └── settings.gradle        # Gradle settings
├── ios/                       # iOS native code
│   ├── PaymentTracker/        # iOS app configuration
│   │   ├── Info.plist         # iOS app metadata
│   │   ├── LaunchScreen.storyboard
│   │   └── Images.xcassets/   # iOS app icons
│   └── Podfile                # iOS dependencies
├── src/                       # React Native source code
│   ├── assets/                # App assets
│   │   ├── app_icon.png       # App icon
│   │   ├── qr_gpay.png        # QR code for donations
│   │   └── upi_qr.jpg         # UPI QR code
│   ├── components/            # Reusable UI components
│   │   ├── PaymentActions.tsx # Payment action buttons
│   │   ├── PrivacyInfo.tsx    # Privacy information component
│   │   └── TransactionList.tsx # Transaction list component
│   ├── context/               # React Context
│   │   └── ThemeContext.tsx   # Theme management
│   ├── navigation/            # Navigation configuration
│   │   └── AppNavigator.tsx   # Main navigation setup
│   ├── screens/               # Screen components
│   │   ├── HomeScreen.tsx     # Main dashboard
│   │   ├── AddPaymentScreen.tsx # Add new payment
│   │   ├── HistoryScreen.tsx  # Transaction history
│   │   ├── AnalyticsScreen.tsx # Analytics dashboard
│   │   ├── EditPaymentScreen.tsx # Edit transactions
│   │   ├── PaymentActionsScreen.tsx # Payment actions
│   │   ├── SettingsScreen.tsx # App settings
│   │   └── SMSScreen.tsx      # SMS configuration
│   ├── services/              # Business logic
│   │   ├── AIAssistantService.ts # AI assistant integration
│   │   ├── BudgetService.ts   # Budget management
│   │   ├── PaymentService.ts  # Payment data management
│   │   ├── SMSService.ts      # SMS parsing and detection
│   │   ├── SuggestionService.ts # Smart suggestions
│   │   └── WidgetService.ts   # Widget functionality
│   ├── types/                 # TypeScript definitions
│   │   ├── index.ts           # Core type definitions
│   │   └── sms-android.d.ts   # SMS Android types
│   └── utils/                 # Utility functions
│       ├── formatting.ts      # Data formatting utilities
│       └── typography.ts      # Typography utilities
├── release-files/             # Release artifacts
│   └── app-release.aab        # Previous AAB build
├── build-*.bat                # Windows build scripts
├── SpendBook-v3.0.1.apk      # Latest release APK (20.6MB)
├── SpendBook-v3.0.1.aab      # Latest release AAB (13.1MB)
├── app-release.apk            # Previous release APK
├── App.tsx                    # Main app component
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── metro.config.js            # Metro bundler configuration
├── babel.config.js            # Babel configuration
├── index.js                   # Entry point
├── PRIVACY_POLICY.md          # Privacy policy
├── PROJECT_STRUCTURE.md       # Detailed project structure
├── RELEASE_NOTES.md           # Release notes
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

- **Start Metro Bundler**: `npm start` - Development server with hot reload
- **Build and Run Android**: `npm run android` - Launch on connected Android device/emulator
- **Build Release APK**: Windows batch scripts available for quick builds
- **Play Store Build**: `create-play-store-build.bat` - Generate AAB for Play Store submission

### Build Scripts (Windows)

- `build-release-apk.bat` - Quick release APK build
- `create-play-store-build.bat` - Generate Play Store AAB
- `build-with-icon.bat` - Build with updated app icons
- `check-play-protect.bat` - Validate Play Protect compliance

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
# Clear Metro cache and restart
npx react-native start --reset-cache

# Clear all caches
npm start -- --reset-cache
```

**Android Build Issues:**
```bash
# Clean Android build
cd android && ./gradlew clean && cd ..

# Clean and rebuild
cd android && ./gradlew clean && ./gradlew assembleDebug
```

**Gradle Issues:**
```bash
# Update Gradle wrapper
cd android && ./gradlew wrapper --gradle-version=8.3

# Clean Gradle cache
./gradlew --stop && ./gradlew clean
```

**Permission Issues:**
- Ensure SMS permissions are granted in Android Settings → Apps → SpendBook → Permissions
- Check storage permissions for Excel export functionality
- For development: Enable Developer Options and USB Debugging

**Play Store Build Issues:**
- Ensure you're building with `bundleRelease` for AAB format
- Check ProGuard rules if getting obfuscation errors
- Verify signing configuration in `android/app/build.gradle`

### Debug Mode

- **Device**: Shake device to open React Native dev menu
- **Emulator**: Press `Ctrl+M` (Windows) / `Cmd+M` (Mac) for dev menu
- **Browser**: Enable "Debug JS Remotely" for Chrome debugging
- **Logs**: Use `npx react-native log-android` for real-time logs
- **VSCode**: Use React Native debugger extension

### Performance Tips

- Use `--variant=release` for performance testing
- Enable Hermes JS engine for better performance
- Check memory usage with Android Studio's profiler

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
