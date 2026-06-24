import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';

import '../models/firestore_models.dart';

class G5GroupsScreen extends StatelessWidget {
  const G5GroupsScreen({super.key});
  static const routeName = '/g5-groups';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Dynamic G-Groups')),
      body: StreamBuilder<QuerySnapshot<Map<String, dynamic>>>(
        stream: FirebaseFirestore.instance.collection('g5_groups').orderBy('teamId').snapshots(),
        builder: (context, snapshot) {
          if (snapshot.hasError) return Center(child: Text('Unable to load G-Groups: ${snapshot.error}'));
          if (!snapshot.hasData) return const Center(child: CircularProgressIndicator());
          final groups = snapshot.data!.docs.map((doc) => G5Group.fromJson(doc.data())).toList();
          if (groups.isEmpty) return const Center(child: Text('No G-Groups configured yet.'));
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: groups.length,
            itemBuilder: (context, index) {
              final group = groups[index];
              final percent = group.maxCapacity == 0 ? 0.0 : (group.currentMemberCount / group.maxCapacity).clamp(0.0, 1.0);
              return Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(child: Text(group.name, style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold))),
                          Chip(label: Text('G${group.maxCapacity}')),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text('Team: ${group.teamId} • Leader: ${group.leaderId}'),
                      const SizedBox(height: 12),
                      LinearProgressIndicator(value: percent),
                      const SizedBox(height: 6),
                      Text('${group.currentMemberCount}/${group.maxCapacity} members allocated'),
                    ],
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
