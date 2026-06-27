import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

class AdminDashboard extends StatelessWidget {
  const AdminDashboard({super.key});

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<User?>(
      stream: FirebaseAuth.instance.authStateChanges(),
      builder: (context, authSnapshot) {
        final user = authSnapshot.data;
        if (user == null) {
          return const _SignedOutPanel();
        }

        return StreamBuilder<DocumentSnapshot<Map<String, dynamic>>>(
          stream: FirebaseFirestore.instance.collection('users').doc(user.uid).snapshots(),
          builder: (context, profileSnapshot) {
            if (profileSnapshot.hasError) {
              return _ErrorPanel(
                title: 'Unable to verify admin profile',
                error: profileSnapshot.error,
              );
            }

            if (!profileSnapshot.hasData) {
              return const Center(child: CircularProgressIndicator());
            }

            if (!profileSnapshot.data!.exists) {
              return _MissingProfilePanel(user: user);
            }

            final profile = profileSnapshot.data!.data() ?? {};
            final roles = (profile['roles'] as List? ?? []).map((role) => role.toString()).toSet();
            if (!roles.contains('head_leader') && !roles.contains('core_team')) {
              return _ErrorPanel(
                title: 'Admin role required',
                error: 'Your /users/${user.uid} profile exists, but roles are ${roles.toList()}. Add head_leader or core_team.',
              );
            }

            return const _DashboardMetrics();
          },
        );
      },
    );
  }
}

class _DashboardMetrics extends StatelessWidget {
  const _DashboardMetrics();

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<QuerySnapshot<Map<String, dynamic>>>(
      stream: FirebaseFirestore.instance.collection('users').snapshots(),
      builder: (context, usersSnapshot) {
        if (usersSnapshot.hasError) {
          return _ErrorPanel(
            title: 'Unable to load user profiles',
            error: usersSnapshot.error,
          );
        }

        return StreamBuilder<QuerySnapshot<Map<String, dynamic>>>(
          stream: FirebaseFirestore.instance.collection('new_comers').snapshots(),
          builder: (context, newComerSnapshot) {
            if (newComerSnapshot.hasError) {
              return _ErrorPanel(
                title: 'Unable to load follow-up pipeline',
                error: newComerSnapshot.error,
              );
            }

            final users = usersSnapshot.data?.docs.map((doc) => doc.data()).toList() ?? [];
            final newComers = newComerSnapshot.data?.docs.map((doc) => doc.data()).toList() ?? [];
            final ministers = users.where((user) => (user['roles'] as List? ?? []).contains('minister')).length;
            final leaders = users.where((user) {
              final roles = (user['roles'] as List? ?? []).map((role) => role.toString());
              return roles.any({'head_leader', 'core_team', 'team_leader'}.contains);
            }).length;
            final needsBibleStudy = users.where((user) => (user['bibleStudyGroupId']?.toString().isEmpty ?? true)).length;
            return SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Wrap(
                    spacing: 16,
                    runSpacing: 16,
                    children: [
                      _MetricCard(label: 'Active Profiles', value: users.length.toString(), icon: Icons.people),
                      _MetricCard(label: 'Ministers', value: ministers.toString(), icon: Icons.volunteer_activism),
                      _MetricCard(label: 'Leaders', value: leaders.toString(), icon: Icons.workspace_premium),
                      _MetricCard(label: 'Bible Study Pending', value: needsBibleStudy.toString(), icon: Icons.menu_book),
                      _MetricCard(label: 'New Comers', value: newComers.length.toString(), icon: Icons.person_add),
                    ],
                  ),
                  const SizedBox(height: 24),
                  LayoutBuilder(
                    builder: (context, constraints) {
                      final wide = constraints.maxWidth > 900;
                      final panels = [
                        _Panel(
                          title: 'Leadership hierarchy',
                          child: Column(
                            children: const [
                              _HierarchyTile('Head Leader', 'Global oversight and override access'),
                              _HierarchyTile('Core Team', 'Operational governance and reporting'),
                              _HierarchyTile('Team Leaders', 'Team care, G-Groups, and follow-up'),
                              _HierarchyTile('Members / Ministers', 'Bible Study, service, and contribution tracking'),
                            ],
                          ),
                        ),
                        _Panel(
                          title: 'Workflow lifecycle',
                          child: Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: const [
                              Chip(label: Text('Register')),
                              Chip(label: Text('Assign follow-up')),
                              Chip(label: Text('Weekly updates')),
                              Chip(label: Text('Active member')),
                              Chip(label: Text('Bible Study')),
                              Chip(label: Text('Team/G-Group')),
                            ],
                          ),
                        ),
                      ];
                      if (wide) {
                        return Row(crossAxisAlignment: CrossAxisAlignment.start, children: panels.map((panel) => Expanded(child: Padding(padding: const EdgeInsets.only(right: 16), child: panel))).toList());
                      }
                      return Column(children: panels.map((panel) => Padding(padding: const EdgeInsets.only(bottom: 16), child: panel)).toList());
                    },
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }
}

class _SignedOutPanel extends StatelessWidget {
  const _SignedOutPanel();

  @override
  Widget build(BuildContext context) {
    return const _InfoPanel(
      icon: Icons.admin_panel_settings,
      title: 'Sign in required',
      message: 'Use the Admin sign in button in the top-right before loading protected ministry data.',
    );
  }
}

class _MissingProfilePanel extends StatelessWidget {
  const _MissingProfilePanel({required this.user});
  final User user;

  @override
  Widget build(BuildContext context) {
    return _InfoPanel(
      icon: Icons.person_off,
      title: 'Firestore profile missing',
      message: 'You signed in as ${user.email ?? user.uid}, but /users/${user.uid} does not exist. Create that document with roles: [head_leader].',
    );
  }
}

class _InfoPanel extends StatelessWidget {
  const _InfoPanel({
    required this.icon,
    required this.title,
    required this.message,
  });

  final IconData icon;
  final String title;
  final String message;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 720),
        child: Card(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(icon, color: Theme.of(context).colorScheme.primary, size: 40),
                const SizedBox(height: 12),
                Text(title, style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800)),
                const SizedBox(height: 8),
                Text(message),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _MetricCard extends StatelessWidget {
  const _MetricCard({required this.label, required this.value, required this.icon});
  final String label;
  final String value;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 210,
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Icon(icon, color: Theme.of(context).colorScheme.primary),
            const SizedBox(height: 16),
            Text(value, style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.w900)),
            Text(label),
          ]),
        ),
      ),
    );
  }
}

class _ErrorPanel extends StatelessWidget {
  const _ErrorPanel({required this.title, required this.error});
  final String title;
  final Object? error;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 720),
        child: Card(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(Icons.error_outline, color: Theme.of(context).colorScheme.error, size: 36),
                const SizedBox(height: 12),
                Text(title, style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800)),
                const SizedBox(height: 8),
                Text(error?.toString() ?? 'Unknown Firestore error'),
                const SizedBox(height: 12),
                const Text('If this says permission-denied, confirm your Firebase Auth UID has a matching /users/{uid} document with roles: [head_leader].'),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _Panel extends StatelessWidget {
  const _Panel({required this.title, required this.child});
  final String title;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(title, style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800)),
          const SizedBox(height: 14),
          child,
        ]),
      ),
    );
  }
}

class _HierarchyTile extends StatelessWidget {
  const _HierarchyTile(this.title, this.subtitle);
  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) => ListTile(title: Text(title), subtitle: Text(subtitle), leading: const Icon(Icons.account_tree));
}
