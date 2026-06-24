import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';

class FollowUpDashboard extends StatelessWidget {
  const FollowUpDashboard({super.key});

  static const _columns = {
    'registered': 'Registered',
    'contacted': 'Contacted',
    'in_follow_up': 'Weekly Updates',
    'active_member': 'Active Member',
  };

  Future<void> _advance(DocumentReference<Map<String, dynamic>> ref, String status) async {
    final next = switch (status) {
      'registered' => 'contacted',
      'contacted' => 'in_follow_up',
      'in_follow_up' => 'active_member',
      _ => status,
    };
    await ref.update({'status': next, 'currentStep': next});
    await ref.collection('follow_up_updates').add({
      'leaderId': 'system',
      'updateText': 'Status moved from $status to $next.',
      'date': FieldValue.serverTimestamp(),
      'outcome': next,
    });
  }

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<QuerySnapshot<Map<String, dynamic>>>(
      stream: FirebaseFirestore.instance.collection('new_comers').snapshots(),
      builder: (context, snapshot) {
        if (!snapshot.hasData) return const Center(child: CircularProgressIndicator());
        final docs = snapshot.data!.docs;
        return SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          scrollDirection: Axis.horizontal,
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: _columns.entries.map((entry) {
              final items = docs.where((doc) => (doc.data()['status'] ?? 'registered') == entry.key).toList();
              return SizedBox(
                width: 310,
                child: Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(entry.value, style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800)),
                        const SizedBox(height: 12),
                        ...items.map((doc) {
                          final data = doc.data();
                          return Card(
                            color: Theme.of(context).colorScheme.surfaceContainerHighest,
                            child: ListTile(
                              title: Text(data['fullName']?.toString() ?? doc.id),
                              subtitle: Text('Leader: ${data['assignedLeaderId'] ?? 'Unassigned'}\nStep: ${data['currentStep'] ?? entry.key}'),
                              isThreeLine: true,
                              trailing: IconButton(
                                tooltip: 'Advance',
                                onPressed: entry.key == 'active_member' ? null : () => _advance(doc.reference, entry.key),
                                icon: const Icon(Icons.arrow_forward),
                              ),
                            ),
                          );
                        }),
                        if (items.isEmpty) const Padding(padding: EdgeInsets.all(20), child: Text('No cards')),
                      ],
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        );
      },
    );
  }
}
