import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/providers/chat_provider.dart';
import 'package:intl/intl.dart';

class ChatListScreen extends StatefulWidget {
  const ChatListScreen({Key? key}) : super(key: key);

  @override
  State<ChatListScreen> createState() => _ChatListScreenState();
}

class _ChatListScreenState extends State<ChatListScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => context.read<ChatProvider>().fetchConversations());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Messages'),
      ),
      body: Consumer<ChatProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (provider.conversations.isEmpty) {
            return const Center(child: Text('No messages yet'));
          }

          return ListView.separated(
            itemCount: provider.conversations.length,
            separatorBuilder: (context, index) => const Divider(height: 1),
            itemBuilder: (context, index) {
              final conv = provider.conversations[index];
              return ListTile(
                leading: CircleAvatar(
                  backgroundColor: Colors.grey[200],
                  child: Text(conv['otherUser']['fullName'][0]),
                ),
                title: Text(conv['otherUser']['fullName']),
                subtitle: Text(
                  conv['lastMessage'],
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                trailing: Text(
                  DateFormat('HH:mm').format(DateTime.parse(conv['updatedAt'])),
                  style: const TextStyle(fontSize: 12, color: Colors.grey),
                ),
                onTap: () {
                  Navigator.pushNamed(
                    context,
                    '/chat-detail',
                    arguments: conv,
                  );
                },
              );
            },
          );
        },
      ),
    );
  }
}
