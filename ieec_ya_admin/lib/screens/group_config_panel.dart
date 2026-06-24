import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';

import '../models/firestore_models.dart';

class GroupConfigPanel extends StatelessWidget {
  const GroupConfigPanel({super.key});

  Future<void> _updateTarget(MinistryTeam team, int delta) async {
    final nextSize = (team.targetGroupSize + delta).clamp(2, 20);
    final firestore = FirebaseFirestore.instance;
    final batch = firestore.batch();
    batch.update(firestore.collection('teams').doc(team.id), {'targetGroupSize': nextSize});
    final groups = await firestore.collection('g5_groups').where('teamId', isEqualTo: team.id).get();
    for (final group in groups.docs) {
      final currentCount = (group.data()['memberIds'] as List?)?.length ?? 0;
      batch.update(group.reference, {'maxCapacity': nextSize, 'currentMemberCount': currentCount});
    }
    await batch.commit();
  }

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<QuerySnapshot<Map<String, dynamic>>>(
      stream: FirebaseFirestore.instance.collection('teams').orderBy('name').snapshots(),
      builder: (context, snapshot) {
        if (!snapshot.hasData) return const Center(child: CircularProgressIndicator());
        final teams = snapshot.data!.docs.map((doc) => MinistryTeam.fromJson(doc.data())).toList();
        if (teams.isEmpty) return const Center(child: Text('Seed or create ministry teams to configure dynamic G-Groups.'));
        return ListView.separated(
          padding: const EdgeInsets.all(24),
          itemCount: teams.length,
          separatorBuilder: (_, __) => const SizedBox(height: 16),
          itemBuilder: (context, index) {
            final team = teams[index];
            return Card(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Text(team.name, style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800)),
                        const SizedBox(height: 8),
                        Text('All G-Groups in this team use this dynamic target capacity.'),
                      ]),
                    ),
                    IconButton.filledTonal(onPressed: () => _updateTarget(team, -1), icon: const Icon(Icons.remove)),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 18),
                      child: Column(children: [
                        Text('G${team.targetGroupSize}', style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w900)),
                        const Text('target size'),
                      ]),
                    ),
                    IconButton.filled(onPressed: () => _updateTarget(team, 1), icon: const Icon(Icons.add)),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }
}
