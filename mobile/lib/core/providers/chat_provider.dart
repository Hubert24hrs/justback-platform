import 'dart:async';
import 'package:flutter/material.dart';
import '../services/socket_service.dart';
import '../services/api_client.dart';

class ChatProvider with ChangeNotifier {
  final SocketService _socketService = SocketService();
  final ApiClient _apiClient = ApiClient();

  List<dynamic> _conversations = [];
  final Map<String, List<dynamic>> _messagesCache = {};
  bool _isLoading = false;
  String? _error;
  
  // Typing states per conversation
  final Map<String, Map<String, bool>> _typingUsers = {};
  
  // Socket subscriptions
  StreamSubscription? _messageSubscription;
  StreamSubscription? _typingSubscription;
  StreamSubscription? _connectionSubscription;

  List<dynamic> get conversations => _conversations;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isSocketConnected => _socketService.isConnected;

  /// Check if any user is typing in a conversation
  bool isTyping(String convId) {
    final typingMap = _typingUsers[convId];
    if (typingMap == null) return false;
    return typingMap.values.any((isTyping) => isTyping);
  }

  /// Get list of typing user IDs
  List<String> getTypingUsers(String convId) {
    final typingMap = _typingUsers[convId];
    if (typingMap == null) return [];
    return typingMap.entries
        .where((e) => e.value)
        .map((e) => e.key)
        .toList();
  }

  List<dynamic> getMessages(String conversationId) {
    return _messagesCache[conversationId] ?? [];
  }

  /// Initialize socket connection
  void initSocket(String serverUrl, String? authToken) {
    _socketService.connect(serverUrl: serverUrl, authToken: authToken);
    _setupSocketListeners();
  }

  void _setupSocketListeners() {
    // Listen for new messages
    _messageSubscription = _socketService.onMessage.listen((data) {
      if (data['type'] == 'sent_confirmation') {
        _handleMessageSentConfirmation(data);
      } else if (data['type'] == 'read_receipt') {
        _handleReadReceipt(data);
      } else {
        _handleNewMessage(data);
      }
    });

    // Listen for typing indicators
    _typingSubscription = _socketService.onTyping.listen((data) {
      final convId = data['conversationId'];
      final userId = data['userId'];
      final isTyping = data['isTyping'] ?? false;

      _typingUsers.putIfAbsent(convId, () => {});
      _typingUsers[convId]![userId] = isTyping;
      notifyListeners();
    });

    // Listen for connection changes
    _connectionSubscription = _socketService.onConnectionChange.listen((connected) {
      notifyListeners();
      if (connected) {
        // Re-join conversations when reconnected
        for (var conv in _conversations) {
          _socketService.joinConversation(conv['id']);
        }
      }
    });
  }

  void _handleNewMessage(Map<String, dynamic> data) {
    final conversationId = data['conversationId'];
    
    // Add to messages cache
    if (!_messagesCache.containsKey(conversationId)) {
      _messagesCache[conversationId] = [];
    }
    
    // Check if message already exists (avoid duplicates)
    final exists = _messagesCache[conversationId]!.any((m) => m['id'] == data['id']);
    if (!exists) {
      _messagesCache[conversationId]!.insert(0, data);
      
      // Update conversation's last message
      final convIndex = _conversations.indexWhere((c) => c['id'] == conversationId);
      if (convIndex != -1) {
        _conversations[convIndex]['lastMessage'] = data['content'];
        _conversations[convIndex]['updatedAt'] = data['createdAt'];
      }
      
      notifyListeners();
    }
  }

  void _handleMessageSentConfirmation(Map<String, dynamic> data) {
    // Update temporary message with confirmed message
    final message = data['message'];
    final tempId = data['tempId'];
    final conversationId = message['conversationId'];
    
    if (_messagesCache.containsKey(conversationId)) {
      final index = _messagesCache[conversationId]!.indexWhere((m) => m['tempId'] == tempId);
      if (index != -1) {
        _messagesCache[conversationId]![index] = {
          ..._messagesCache[conversationId]![index],
          ...message,
          'status': 'sent',
        };
        notifyListeners();
      }
    }
  }

  void _handleReadReceipt(Map<String, dynamic> data) {
    final conversationId = data['conversationId'];
    final messageIds = List<String>.from(data['messageIds'] ?? []);
    
    if (_messagesCache.containsKey(conversationId)) {
      for (var msg in _messagesCache[conversationId]!) {
        if (messageIds.contains(msg['id'])) {
          msg['status'] = 'read';
          msg['readAt'] = data['readAt'];
        }
      }
      notifyListeners();
    }
  }

  /// Fetch conversations from API
  Future<void> fetchConversations() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiClient.getConversations();
      
