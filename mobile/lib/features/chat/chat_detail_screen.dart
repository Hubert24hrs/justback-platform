import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/providers/chat_provider.dart';
import '../../core/constants/app_constants.dart';

class ChatDetailScreen extends StatefulWidget {
  final Map<String, dynamic> conversation;

  const ChatDetailScreen({
    Key? key,
    required this.conversation,
  }) : super(key: key);

  @override
  State<ChatDetailScreen> createState() => _ChatDetailScreenState();
}

class _ChatDetailScreenState extends State<ChatDetailScreen> {
  final _messageController = TextEditingController();

  @override
  void initState() {
    super.initState();
    Future.microtask(() =>
        context.read<ChatProvider>().fetchMessages(widget.conversation['id']));
  }

  @override
  void dispose() {
    _messageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.conversation['otherUser']['fullName']),
      ),
      body: Column(
        children: [
          Expanded(
            child: Consumer<ChatProvider>(
              builder: (context, provider, child) {
                return ListView.builder(
                  reverse: false, // For simplicity now
                  padding: const EdgeInsets.all(16),
                  itemCount: provider.messages.length,
                  itemBuilder: (context, index) {
                    final msg = provider.messages[index];
                    final isMe = msg['senderId'] != widget.conversation['otherUser']['id'];
                    return _buildMessageBubble(msg['text'], isMe);
                  },
                );
              },
            ),
          ),
          _buildMessageInput(),
        ],
      ),
    );
  }

  Widget _buildMessageBubble(String text, bool isMe) {
    return Align(
      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 4),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: isMe ? AppConstants.primaryColor : Colors.grey[200],
          borderRadius: BorderRadius.circular(20).copyWith(
            bottomRight: isMe ? Radius.zero : const Radius.circular(20),
            bottomLeft: !isMe ? Radius.zero : const Radius.circular(20),
          ),
        ),
        child: Text(
          text,
          style: TextStyle(color: isMe ? Colors.white : Colors.black87),
        ),
      ),
    );
  }

  Widget _buildMessageInput() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            offset: const Offset(0, -2),
            blurRadius: 10,
          ),
        ],
      ),
      child: SafeArea(
        child: Row(
          children: [
            Expanded(
              child: TextField(
                controller: _messageController,
                decoration: InputDecoration(
                  hintText: 'Type a message...',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(30),
                    borderSide: BorderSide.none,
                  ),
                  filled: true,
                  fillColor: Colors.grey[100],
                  contentPadding: const EdgeInsets.symmetric(horizontal: 20),
                ),
              ),
            ),
            const SizedBox(width: 8),
            CircleAvatar(
              backgroundColor: AppConstants.primaryColor,
              child: IconButton(
                icon: const Icon(Icons.send, color: Colors.white, size: 20),
                onPressed: _handleSend,
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _handleSend() {
    if (_messageController.text.trim().isEmpty) return;
    context.read<ChatProvider>().sendMessage(
          _messageController.text.trim(),
          conversationId: widget.conversation['id'],
        );
    _messageController.clear();
  }
}
