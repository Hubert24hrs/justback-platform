import 'package:flutter/material.dart';
import '../services/api_client.dart';
import 'dart:async';

class ChatProvider with ChangeNotifier {
  final ApiClient _apiClient = ApiClient();

  List<dynamic> _conversations = [];
  Map<String, List<dynamic>> _messagesCache = {}; // Cache messages by conv ID
  bool _isLoading = false;
  String? _error;
  
  // Typing simulation
  bool _isTyping = false;
  String? _typingConversationId;

  List<dynamic> get conversations => _conversations;
  bool get isLoading => _isLoading;
  String? get error => _error;
  
  bool isTyping(String convId) => _isTyping && _typingConversationId == convId;

  List<dynamic> getMessages(String conversationId) {
    return _messagesCache[conversationId] ?? [];
  }

  Future<void> fetchConversations() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      // SMART MOCK: Simulate network delay
      await Future.delayed(const Duration(milliseconds: 800));

      if (_conversations.isEmpty) {
        _conversations = [
          {
            'id': 'conv_1',
            'otherUser': {
              'fullName': 'John Host', 
              'id': 'host_1',
              'avatarUrl': 'https://i.pravatar.cc/150?u=host_1', // Mock Avatar
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
              'avatarUrl': null, // AI icon
              'isOnline': true,
            },
            'lastMessage': 'I can help you find the best property!',
            'unreadCount': 0,
            'updatedAt': DateTime.now().subtract(const Duration(hours: 2)).toIso8601String(),
          }
        ];
      }
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchMessages(String conversationId) async {
    // If cached, don't load again (for mock)
    if (_messagesCache.containsKey(conversationId)) return;

    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await Future.delayed(const Duration(milliseconds: 600));

      // Mock messages specific to conversations
      if (conversationId == 'conv_1') {
        _messagesCache[conversationId] = [
          {'id': 'm1', 'senderId': 'user_1', 'text': 'Hi, is this available?', 'createdAt': DateTime.now().subtract(const Duration(hours: 1)).toIso8601String(), 'isMe': true},
          {'id': 'm2', 'senderId': 'host_1', 'text': 'Yes, it is!', 'createdAt': DateTime.now().subtract(const Duration(minutes: 30)).toIso8601String(), 'isMe': false},
          {'id': 'm3', 'senderId': 'host_1', 'text': 'When are you planning to visit?', 'createdAt': DateTime.now().subtract(const Duration(minutes: 29)).toIso8601String(), 'isMe': false},
        ];
      } else {
         _messagesCache[conversationId] = [
          {'id': 'ai1', 'senderId': 'ai_bot', 'text': 'Hello! I am your AI assistant.', 'createdAt': DateTime.now().subtract(const Duration(days: 1)).toIso8601String(), 'isMe': false},
        ];
      }
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> sendMessage(String text, {required String conversationId}) async {
    // Optimistic Update
    final newMessage = {
      'id': DateTime.now().toString(),
      'senderId': 'current_user_id',
      'text': text,
      'createdAt': DateTime.now().toIso8601String(),
      'isMe': true,
    };

    if (!_messagesCache.containsKey(conversationId)) {
      _messagesCache[conversationId] = [];
    }
    
    _messagesCache[conversationId]!.insert(0, newMessage); // Add to top (newest first)
    
    // Update last message in conversation list
    final convIndex = _conversations.indexWhere((c) => c['id'] == conversationId);
    if (convIndex != -1) {
      _conversations[convIndex]['lastMessage'] = text;
      _conversations[convIndex]['updatedAt'] = DateTime.now().toIso8601String();
    }
    
    notifyListeners();

    // Simulate Echo/Reply
    _simulateReply(conversationId);

    return true;
  }

  void _simulateReply(String conversationId) {
    if (conversationId == 'conv_ai') return; // Specific logic for AI later

    // 1. Typing indicator
    Future.delayed(const Duration(seconds: 2), () {
      _isTyping = true;
      _typingConversationId = conversationId;
      notifyListeners();

      // 2. Message received
      Future.delayed(const Duration(seconds: 3), () {
        _isTyping = false;
        _typingConversationId = null;

        final reply = {
          'id': DateTime.now().toString(),
          'senderId': 'host_1',
          'text': 'That sounds great! Let me know if you need anything else.',
          'createdAt': DateTime.now().toIso8601String(),
          'isMe': false,
        };

        _messagesCache[conversationId]!.insert(0, reply);
        
        // Update convo
         final convIndex = _conversations.indexWhere((c) => c['id'] == conversationId);
          if (convIndex != -1) {
            _conversations[convIndex]['lastMessage'] = reply['text'];
            _conversations[convIndex]['updatedAt'] = DateTime.now().toIso8601String();
          }

        notifyListeners();
      });
    });
  }
}
