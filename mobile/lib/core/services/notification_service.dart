import 'dart:async';
import 'package:flutter/foundation.dart';
import 'api_client.dart';

/// Stub notification service (Firebase disabled for testing).
/// Replace with full FCM implementation when google-services.json is configured.
class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  NotificationService._internal();

  final ApiClient _apiClient = ApiClient();
  
  String? _fcmToken;
  bool _initialized = false;

  // Stream controllers for notification events (stubbed)
  final _notificationController = StreamController<Map<String, dynamic>>.broadcast();
  final _tokenRefreshController = StreamController<String>.broadcast();

  // Public streams
  Stream<Map<String, dynamic>> get onNotification => _notificationController.stream;
  Stream<String> get onTokenRefresh => _tokenRefreshController.stream;
  
  String? get fcmToken => _fcmToken;
  bool get isInitialized => _initialized;

  /// Initialize notification service (stub - Firebase disabled)
  Future<void> initialize() async {
    if (_initialized) return;

    try {
      debugPrint('NotificationService: ⚠️ Firebase disabled - using stub implementation');
      
      // Generate a placeholder token for testing
      _fcmToken = 'stub_token_${DateTime.now().millisecondsSinceEpoch}';
      
      _initialized = true;
      debugPrint('NotificationService: ✅ Stub initialized');
    } catch (e) {
      debugPrint('NotificationService: ❌ Error: $e');
    }
  }

  /// Register device token with backend (stub)
  Future<void> registerDevice(String userId) async {
    if (_fcmToken == null) return;
    
    try {
      debugPrint('NotificationService: Registering device for user $userId (stub)');
      // In production, this would register with the backend
    } catch (e) {
      debugPrint('NotificationService: Error registering device: $e');
    }
  }

  /// Unregister device from backend
  Future<void> unregisterDevice() async {
    try {
      debugPrint('NotificationService: Unregistering device (stub)');
      _fcmToken = null;
    } catch (e) {
      debugPrint('NotificationService: Error unregistering device: $e');
    }
  }

  /// Subscribe to a topic (stub)
  Future<void> subscribeToTopic(String topic) async {
    debugPrint('NotificationService: Subscribe to topic "$topic" (stub)');
  }

  /// Unsubscribe from a topic (stub)
  Future<void> unsubscribeFromTopic(String topic) async {
    debugPrint('NotificationService: Unsubscribe from topic "$topic" (stub)');
  }

  /// Handle incoming notification data
  void handleNotification(Map<String, dynamic> data) {
    debugPrint('NotificationService: Received notification: $data');
    _notificationController.add(data);
  }

  /// Clean up resources
  void dispose() {
    _notificationController.close();
    _tokenRefreshController.close();
  }
}
