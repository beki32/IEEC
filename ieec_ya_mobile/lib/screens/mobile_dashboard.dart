import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

import '../models/firestore_models.dart';
import 'bible_study_groups.dart';
import 'g5_groups.dart';
import 'member_list_screen.dart';
import 'minister_profile_screen.dart';
import 'new_comer_registration.dart';
import 'team_chat_screen.dart';

class MobileDashboard extends StatelessWidget {
  const MobileDashboard({super.key});

  Future<UserProfile?> _profile() async {
    final uid = FirebaseAuth.instance.currentUser?.uid;
    if (uid == null) return null;
    final doc = await FirebaseFirestore.instance.collection('users').doc(uid).get();
    return doc.exists ? UserProfile.fromJson(doc.data()!) : null;
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<UserProfile?>(
      future: _profile(),
      builder: (context, snapshot) {
        final profile = snapshot.data;
        final actions = <_DashboardAction>[
          const _DashboardAction('Bible Study', Icons.menu_book, BibleStudyGroupsScreen.routeName, true),
          const _DashboardAction('G-Groups', Icons.hub, G5GroupsScreen.routeName, true),
          const _DashboardAction('Team Chat', Icons.forum, TeamChatScreen.routeName, true),
          const _DashboardAction('My Ministry Profile', Icons.badge, MinisterProfileScreen.routeName, true),
          _DashboardAction('Members', Icons.people_alt, MemberListScreen.routeName, profile?.isLeader ?? false),
          _DashboardAction('Register New Comer', Icons.person_add_alt_1, NewComerRegistration.routeName, profile?.isLeader ?? false),
        ].where((action) => action.visible).toList();

        return Scaffold(
          appBar: AppBar(
            title: const Text('IEEC YA Connect'),
            actions: [
              IconButton(
                tooltip: 'Sign out',
                onPressed: () => FirebaseAuth.instance.signOut(),
                icon: const Icon(Icons.logout),
              ),
            ],
          ),
          body: RefreshIndicator(
            onRefresh: () async => (context as Element).markNeedsBuild(),
            child: CustomScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              slivers: [
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(20, 12, 20, 8),
                    child: Card(
                      child: Padding(
                        padding: const EdgeInsets.all(22),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Welcome${profile == null ? '' : ', ${profile.fullName.split(' ').first}'}', style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800)),
                            const SizedBox(height: 8),
                            Text('Roles: ${(profile?.roles.isEmpty ?? true) ? 'member' : profile!.roles.join(', ')}'),
                            const SizedBox(height: 4),
                            Text('Bible Study: ${(profile?.bibleStudyGroupId.isEmpty ?? true) ? 'Assignment required' : profile!.bibleStudyGroupId}'),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
                SliverPadding(
                  padding: const EdgeInsets.all(20),
                  sliver: SliverGrid.builder(
                    itemCount: actions.length,
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      mainAxisSpacing: 14,
                      crossAxisSpacing: 14,
                      childAspectRatio: 1.05,
                    ),
                    itemBuilder: (context, index) {
                      final action = actions[index];
                      return Card(
                        child: InkWell(
                          borderRadius: BorderRadius.circular(24),
                          onTap: () => Navigator.pushNamed(context, action.route),
                          child: Padding(
                            padding: const EdgeInsets.all(18),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Icon(action.icon, size: 34, color: Theme.of(context).colorScheme.primary),
                                Text(action.title, style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800)),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _DashboardAction {
  const _DashboardAction(this.title, this.icon, this.route, this.visible);
  final String title;
  final IconData icon;
  final String route;
  final bool visible;
}