      if (response['success'] == true) {
        _conversations = response['data']['conversations'] ?? [];
        
        // Join socket rooms for all conversations
        for (var conv in _conversations) {
          _socketService.joinConversation(conv['id']);
        }
      }
    } catch (e) {
      _error = e.toString();
      // Fallback to mock data for development
      _loadMockConversations();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Fetch messages for a conversation
  Future<void> fetchMessages(String conversationId) async {
    // If cached and socket connected, don't refetch
    if (_messagesCache.containsKey(conversationId) && _socketService.isConnected) {
      return;
    }

    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiClient.getMessages(conversationId);
      
      if (response['success'] == true) {
        _messagesCache[conversationId] = response['data']['messages'] ?? [];
      }
    } catch (e) {
      _error = e.toString();
      // Fallback to mock for development
      _loadMockMessages(conversationId);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Send a message (uses socket for real-time, API for persistence)
  Future<bool> sendMessage(String text, {required String conversationId}) async {
    final tempId = DateTime.now().millisecondsSinceEpoch.toString();
    
    // Optimistic update
    final newMessage = {
      'id': tempId,
      'tempId': tempId,
      'senderId': 'current_user_id',
      'content': text,
      'createdAt': DateTime.now().toIso8601String(),
      'isMe': true,
      'status': 'sending',
    };

    if (!_messagesCache.containsKey(conversationId)) {
      _messagesCache[conversationId] = [];
    }
    
    _messagesCache[conversationId]!.insert(0, newMessage);
    
    // Update conversation list
    final convIndex = _conversations.indexWhere((c) => c['id'] == conversationId);
    if (convIndex != -1) {
      _conversations[convIndex]['lastMessage'] = text;
      _conversations[convIndex]['updatedAt'] = DateTime.now().toIso8601String();
    }
    
    notifyListeners();

    // Send via socket for real-time delivery
    if (_socketService.isConnected) {
      _socketService.sendMessage(
        conversationId: conversationId,
        content: text,
        tempId: tempId,
      );
    }

    // Also persist via API
    try {
      await _apiClient.sendMessage({
        'conversationId': conversationId,
        'content': text,
        'messageType': 'TEXT',
      });
      return true;
    } catch (e) {
      // Mark as failed
      final index = _messagesCache[conversationId]!.indexWhere((m) => m['tempId'] == tempId);
      if (index != -1) {
        _messagesCache[conversationId]![index]['status'] = 'failed';
        notifyListeners();
      }
      return false;
    }
  }

  /// Start typing indicator
  void startTyping(String conversationId) {
    _socketService.startTyping(conversationId);
  }

  /// Stop typing indicator
  void stopTyping(String conversationId) {
    _socketService.stopTyping(conversationId);
  }

  /// Mark messages as read
  void markAsRead(String conversationId, List<String> messageIds) {
    _socketService.markMessagesRead(conversationId, messageIds);
  }

  /// Start a new conversation with a host
  Future<Map<String, dynamic>?> startConversation({
    required String hostId,
    String? propertyId,
    String? initialMessage,
  }) async {
    try {
      final response = await _apiClient.post('/chat/conversations', {
        'hostId': hostId,
        'propertyId': propertyId,
        'message': initialMessage,
      });
      
      final data = response.data as Map<String, dynamic>?;
      if (data != null && data['success'] == true) {
        final conversation = data['data']['conversation'];
        _conversations.insert(0, conversation);
        _socketService.joinConversation(conversation['id']);
        notifyListeners();
        return conversation;
      }
    } catch (e) {
      _error = e.toString();
    }
    return null;
  }

  // ==================== MOCK DATA ====================

  void _loadMockConversations() {
    if (_conversations.isEmpty) {
      _conversations = [
        {
          'id': 'conv_1',
          'otherUser': {
            'fullName': 'John Host',
            'id': 'host_1',
            'avatarUrl': 'https://i.pravatar.cc/150?u=host_1',
            'isOnline': true,
          },
          'lastMessage': 'Is the room available?',
          'unreadCount': 2,
          'updatedAt': DateTime.now().toIso8601String(),
        },
        {
          'id': 'conv_ai',
          'otherUser': {
            'fullName': 'JustBack AI',
            'id': 'ai_bot',
            'avatarUrl': null,
            'isOnline': true,
          },
          'lastMessage': 'I can help you find the best property!',
          'unreadCount': 0,
          'updatedAt': DateTime.now().subtract(const Duration(hours: 2)).toIso8601String(),
        }
      ];
    }
  }

  void _loadMockMessages(String conversationId) {
    if (conversationId == 'conv_1') {
      _messagesCache[conversationId] = [
        {'id': 'm1', 'senderId': 'user_1', 'content': 'Hi, is this available?', 'createdAt': DateTime.now().subtract(const Duration(hours: 1)).toIso8601String(), 'isMe': true, 'status': 'read'},
        {'id': 'm2', 'senderId': 'host_1', 'content': 'Yes, it is!', 'createdAt': DateTime.now().subtract(const Duration(minutes: 30)).toIso8601String(), 'isMe': false},
        {'id': 'm3', 'senderId': 'host_1', 'content': 'When are you planning to visit?', 'createdAt': DateTime.now().subtract(const Duration(minutes: 29)).toIso8601String(), 'isMe': false},
      ];
    } else {
      _messagesCache[conversationId] = [
        {'id': 'ai1', 'senderId': 'ai_bot', 'content': 'Hello! I am your AI assistant.', 'createdAt': DateTime.now().subtract(const Duration(days: 1)).toIso8601String(), 'isMe': false},
      ];
    }
  }

  @override
  void dispose() {
    _messageSubscription?.cancel();
    _typingSubscription?.cancel();
    _connectionSubscription?.cancel();
    super.dispose();
  }
}
