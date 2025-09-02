# SpendBook - Release v3.0.1

**🎉 Play Store Ready Release with Enhanced Security & Privacy**

## 📱 **Download**
- **Android APK**: [SpendBook-v3.0.1.apk](https://github.com/aRc-rAy/Batua/releases/download/v3.0.1/SpendBook-v3.0.1.apk)
- **Android App Bundle** (For Play Store): [SpendBook-v3.0.1.aab](https://github.com/aRc-rAy/Batua/releases/download/v3.0.1/SpendBook-v3.0.1.aab)

## 🆕 **What's New in v3.0.1**

### 🛡️ **Play Store Optimizations**
- Enhanced Google Play Protect compliance
- Improved SMS permission handling with clear privacy justification
- Secure ProGuard configuration for release builds
- Android App Bundle (AAB) support for Play Store

### 🔒 **Privacy & Security Enhancements**
- **SMS Privacy Protection**: Only reads messages from trusted financial institutions
- **Enhanced Permission Requests**: Clear explanations of why SMS access is needed
- **Backup Rules**: Secure data handling with privacy-first approach
- **Network Security**: Enforced HTTPS connections only

### 📊 **Features**
- **Manual Payment Entry**: Add payments with categories (food, travel, clothes, etc.)
- **SMS Auto-Detection**: Automatically detect bank transactions from SMS
- **Analytics Dashboard**: View spending trends with charts (7 days, 1 month, 3 months)
- **Category Breakdown**: Pie charts showing spending by category
- **Excel Export**: Export payment history to Excel files
- **Home Widget**: Quick view of daily/monthly totals
- **Minimalist Design**: Clean, professional interface with good typography

### 🏦 **Supported Banks & Services**
- Major Banks: HDFC, ICICI, SBI, Axis, Kotak, PNB, and more
- Digital Wallets: PayTM, GPay, PhonePe, Amazon Pay
- UPI Services: All major UPI providers
- Card Networks: Visa, Mastercard, RuPay, AmEx

## 🔧 **Technical Details**

### **System Requirements**
- Android 7.0 (API level 24) or higher
- 50 MB storage space
- SMS permission (optional, for auto-detection)

### **Permissions**
- `READ_SMS`: Only for automatic transaction detection from bank messages
- `WRITE_EXTERNAL_STORAGE`: For Excel export functionality
- `INTERNET`: For potential future features (currently not used)

### **Privacy Commitment**
- ✅ All data stays on your device
- ✅ No external servers or cloud storage
- ✅ Only reads SMS from verified financial institutions
- ✅ No personal messages accessed
- ✅ SMS detection can be disabled anytime

## 🐛 **Bug Fixes**
- Fixed ProGuard rules for better release builds
- Resolved backup rules lint errors
- Enhanced SMS parsing accuracy
- Improved app stability and performance

## 🚀 **Installation**

### **Option 1: Direct APK Install**
1. Download `app-release.apk`
2. Enable "Install from unknown sources" in Android settings
3. Install the APK file
4. Grant SMS permission when prompted (optional)

### **Option 2: Play Store (Coming Soon)**
- App will be available on Google Play Store soon
- Uses the same AAB file for official distribution

## 👨‍💻 **For Developers**

### **Building from Source**
```bash
# Clone the repository
git clone https://github.com/aRc-rAy/Batua.git
cd Batua

# Install dependencies
npm install

# Build release
cd android
./gradlew assembleRelease        # For APK
./gradlew bundleRelease          # For AAB (Play Store)
```

### **Play Store Deployment**
```bash
# Use the pre-configured secure build script
./create-play-store-build.bat
```

## 📞 **Support**
- **Issues**: [GitHub Issues](https://github.com/aRc-rAy/Batua/issues)
- **Privacy Policy**: [Privacy Policy](https://github.com/aRc-rAy/Batua/blob/main/PRIVACY_POLICY.md)
- **Source Code**: [GitHub Repository](https://github.com/aRc-rAy/Batua)

## 🤝 **Contributing**
Contributions are welcome! Please read our contributing guidelines and submit pull requests.

---

**Made with ❤️ using React Native | Privacy-First Financial Tracking**
