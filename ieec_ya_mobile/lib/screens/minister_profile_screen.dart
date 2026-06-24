import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

import '../models/firestore_models.dart';

class MinisterProfileScreen extends StatelessWidget {
  const MinisterProfileScreen({super.key});
  static const routeName = '/minister-profile';

  @override
  Widget build(BuildContext context) {
    final uid = FirebaseAuth.instance.currentUser?.uid;
    if (uid == null) return const Scaffold(body: Center(child: Text('Please sign in.')));

    return DefaultTabController(
      length: 3,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Ministry Profile'),
          bottom: const TabBar(tabs: [Tab(text: 'Groups'), Tab(text: 'Tasks'), Tab(text: 'Giving')]),
        ),
        body: TabBarView(
          children: [
            _GroupsTab(uid: uid),
            _TasksTab(uid: uid),
            _GivingTab(uid: uid),
          ],
        ),
      ),
    );
  }
}

class _GroupsTab extends StatelessWidget {
  const _GroupsTab({required this.uid});
  final String uid;

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<DocumentSnapshot<Map<String, dynamic>>>(
      stream: FirebaseFirestore.instance.collection('users').doc(uid).snapshots(),
      builder: (context, snapshot) {
        if (!snapshot.hasData) return const Center(child: CircularProgressIndicator());
        if (!snapshot.data!.exists) return const Center(child: Text('Profile not found.'));
        final profile = UserProfile.fromJson(snapshot.data!.data()!);
        return ListView(
          padding: const EdgeInsets.all(16),
          children: [
            _InfoCard(title: 'Bible Study Group', value: profile.bibleStudyGroupId.isEmpty ? 'Mandatory assignment pending' : profile.bibleStudyGroupId, icon: Icons.menu_book),
            _InfoCard(title: 'Dynamic G-Group', value: profile.g5GroupId.isEmpty ? 'Team G-Group assignment pending' : profile.g5GroupId, icon: Icons.hub),
            _InfoCard(title: 'Assigned Teams', value: profile.assignedTeams.isEmpty ? 'No team assignments yet' : profile.assignedTeams.join(', '), icon: Icons.groups),
          ],
        );
      },
    );
  }
}

class _TasksTab extends StatelessWidget {
  const _TasksTab({required this.uid});
  final String uid;

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<QuerySnapshot<Map<String, dynamic>>>(
      stream: FirebaseFirestore.instance.collection('tasks').where('assignedTo', isEqualTo: uid).snapshots(),
      builder: (context, snapshot) {
        if (!snapshot.hasData) return const Center(child: CircularProgressIndicator());
        final tasks = snapshot.data!.docs;
        if (tasks.isEmpty) return const Center(child: Text('No open tasks assigned.'));
        return ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: tasks.length,
          itemBuilder: (context, index) {
            final task = tasks[index].data();
            return Card(
              child: ListTile(
                leading: const Icon(Icons.task_alt),
                title: Text(task['title']?.toString() ?? 'Untitled task'),
                subtitle: Text(task['status']?.toString() ?? 'pending'),
              ),
            );
          },
        );
      },
    );
  }
}

class _GivingTab extends StatelessWidget {
  const _GivingTab({required this.uid});
  final String uid;

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<QuerySnapshot<Map<String, dynamic>>>(
      stream: FirebaseFirestore.instance.collection('contributions').where('userId', isEqualTo: uid).orderBy('monthYear', descending: true).snapshots(),
      builder: (context, snapshot) {
        if (!snapshot.hasData) return const Center(child: CircularProgressIndicator());
        final contributions = snapshot.data!.docs.map((doc) => Contribution.fromJson(doc.data())).toList();
        if (contributions.isEmpty) return const Center(child: Text('No contribution history yet.'));
        return ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: contributions.length,
          itemBuilder: (context, index) {
            final contribution = contributions[index];
            final color = switch (contribution.status) {
              'paid' => Colors.green,
              'failed' => Colors.red,
              _ => Colors.orange,
            };
            return Card(
              child: ListTile(
                leading: Icon(Icons.payments, color: color),
                title: Text('${contribution.monthYear} • \$${contribution.amount.toStringAsFixed(2)}'),
                subtitle: Text('Status: ${contribution.status} • Auto-pay: ${contribution.autoPay ? 'on' : 'off'}'),
                trailing: contribution.receipts.isEmpty ? null : const Icon(Icons.receipt_long),
              ),
            );
          },
        );
      },
    );
  }
}

class _InfoCard extends StatelessWidget {
  const _InfoCard({required this.title, required this.value, required this.icon});
  final String title;
  final String value;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: Icon(icon, color: Theme.of(context).colorScheme.primary),
        title: Text(title),
        subtitle: Text(value),
      ),
    );
  }
}
