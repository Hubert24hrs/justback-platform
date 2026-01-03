import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/providers/chat_provider.dart';
import '../../core/constants/app_constants.dart';
import '../../core/widgets/glass_box.dart';
import 'package:cached_network_image/cached_network_image.dart';

class ChatDetailScreen extends StatefulWidget {
  final Map<String, dynamic> conversation;

  const ChatDetailScreen({
    super.key,
    required this.conversation,
  });

  @override
  State<ChatDetailScreen> createState() => _ChatDetailScreenState();
}

class _ChatDetailScreenState extends State<ChatDetailScreen> {
  final _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      if (mounted) context.read<ChatProvider>().fetchMessages(widget.conversation['id']);
    });
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final otherUser = widget.conversation['otherUser'];
    final isAI = otherUser['id'] == 'ai_bot';
    final accentColor = isAI ? AppConstants.cyberBlue : AppConstants.primaryColor;

    return Scaffold(
      backgroundColor: const Color(0xFF03050C),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: Row(
          children: [
            CircleAvatar(
              radius: 18,
              backgroundColor: Colors.transparent,
              backgroundImage: otherUser['avatarUrl'] != null 
                ? CachedNetworkImageProvider(otherUser['avatarUrl'])
                : null,
              child: otherUser['avatarUrl'] == null
                  ? Icon(isAI ? Icons.smart_toy_rounded : Icons.person, color: accentColor)
                  : null,
            ),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  otherUser['fullName'],
                  style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                ),
                if (otherUser['isOnline'] == true)
                  const Text(
                    'Online',
                    style: TextStyle(color: AppConstants.primaryColor, fontSize: 12),
                  ),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.more_vert_rounded, color: Colors.white),
            onPressed: () {},
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: Consumer<ChatProvider>(
              builder: (context, chatProvider, child) {
                // Check if other person is typing
                final isTyping = chatProvider.isTyping(widget.conversation['id']);
                final messages = chatProvider.getMessages(widget.conversation['id']);

                if (chatProvider.isLoading && messages.isEmpty) {
                  return Center(child: CircularProgressIndicator(color: accentColor));
                }

                return ListView.builder(
                  controller: _scrollController,
                  reverse: true, // Start from bottom
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
                  itemCount: messages.length + (isTyping ? 1 : 0),
                  itemBuilder: (context, index) {
                    // Typing indicator is at index 0 because of reverse: true
                    if (isTyping && index == 0) {
                      return _buildTypingIndicator(accentColor);
                    }
                    
                    final msgIndex = isTyping ? index - 1 : index;
                    final msg = messages[msgIndex];
                    final isMe = msg['isMe'] ?? (msg['senderId'] == 'current_user_id');
                    
                    return _buildMessageBubble(msg['text'], isMe, accentColor);
                  },
                );
              },
            ),
          ),
          
          // Input Area
          _buildInputArea(accentColor),
        ],
      ),
    );
  }

  Widget _buildMessageBubble(String text, bool isMe, Color accentColor) {
    return Align(
      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: isMe 
            ? accentColor.withValues(alpha: 0.2) 
            : Colors.white.withValues(alpha: 0.05),
          border: Border.all(
            color: isMe ? accentColor.withValues(alpha: 0.5) : Colors.white.withValues(alpha: 0.1),
            width: 1,
          ),
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(20),
            topRight: const Radius.circular(20),
            bottomLeft: isMe ? const Radius.circular(20) : const Radius.circular(4),
            bottomRight: isMe ? const Radius.circular(4) : const Radius.circular(20),
          ),
          boxShadow: isMe ? [
            BoxShadow(
              color: accentColor.withValues(alpha: 0.1),
              blurRadius: 8,
              offset: const Offset(0, 2),
            )
          ] : null,
        ),
        child: Text(
          text,
          style: const TextStyle(color: Colors.white, fontSize: 15, height: 1.4),
        ),
      ),
    );
  }
  
  Widget _buildTypingIndicator(Color accentColor) {
      return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.05),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            SizedBox(
              width: 12,
              height: 12,
              child: CircularProgressIndicator(strokeWidth: 2, color: accentColor),
            ),
            const SizedBox(width: 8),
            const Text(
              'Typing...',
              style: TextStyle(color: Colors.white54, fontSize: 12),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInputArea(Color accentColor) {
    return GlassBox(
      borderRadius: 0, // Full width
      opacity: 0.05,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: SafeArea(
          child: Row(
            children: [
              IconButton(
                icon: const Icon(Icons.add_circle_outline_rounded, color: Colors.white54),
                onPressed: () {},
              ),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
                  ),
                  child: TextField(
                    controller: _messageController,
                    style: const TextStyle(color: Colors.white),
                    decoration: const InputDecoration(
                      hintText: 'Type a message...',
                      hintStyle: TextStyle(color: Colors.white38),
                      border: InputBorder.none,
                      contentPadding: EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Container(
                decoration: BoxDecoration(
                  color: accentColor,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(color: accentColor.withValues(alpha: 0.4), blurRadius: 10),
                  ],
                ),
                child: IconButton(
                  icon: const Icon(Icons.send_rounded, color: Colors.black, size: 20),
                  onPressed: _handleSend,
                ),
              ),
            ],
          ),
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

