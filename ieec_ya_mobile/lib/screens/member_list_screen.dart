import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';

import '../models/firestore_models.dart';

class MemberListScreen extends StatefulWidget {
  const MemberListScreen({super.key});
  static const routeName = '/members';

  @override
  State<MemberListScreen> createState() => _MemberListScreenState();
}

class _MemberListScreenState extends State<MemberListScreen> {
  String _status = 'all';
  String _role = 'all';

  @override
  Widget build(BuildContext context) {
    Query<Map<String, dynamic>> query = FirebaseFirestore.instance.collection('users').orderBy('fullName');
    if (_status != 'all') query = query.where('status', isEqualTo: _status);
    if (_role != 'all') query = query.where('roles', arrayContains: _role);

    return Scaffold(
      appBar: AppBar(title: const Text('Member Directory')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Wrap(
              spacing: 12,
              runSpacing: 12,
              children: [
                DropdownMenu<String>(
                  label: const Text('Status'),
                  initialSelection: _status,
                  onSelected: (value) => setState(() => _status = value ?? 'all'),
                  dropdownMenuEntries: const [
                    DropdownMenuEntry(value: 'all', label: 'All'),
                    DropdownMenuEntry(value: 'new_comer', label: 'New Comer'),
                    DropdownMenuEntry(value: 'active_member', label: 'Active Member'),
                    DropdownMenuEntry(value: 'minister', label: 'Minister'),
                  ],
                ),
                DropdownMenu<String>(
                  label: const Text('Role'),
                  initialSelection: _role,
                  onSelected: (value) => setState(() => _role = value ?? 'all'),
                  dropdownMenuEntries: const [
                    DropdownMenuEntry(value: 'all', label: 'All'),
                    DropdownMenuEntry(value: 'head_leader', label: 'Head Leader'),
                    DropdownMenuEntry(value: 'core_team', label: 'Core Team'),
                    DropdownMenuEntry(value: 'team_leader', label: 'Team Leader'),
                    DropdownMenuEntry(value: 'minister', label: 'Minister'),
                    DropdownMenuEntry(value: 'member', label: 'Member'),
                  ],
                ),
              ],
            ),
          ),
          Expanded(
            child: StreamBuilder<QuerySnapshot<Map<String, dynamic>>>(
              stream: query.snapshots(),
              builder: (context, snapshot) {
                if (snapshot.hasError) return Center(child: Text('Unable to load members: ${snapshot.error}'));
                if (!snapshot.hasData) return const Center(child: CircularProgressIndicator());
                final members = snapshot.data!.docs.map((doc) => UserProfile.fromJson(doc.data())).toList();
                if (members.isEmpty) return const Center(child: Text('No members match these filters.'));
                return ListView.separated(
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
                  itemCount: members.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 10),
                  itemBuilder: (context, index) {
                    final member = members[index];
                    return Card(
                      child: ListTile(
                        leading: CircleAvatar(child: Text(member.fullName.isEmpty ? '?' : member.fullName[0].toUpperCase())),
                        title: Text(member.fullName),
                        subtitle: Text('${member.status} • ${member.roles.join(', ')}\nBible Study: ${member.bibleStudyGroupId.isEmpty ? 'Required' : member.bibleStudyGroupId}'),
                        isThreeLine: true,
                        trailing: const Icon(Icons.chevron_right),
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
