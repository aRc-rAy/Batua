# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# React Native ProGuard rules
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.soloader.** { *; }
-keepattributes SourceFile,LineNumberTable
-keepattributes *Annotation*

# SMS reading functionality
-keep class android.provider.Telephony$** { *; }

# Keep payment tracker specific classes
-keep class com.spendbook.** { *; }

# Keep SQLite classes
-keep class net.sqlcipher.** { *; }
-keep class org.sqlite.** { *; }

# Keep vector icons
-keep class com.oblador.vectoricons.** { *; }

# Keep React Native gesture handler
-keep class com.swmansion.gesturehandler.** { *; }

# General Android optimizations
-optimizationpasses 5
-dontusemixedcaseclassnames
-dontskipnonpubliclibraryclasses
-dontpreverify
-verbose

# Remove logging in release builds for security
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
    public static *** i(...);
}

# Keep line numbers for crash reports
-renamesourcefileattribute SourceFile
-keepattributes SourceFile,LineNumberTable
