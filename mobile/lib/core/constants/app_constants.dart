import 'package:flutter/material.dart';

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
  static const Color bgDark = Color(0xFF0A0E21); // Dark Futuristic Background
  static const Color glassWhite = Color(0x33FFFFFF); // Glassmorphism White
  static const Color errorColor = Color(0xFFFF5252);
  static const Color successColor = Color(0xFF00E676);
  
  // Futuristic Styles (Simulated for UI usage)
  static const double glassBlur = 10.0;
  static const double glassOpacity = 0.2;
  static const double cardRadius = 24.0;
  
  // API
  // Mock server running on port 5001
  static const String baseUrl = 'http://localhost:5001/api/v1';
  // For Android emulator use: http://10.0.2.2:5001/api/v1
  // For iOS simulator use: http://localhost:5001/api/v1
  // For real device use: http://YOUR_COMPUTER_IP:5001/api/v1
  
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
