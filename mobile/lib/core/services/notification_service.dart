import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'api_client.dart';

/// Service for handling Firebase Cloud Messaging (FCM) push notifications.
class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  NotificationService._internal();

  final FirebaseMessaging _messaging = FirebaseMessaging.instance;
  final ApiClient _apiClient = ApiClient();
  
  String? _fcmToken;
  bool _initialized = false;

  // Stream controllers for notification events
  final _notificationController = StreamController<RemoteMessage>.broadcast();
  final _tokenRefreshController = StreamController<String>.broadcast();

  // Public streams
  Stream<RemoteMessage> get onNotification => _notificationController.stream;
  Stream<String> get onTokenRefresh => _tokenRefreshController.stream;
  
  String? get fcmToken => _fcmToken;
  bool get isInitialized => _initialized;

  /// Initialize FCM and request permissions
  Future<void> initialize() async {
    if (_initialized) return;

    try {
      // Request notification permissions
      final settings = await _messaging.requestPermission(
        alert: true,
        badge: true,
        sound: true,
        provisional: false,
        announcement: false,
        carPlay: false,
        criticalAlert: false,
      );

      debugPrint('NotificationService: Permission status: ${settings.authorizationStatus}');

      if (settings.authorizationStatus == AuthorizationStatus.authorized ||
          settings.authorizationStatus == AuthorizationStatus.provisional) {
        
        // Get FCM token
        await _getToken();
        
        // Listen for token refresh
        _messaging.onTokenRefresh.listen(_handleTokenRefresh);
        
        // Setup message handlers
        _setupMessageHandlers();
        
        _initialized = true;
        debugPrint('NotificationService: ✅ Initialized successfully');
      } else {
        debugPrint('NotificationService: ❌ Notification permission denied');
      }
    } catch (e) {
      debugPrint('NotificationService: Error initializing: $e');
    }
  }

  /// Get FCM token and register with backend
  Future<String?> _getToken() async {
    try {
      _fcmToken = await _messaging.getToken();
      debugPrint('NotificationService: FCM Token: ${_fcmToken?.substring(0, 20)}...');
      
      if (_fcmToken != null) {
        await _registerTokenWithBackend(_fcmToken!);
      }
      
      return _fcmToken;
    } catch (e) {
      debugPrint('NotificationService: Error getting token: $e');
      return null;
    }
  }

  void _handleTokenRefresh(String newToken) async {
    debugPrint('NotificationService: Token refreshed');
    _fcmToken = newToken;
    _tokenRefreshController.add(newToken);
    await _registerTokenWithBackend(newToken);
  }

  /// Register token with backend
  Future<void> _registerTokenWithBackend(String token) async {
    try {
      await _apiClient.registerDevice(token);
      debugPrint('NotificationService: Token registered with backend');
    } catch (e) {
      debugPrint('NotificationService: Error registering token: $e');
    }
  }

  /// Setup foreground/background message handlers
  void _setupMessageHandlers() {
    // Foreground messages
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      debugPrint('NotificationService: Foreground message received');
      _handleMessage(message);
    });

    // Background message tap (when app is in background but not terminated)
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      debugPrint('NotificationService: Message opened app from background');
      _handleNotificationTap(message);
    });

    // Check if app was opened from a terminated state via notification
    _checkInitialMessage();
  }

  void _checkInitialMessage() async {
    final initialMessage = await _messaging.getInitialMessage();
    if (initialMessage != null) {
      debugPrint('NotificationService: App opened from terminated state');
      _handleNotificationTap(initialMessage);
    }
  }

  void _handleMessage(RemoteMessage message) {
    _notificationController.add(message);
    
    // Show local notification for foreground messages
    final notification = message.notification;
    if (notification != null) {
      debugPrint('NotificationService: Title: ${notification.title}');
      debugPrint('NotificationService: Body: ${notification.body}');
      
      // You can show a local notification here using flutter_local_notifications
      // For now, we just emit to the stream
    }
  }

  void _handleNotificationTap(RemoteMessage message) {
    final data = message.data;
    debugPrint('NotificationService: Notification tapped with data: $data');
    
    // Handle deep linking based on notification type
    final type = data['type'];
    final id = data['id'];
    
    // Emit to stream for UI to handle navigation
    _notificationController.add(message);
    
    // Deep link handling can be done by the app
    // Example: navigating to a specific screen based on type
  }

  /// Subscribe to topic for group notifications
  Future<void> subscribeToTopic(String topic) async {
    await _messaging.subscribeToTopic(topic);
    debugPrint('NotificationService: Subscribed to topic: $topic');
  }

  /// Unsubscribe from topic
  Future<void> unsubscribeFromTopic(String topic) async {
    await _messaging.unsubscribeFromTopic(topic);
    debugPrint('NotificationService: Unsubscribed from topic: $topic');
  }

  /// Get notification settings
  Future<NotificationSettings> getSettings() async {
    return await _messaging.getNotificationSettings();
  }

  /// Unregister device from backend
  Future<void> unregister() async {
    if (_fcmToken != null) {
      try {
        await _apiClient.unregisterDevice(_fcmToken!);
        debugPrint('NotificationService: Device unregistered');
      } catch (e) {
        debugPrint('NotificationService: Error unregistering: $e');
      }
    }
  }

  /// Dispose resources
  void dispose() {
    _notificationController.close();
    _tokenRefreshController.close();
  }
}

/// Background message handler (must be top-level function)
@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  debugPrint('Background message received: ${message.messageId}');
  // Handle background message
  // Note: You cannot use Provider or other context-dependent code here
}
