import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';

class BibleStudyGroupsScreen extends StatelessWidget {
  const BibleStudyGroupsScreen({super.key});
  static const routeName = '/bible-study-groups';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Bible Study Groups')),
      body: StreamBuilder<QuerySnapshot<Map<String, dynamic>>>(
        stream: FirebaseFirestore.instance.collection('bible_study_groups').orderBy('name').snapshots(),
        builder: (context, snapshot) {
          if (snapshot.hasError) return Center(child: Text('Unable to load Bible Study groups: ${snapshot.error}'));
          if (!snapshot.hasData) return const Center(child: CircularProgressIndicator());
          final groups = snapshot.data!.docs;
          if (groups.isEmpty) {
            return const Center(child: Text('Bible Study is mandatory for all members. No groups configured yet.'));
          }
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: groups.length,
            itemBuilder: (context, index) {
              final group = groups[index].data();
              final members = (group['memberIds'] as List?)?.length ?? 0;
              return Card(
                child: ListTile(
                  leading: const Icon(Icons.menu_book),
                  title: Text(group['name']?.toString() ?? groups[index].id),
                  subtitle: Text('Leader: ${group['leaderId'] ?? 'Unassigned'} • Members: $members'),
                  trailing: const Chip(label: Text('Required')),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
