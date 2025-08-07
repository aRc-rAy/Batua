# 📱 Batua - Personal Payment Tracker

A comprehensive Android app for tracking daily expenses with smart SMS detection and analytics.

## ✨ Features

- 📊 **Smart Analytics** - Weekly, monthly, and yearly spending insights
- 💳 **SMS Auto-Detection** - Automatically detect payments from SMS
- 📋 **Category Management** - Organize expenses by Food, Travel, Entertainment, etc.
- 📈 **Visual Charts** - Bar charts and pie charts for spending analysis
- 📄 **CSV Export** - Export transaction data for external analysis
- ✏️ **Edit & Delete** - Modify or remove transactions easily
- 🎯 **Insights Dashboard** - Top spending categories, daily averages, and trends

## � Download

### Latest Release: v1.0.0
**[Download APK](android/app/build/outputs/apk/release/app-release.apk)** (21.4 MB)

### Installation Instructions:
1. Enable "Install from Unknown Sources" in Android settings
2. Download the APK file
3. Tap the downloaded file and select "Install"
4. Grant necessary permissions when prompted

## 🔐 Permissions

- **SMS Access**: For automatic payment detection from bank SMS
- **Storage**: For CSV export functionality

## 🏗️ Technical Stack

- **Framework**: React Native 0.80.2 with TypeScript
- **Database**: AsyncStorage (local storage)
- **Charts**: react-native-chart-kit
- **Navigation**: React Navigation (Bottom Tabs + Stack)
- **Platform**: Android

## 🚀 Getting Started (For Developers)

### Prerequisites
- Node.js (v14 or higher)
- Android Studio
- React Native CLI

### Installation
```bash
# Install dependencies
npm install

# Start Metro bundler
npx react-native start

# Run on Android
npx react-native run-android
```

### Building APK
```bash
# Navigate to android directory
cd android

# Build release APK
./gradlew assembleRelease

# APK location: android/app/build/outputs/apk/release/app-release.apk
```

#### Step 1: Start Metro Bundler

```bash
npm start
# OR
npx react-native start
```

#### Step 2: Build and Run Android

In a new terminal:

```bash
npm run android
# OR
npx react-native run-android
```

## Development

### Project Structure

```
src/
├── components/          # Reusable UI components
├── navigation/          # Navigation configuration
├── screens/            # Screen components
│   └── HomeScreen.tsx  # Main dashboard screen
└── types/              # TypeScript type definitions
```

### Available Tasks (VS Code)

- **Start Metro Bundler**: Starts the development server
- **Build and Run Android**: Builds and launches the app on Android

## Design Principles

- **Minimalist Approach**: Clean, uncluttered interface
- **Readable Typography**: Optimized font sizes for better readability
- **Professional Look**: Business-friendly color scheme and layout
- **User-Friendly**: Intuitive navigation and interactions
- **Scalable Architecture**: Built for easy feature additions

## Next Steps

This is **Step 1** of the development process. The basic project structure and enhanced features are ready for testing. Next steps will include:

1. **Step 2**: Implement local database storage ✅ (Database setup ready)
2. **Step 3**: Add SMS reading capabilities for Android
3. **Step 4**: Create advanced analytics with charts and graphs
4. **Step 5**: Add Excel export functionality
5. **Step 6**: Implement home widget for daily/monthly totals

## What's New in This Update

### ✅ **Enhanced Features Added:**

1. **Full Add Payment Screen**

   - Beautiful form with amount input, description, and category selection
   - 7 payment categories with emojis: Food 🍽️, Travel ✈️, Clothes 👕, Entertainment 🎬, Bills 📄, Healthcare 🏥, Others 📦
   - Form validation and success alerts
   - Professional UI with good typography

2. **Complete History Screen**

   - Mock transaction data to demonstrate functionality
   - Transaction cards with category icons and details
   - Filter buttons (All, Manual, SMS)
   - Total spending summary card
   - Export button ready for Excel functionality

3. **Enhanced Navigation**

   - Stack navigation for modal screens
   - Working "Add Payment" button on home screen
   - Smooth transitions between screens
   - Proper TypeScript navigation types

4. **Professional Design System**
   - Consistent color scheme and typography
   - Card-based layouts with shadows
   - Minimalist design with optimal spacing
   - Readable font sizes throughout the app

## Testing

Run the app on your Android device or emulator to test the current implementation. You should see:

### 🏠 **Home Screen:**

- Welcome message with current date
- Summary cards (currently showing ₹0)
- Working "Add Payment" button that navigates to the form
- Quick action buttons
- Recent transactions placeholder

### 📋 **History Screen:**

- Mock transaction data displayed
- Category-based filtering
- Total spending summary
- Export button (ready for implementation)

### ➕ **Add Payment Screen:**

- Amount input with number keyboard
- Description text area
- Category selection with visual feedback
- Save button with validation
- Success alerts when payment is saved

### 🎯 **Test the Navigation:**

1. Tap "Add Payment" on home screen → Should navigate to payment form
2. Fill the form and tap "Save Payment" → Should show success alert
3. Use bottom tabs to navigate between screens
4. Tap back button on Add Payment screen → Should return to home

---

Built with ❤️ using React Native and TypeScript

## Testing

Run the app on your Android device or emulator to test the current implementation. You should see a clean home screen with navigation tabs.

---

Built with ❤️ using React Native and TypeScript

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
