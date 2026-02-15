import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';

class AppConstants {
  // App Info
  static const String appName = 'JustBack';
  static const String appVersion = '1.0.0';
  
  // Colors
  static const Color primaryColor = Color(0xFF00E676); // Neon Green
  static const Color secondaryColor = Color(0xFF1DE9B6); // Teal Neon
  static const Color accentColor = Color(0xFF00E5FF); // Cyber Blue
  static const Color cyberBlue = Color(0xFF00E5FF);
  static const Color neonGreen = Color(0xFF00E676);

  static const Color bgDark = Color(0xFF050510); // Standardized Deep Space Black
  static const Color bgDarker = Color(0xFF020205); // Darker shade for contrasts
  static const Color glassWhite = Color(0x33FFFFFF); // Glassmorphism White
  static const Color errorColor = Color(0xFFFF5252);
  static const Color successColor = Color(0xFF00E676);
  
  // Futuristic Styles (Simulated for UI usage)
  static const double glassBlur = 10.0;
  static const double glassOpacity = 0.2;
  static const double cardRadius = 24.0;
  
  // API
  // LOCAL TESTING: Using localhost via ADB reverse port forwarding
  // For production: change back to https://justback-backend-production.up.railway.app/api/v1
  static String get baseUrl {
    if (kIsWeb) return 'http://localhost:3000/api/v1';
    if (defaultTargetPlatform == TargetPlatform.android) return 'http://localhost:3000/api/v1';
    return 'http://localhost:3000/api/v1';
  }
  
  // Storage Keys
  static const String tokenKey = 'access_token';
  static const String refreshTokenKey = 'refresh_token';
  static const String userKey = 'user_data';
  
  // Validation
  static const int minPasswordLength = 8;
  static const String phoneRegex = r'^\+?[1-9]\d{1,14}$';
  
  // Pagination
  static const int pageSize = 20;
}
