import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;

/// Service for managing real-time Socket.io connections.
/// Handles messaging, typing indicators, and presence updates.
class SocketService {
  static final SocketService _instance = SocketService._internal();
  factory SocketService() => _instance;
  SocketService._internal();

  io.Socket? _socket;
  // ignore: unused_field
  String? _authToken; // Kept for future use with token refresh
  bool _isConnected = false;

  // Stream controllers for real-time events
  final _messageController = StreamController<Map<String, dynamic>>.broadcast();
  final _typingController = StreamController<Map<String, dynamic>>.broadcast();
  final _presenceController = StreamController<Map<String, dynamic>>.broadcast();
  final _connectionController = StreamController<bool>.broadcast();

  // Public streams
  Stream<Map<String, dynamic>> get onMessage => _messageController.stream;
  Stream<Map<String, dynamic>> get onTyping => _typingController.stream;
  Stream<Map<String, dynamic>> get onPresence => _presenceController.stream;
  Stream<bool> get onConnectionChange => _connectionController.stream;

  bool get isConnected => _isConnected;

  /// Initialize socket connection with auth token
  void connect({required String serverUrl, String? authToken}) {
    if (_socket != null && _isConnected) {
      debugPrint('SocketService: Already connected');
      return;
    }

    _authToken = authToken;
    
    debugPrint('SocketService: Connecting to $serverUrl');

    _socket = io.io(
      serverUrl,
      io.OptionBuilder()
          .setTransports(['websocket'])
          .setAuth({'token': authToken ?? ''})
          .enableAutoConnect()
          .enableReconnection()
          .setReconnectionAttempts(5)
          .setReconnectionDelay(1000)
          .build(),
    );

    _setupEventListeners();
  }

  void _setupEventListeners() {
    _socket?.onConnect((_) {
      debugPrint('SocketService: ✅ Connected');
      _isConnected = true;
      _connectionController.add(true);
    });

    _socket?.onDisconnect((_) {
      debugPrint('SocketService: ❌ Disconnected');
      _isConnected = false;
      _connectionController.add(false);
    });

    _socket?.onConnectError((error) {
      debugPrint('SocketService: Connection error: $error');
      _isConnected = false;
      _connectionController.add(false);
    });

    _socket?.onReconnect((_) {
      debugPrint('SocketService: 🔄 Reconnected');
      _isConnected = true;
      _connectionController.add(true);
    });

    // ==================== MESSAGE EVENTS ====================
    
    _socket?.on('new_message', (data) {
      debugPrint('SocketService: New message received');
      _messageController.add(Map<String, dynamic>.from(data));
    });

    _socket?.on('message_sent', (data) {
      debugPrint('SocketService: Message sent confirmation');
      _messageController.add({
        'type': 'sent_confirmation',
        ...Map<String, dynamic>.from(data),
      });
    });

    _socket?.on('messages_read', (data) {
      debugPrint('SocketService: Messages read');
      _messageController.add({
        'type': 'read_receipt',
        ...Map<String, dynamic>.from(data),
      });
    });

    // ==================== TYPING EVENTS ====================

    _socket?.on('user_typing', (data) {
      _typingController.add(Map<String, dynamic>.from(data));
    });

    // ==================== PRESENCE EVENTS ====================

    _socket?.on('presence_update', (data) {
      _presenceController.add(Map<String, dynamic>.from(data));
    });

    _socket?.on('user_joined', (data) {
      _presenceController.add({
        'type': 'joined',
        ...Map<String, dynamic>.from(data),
      });
    });

    _socket?.on('user_left', (data) {
      _presenceController.add({
        'type': 'left',
        ...Map<String, dynamic>.from(data),
      });
    });

    // ==================== ERROR HANDLING ====================

    _socket?.on('error', (data) {
      debugPrint('SocketService: Error: $data');
    });
  }

  // ==================== CONVERSATION METHODS ====================

  /// Join a conversation room
  void joinConversation(String conversationId) {
    debugPrint('SocketService: Joining conversation $conversationId');
    _socket?.emit('join_conversation', conversationId);
  }

  /// Leave a conversation room
  void leaveConversation(String conversationId) {
    debugPrint('SocketService: Leaving conversation $conversationId');
    _socket?.emit('leave_conversation', conversationId);
  }

  // ==================== MESSAGING METHODS ====================

  /// Send a message in real-time
  void sendMessage({
    required String conversationId,
    required String content,
    String? tempId,
    String messageType = 'TEXT',
    String? attachmentUrl,
  }) {
    _socket?.emit('send_message', {
      'conversationId': conversationId,
      'content': content,
      'tempId': tempId ?? DateTime.now().millisecondsSinceEpoch.toString(),
      'messageType': messageType,
      'attachmentUrl': attachmentUrl,
    });
  }

  /// Mark messages as read
  void markMessagesRead(String conversationId, List<String> messageIds) {
    _socket?.emit('mark_read', {
      'conversationId': conversationId,
      'messageIds': messageIds,
    });
  }

  // ==================== TYPING METHODS ====================

  /// Start typing indicator
  void startTyping(String conversationId) {
    _socket?.emit('typing_start', {'conversationId': conversationId});
  }

  /// Stop typing indicator
  void stopTyping(String conversationId) {
    _socket?.emit('typing_stop', {'conversationId': conversationId});
  }

  // ==================== PRESENCE METHODS ====================

  /// Update user presence
  void updatePresence(String status) {
    _socket?.emit('update_presence', {'status': status});
  }

  // ==================== CLEANUP ====================

  /// Disconnect socket
  void disconnect() {
    debugPrint('SocketService: Disconnecting');
    _socket?.disconnect();
    _socket?.dispose();
    _socket = null;
    _isConnected = false;
  }

  /// Dispose all resources
  void dispose() {
    disconnect();
    _messageController.close();
    _typingController.close();
    _presenceController.close();
    _connectionController.close();
  }
}
