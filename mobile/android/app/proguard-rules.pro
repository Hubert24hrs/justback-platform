# Flutter wrapper
-keep class io.flutter.app.** { *; }
-keep class io.flutter.plugin.** { *; }
-keep class io.flutter.util.** { *; }
-keep class io.flutter.view.** { *; }
-keep class io.flutter.** { *; }
-keep class io.flutter.plugins.** { *; }

# Firebase
-keep class com.google.firebase.** { *; }

# Google Play Services
-keep class com.google.android.gms.** { *; }

# Paystack
-keep class co.paystack.android.** { *; }

# Handle missing classes in R8
-dontwarn com.google.android.play.core.**
-dontwarn com.google.android.gms.**
-dontwarn io.flutter.embedding.**

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep annotations
-keepattributes *Annotation*

# Exception handling
-keepattributes Exceptions
