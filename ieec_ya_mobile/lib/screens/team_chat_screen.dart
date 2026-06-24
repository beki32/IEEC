import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

import '../models/firestore_models.dart';

class TeamChatScreen extends StatefulWidget {
  const TeamChatScreen({super.key});
  static const routeName = '/team-chat';

  @override
  State<TeamChatScreen> createState() => _TeamChatScreenState();
}

class _TeamChatScreenState extends State<TeamChatScreen> {
  final _message = TextEditingController();
  String? _selectedChatId;
  UserProfile? _profile;

  @override
  void dispose() {
    _message.dispose();
    super.dispose();
  }

  Future<UserProfile?> _loadProfile() async {
    if (_profile != null) return _profile;
    final uid = FirebaseAuth.instance.currentUser?.uid;
    if (uid == null) return null;
    final doc = await FirebaseFirestore.instance.collection('users').doc(uid).get();
    if (!doc.exists) return null;
    _profile = UserProfile.fromJson(doc.data()!);
    return _profile;
  }

  Query<Map<String, dynamic>> _chatQuery(UserProfile profile) {
    final query = FirebaseFirestore.instance.collection('team_chats');
    if (profile.isStaff) return query.orderBy('teamId');
    return query.where('allowedMemberIds', arrayContains: profile.uid);
  }

  Future<void> _send() async {
    final chatId = _selectedChatId;
    final profile = _profile;
    final text = _message.text.trim();
    if (chatId == null || profile == null || text.isEmpty) return;
    await FirebaseFirestore.instance.collection('team_chats').doc(chatId).collection('chat_messages').add({
      'senderId': profile.uid,
      'senderName': profile.fullName,
      'text': text,
      'timestamp': FieldValue.serverTimestamp(),
    });
    _message.clear();
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<UserProfile?>(
      future: _loadProfile(),
      builder: (context, profileSnapshot) {
        final profile = profileSnapshot.data;
        if (profile == null) return const Scaffold(body: Center(child: CircularProgressIndicator()));
        return Scaffold(
          appBar: AppBar(title: const Text('Team Chat')),
          body: StreamBuilder<QuerySnapshot<Map<String, dynamic>>>(
            stream: _chatQuery(profile).snapshots(),
            builder: (context, chatSnapshot) {
              if (!chatSnapshot.hasData) return const Center(child: CircularProgressIndicator());
              final chats = chatSnapshot.data!.docs.map((doc) => TeamChat.fromJson(doc.data())).toList();
              if (chats.isEmpty) return const Center(child: Text('No team chat access yet.'));
              _selectedChatId ??= chats.first.id;
              return Column(
                children: [
                  SizedBox(
                    height: 76,
                    child: ListView.separated(
                      padding: const EdgeInsets.all(12),
                      scrollDirection: Axis.horizontal,
                      itemBuilder: (context, index) {
                        final chat = chats[index];
                        final selected = chat.id == _selectedChatId;
                        return ChoiceChip(
                          selected: selected,
                          label: Text(chat.teamId),
                          onSelected: (_) => setState(() => _selectedChatId = chat.id),
                        );
                      },
                      separatorBuilder: (_, __) => const SizedBox(width: 8),
                      itemCount: chats.length,
                    ),
                  ),
                  Expanded(child: _Messages(chatId: _selectedChatId!)),
                  SafeArea(
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: Row(
                        children: [
                          Expanded(child: TextField(controller: _message, decoration: const InputDecoration(hintText: 'Write a ministry update...'))),
                          const SizedBox(width: 8),
                          IconButton.filled(onPressed: _send, icon: const Icon(Icons.send)),
                        ],
                      ),
                    ),
                  ),
                ],
              );
            },
          ),
        );
      },
    );
  }
}

class _Messages extends StatelessWidget {
  const _Messages({required this.chatId});
  final String chatId;

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<QuerySnapshot<Map<String, dynamic>>>(
      stream: FirebaseFirestore.instance.collection('team_chats').doc(chatId).collection('chat_messages').orderBy('timestamp', descending: true).limit(100).snapshots(),
      builder: (context, snapshot) {
        if (!snapshot.hasData) return const Center(child: CircularProgressIndicator());
        final messages = snapshot.data!.docs.map((doc) => ChatMessage.fromJson(doc.data())).toList();
        return ListView.builder(
          reverse: true,
          padding: const EdgeInsets.all(16),
          itemCount: messages.length,
          itemBuilder: (context, index) {
            final message = messages[index];
            final mine = message.senderId == FirebaseAuth.instance.currentUser?.uid;
            return Align(
              alignment: mine ? Alignment.centerRight : Alignment.centerLeft,
              child: Card(
                color: mine ? Theme.of(context).colorScheme.primaryContainer : null,
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(message.senderName, style: Theme.of(context).textTheme.labelMedium),
                      const SizedBox(height: 4),
                      Text(message.text),
                    ],
                  ),
                ),
              ),
            );
          },
        );
      },
    );
  }
}
