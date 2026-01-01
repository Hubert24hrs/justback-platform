import 'package:flutter/material.dart';
import '../services/api_client.dart';

class ChatProvider with ChangeNotifier {
  final ApiClient _apiClient = ApiClient();

  List<dynamic> _conversations = [];
  List<dynamic> _messages = [];
  bool _isLoading = false;
  String? _error;

  List<dynamic> get conversations => _conversations;
  List<dynamic> get messages => _messages;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchConversations() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      // Mocking for now as backend chat is not yet ready
      _conversations = [
        {
          'id': 'conv_1',
          'otherUser': {'fullName': 'John Host', 'id': 'host_1'},
          'lastMessage': 'Is the room available?',
          'updatedAt': DateTime.now().toIso8601String(),
        }
      ];
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchMessages(String conversationId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      // Mock messages
      _messages = [
        {'id': 'm1', 'senderId': 'user_1', 'text': 'Hi, is this available?', 'createdAt': DateTime.now().subtract(const Duration(hours: 1)).toIso8601String()},
        {'id': 'm2', 'senderId': 'host_1', 'text': 'Yes, it is!', 'createdAt': DateTime.now().subtract(const Duration(minutes: 30)).toIso8601String()},
      ];
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> sendMessage(String text, {String? conversationId, String? recipientId}) async {
    // Implement sending logic
    _messages.add({
      'id': DateTime.now().toString(),
      'senderId': 'current_user_id',
      'text': text,
      'createdAt': DateTime.now().toIso8601String(),
    });
    notifyListeners();
    return true;
  }
}
