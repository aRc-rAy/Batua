# PaymentTracker - Project Structure Guide

## 📋 Table of Contents
- [Project Overview](#project-overview)
- [Root Directory Files](#root-directory-files)
- [Configuration Files](#configuration-files)
- [Build Scripts](#build-scripts)
- [Source Code Structure](#source-code-structure)
- [Platform-Specific Directories](#platform-specific-directories)
- [Essential vs Optional Files](#essential-vs-optional-files)
- [Development Setup Requirements](#development-setup-requirements)

---

## 🎯 Project Overview

**PaymentTracker (SpendBook)** is a React Native mobile application for tracking payments with SMS detection capabilities, built for Android with future iOS support.

---

## 📁 Root Directory Files

### **Application Entry Points**
| File | Type | Purpose | Essential |
|------|------|---------|-----------|
| `index.js` | JavaScript | Main entry point for React Native app | ✅ **Required** |
| `App.tsx` | TypeScript | Root React component with navigation setup | ✅ **Required** |
| `app.json` | JSON | App metadata (name, version, display name) | ✅ **Required** |

### **Package Management**
| File | Type | Purpose | Essential |
|------|------|---------|-----------|
| `package.json` | JSON | Dependencies, scripts, and project metadata | ✅ **Required** |
| `package-lock.json` | JSON | Locked dependency versions for consistency | ✅ **Required** |

### **Documentation**
| File | Type | Purpose | Essential |
|------|------|---------|-----------|
| `README.md` | Markdown | Project documentation and setup instructions | 📝 **Recommended** |
| `PRIVACY_POLICY.md` | Markdown | Privacy policy for app store submission | 📝 **Recommended** |

---

## ⚙️ Configuration Files

### **TypeScript Configuration**
| File | Type | Purpose | Essential |
|------|------|---------|-----------|
| `tsconfig.json` | JSON | TypeScript compiler settings and paths | ✅ **Required** |

### **Build & Bundling**
| File | Type | Purpose | Essential |
|------|------|---------|-----------|
| `babel.config.js` | JavaScript | Babel transpiler configuration | ✅ **Required** |
| `metro.config.js` | JavaScript | Metro bundler configuration for React Native | ✅ **Required** |

### **Code Quality**
| File | Type | Purpose | Essential |
|------|------|---------|-----------|
| `.eslintrc.js` | JavaScript | ESLint rules for code linting | 🔧 **Development** |
| `.prettierrc.js` | JavaScript | Prettier code formatting rules | 🔧 **Development** |

### **Development Tools**
| File | Type | Purpose | Essential |
|------|------|---------|-----------|
| `.watchmanconfig` | JSON | Facebook Watchman file watching configuration | 🔧 **Development** |
| `.gitignore` | Text | Git ignore patterns for version control | 🔧 **Development** |

---

## 🔨 Build Scripts

### **Batch Files (Windows)**
| File | Type | Purpose | Essential |
|------|------|---------|-----------|
| `build-apk.bat` | Batch | Automated APK building script | 🚀 **Build Tool** |
| `build-playstore.bat` | Batch | Play Store release build script | 🚀 **Build Tool** |
| `build-with-icon.bat` | Batch | Build with icon generation script | 🚀 **Build Tool** |

---

## 📱 Platform-Specific Directories

### **Android Development**
```
android/
├── app/
│   ├── build.gradle              # Android app build configuration
│   ├── src/main/
│   │   ├── AndroidManifest.xml   # App permissions and components
│   │   ├── res/                  # Android resources
│   │   │   ├── mipmap-*/         # App icons (all densities)
│   │   │   ├── values/           # Strings, colors, styles
│   │   │   └── drawable/         # Images and drawables
│   │   └── java/                 # Native Android code
│   └── proguard-rules.pro        # Code obfuscation rules
├── build.gradle                  # Project-level Gradle config
├── gradle.properties             # Gradle properties
├── gradlew                       # Gradle wrapper (Unix)
├── gradlew.bat                   # Gradle wrapper (Windows)
├── settings.gradle               # Gradle settings
├── playstore-icon.png            # 512x512 Play Store icon
└── ic_launcher-web.png           # Web launcher icon
```

**Essential Android Files:** ✅ **All Required** for Android builds

### **iOS Development** 
```
ios/
├── PaymentTracker/
│   ├── Info.plist                # iOS app configuration
│   ├── AppDelegate.swift         # iOS app delegate
│   ├── LaunchScreen.storyboard   # Launch screen
│   └── Images.xcassets/          # iOS app icons
├── PaymentTracker.xcodeproj/     # Xcode project files
└── Podfile                       # CocoaPods dependencies
```

**Essential iOS Files:** 🍎 **Required for iOS builds** (Future use)

---

## 💻 Source Code Structure

```
src/
├── components/                   # Reusable React components
├── context/                      # React context providers
├── navigation/
│   └── AppNavigator.tsx          # Navigation configuration
├── screens/                      # App screens/pages
│   ├── HomeScreen.tsx           # Main dashboard
│   ├── AddPaymentScreen.tsx     # Add payment form
│   ├── EditPaymentScreen.tsx    # Edit payment form
│   ├── HistoryScreen.tsx        # Payment history
│   ├── AnalyticsScreen.tsx      # Charts and analytics
│   └── SettingsScreen.tsx       # App settings
├── services/
│   └── PaymentService.ts        # Data persistence logic
├── types/
│   └── index.ts                 # TypeScript type definitions
├── utils/                       # Utility functions
└── assets/                      # Static assets
    ├── app_icon.png            # App icon for home screen
    ├── qr_gpay.png             # Google Pay QR code
    └── upi_qr.jpg              # UPI QR code
```

**All source files:** ✅ **Required** for app functionality

---

## 🎯 Essential vs Optional Files

### ✅ **Absolutely Essential** (Project won't work without these)
```
├── index.js                     # App entry point
├── App.tsx                      # Root component
├── package.json                 # Dependencies
├── app.json                     # App metadata
├── babel.config.js              # Babel config
├── metro.config.js              # Metro bundler
├── tsconfig.json                # TypeScript config
├── android/                     # Android platform
├── ios/                         # iOS platform (future)
└── src/                         # Source code
```

### 📝 **Highly Recommended**
```
├── README.md                    # Documentation
├── PRIVACY_POLICY.md            # Privacy policy
├── .gitignore                   # Version control
└── package-lock.json            # Dependency locking
```

### 🔧 **Development Tools** (Optional but useful)
```
├── .eslintrc.js                 # Code linting
├── .prettierrc.js               # Code formatting
├── .watchmanconfig              # File watching
├── .vscode/                     # VS Code settings
└── .github/                     # GitHub workflows
```

### 🚀 **Build Automation** (Optional convenience)
```
├── build-apk.bat               # APK build script
├── build-playstore.bat         # Release build script
└── build-with-icon.bat         # Icon build script
```

---

## 🛠️ Development Setup Requirements

### **For New Project Setup, You Need:**

1. **Core Files** ✅
   - `package.json` with all dependencies
   - `index.js` and `App.tsx`
   - `babel.config.js` and `metro.config.js`
   - `tsconfig.json`

2. **Platform Files** 📱
   - `android/` directory with all Android configs
   - `ios/` directory for future iOS support

3. **Source Code** 💻
   - `src/` directory with all app logic
   - All screen components
   - Navigation setup
   - Services and utilities

4. **Assets** 🎨
   - App icons in `android/app/src/main/res/mipmap-*/`
   - QR code images in `src/assets/`

### **To Set Up This Project Elsewhere:**

1. **Copy Essential Files:**
   ```bash
   # These directories/files are mandatory
   src/
   android/
   ios/
   index.js
   App.tsx
   package.json
   babel.config.js
   metro.config.js
   tsconfig.json
   app.json
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Platform Setup:**
   ```bash
   # For Android
   npx react-native run-android
   
   # For iOS (future)
   cd ios && pod install && cd ..
   npx react-native run-ios
   ```

### **File Size Categories:**

| Category | Size | Examples |
|----------|------|----------|
| **Large** (>10MB) | `node_modules/`, `android/build/` | Generated/Downloaded |
| **Medium** (1-10MB) | `*.apk`, large images | Build outputs |
| **Small** (<1MB) | All source code, configs | Hand-written files |

---

## 🚀 Quick Setup Commands

```bash
# 1. Clone/copy project files
# 2. Install dependencies
npm install

# 3. Start Metro bundler
npm start

# 4. Run on Android
npm run android

# 5. Build APK
cd android && ./gradlew assembleDebug
```

---

## 📊 Project Statistics

- **Total Source Files**: ~15 TypeScript/JavaScript files
- **Configuration Files**: ~8 config files
- **Platform Files**: ~20 Android + iOS files
- **Essential Files**: ~25 files minimum
- **Optional Files**: ~10 convenience/development files

---

*This document explains the complete project structure for PaymentTracker React Native app. Keep this updated when adding new files or restructuring the project.*
