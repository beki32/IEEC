import 'package:cloud_firestore/cloud_firestore.dart';

class MockDataBootstrapper {
  static const initialHeadLeaderUid = 'M7gdLL39oXbULvAzlj0Z4ufNeI43';

  static Future<void> seed(FirebaseFirestore firestore) async {
    final batch = firestore.batch();
    final now = DateTime.now();

    final teams = [
      {'id': 'worship', 'name': 'Worship Team', 'targetGroupSize': 5},
      {'id': 'welcome', 'name': 'Welcome Team', 'targetGroupSize': 4},
      {'id': 'media', 'name': 'Media Team', 'targetGroupSize': 7},
    ];

    for (final team in teams) {
      batch.set(firestore.collection('teams').doc(team['id'] as String), {
        ...team,
        'createdAt': Timestamp.fromDate(now),
      });
    }

    final users = [
      _user(initialHeadLeaderUid, 'IEEC Head Leader', 'admin@ieec.test', ['head_leader', 'team_leader'], ['worship'], 'bs-foundations', 'worship-g1'),
      _user('core-001', 'Miriam Bekele', 'miriam@ieec.test', ['core_team'], ['welcome'], 'bs-foundations', 'welcome-g1'),
      _user('core-002', 'Yonatan Alemu', 'yonatan@ieec.test', ['core_team', 'team_leader'], ['media'], 'bs-leaders', 'media-g1'),
      _user('leader-001', 'Sara Dawit', 'sara@ieec.test', ['team_leader', 'minister'], ['worship'], 'bs-leaders', 'worship-g1'),
      _user('leader-002', 'Nahom Girma', 'nahom@ieec.test', ['team_leader', 'minister'], ['welcome'], 'bs-leaders', 'welcome-g1'),
      _user('leader-003', 'Liya Samuel', 'liya@ieec.test', ['team_leader', 'minister'], ['media'], 'bs-leaders', 'media-g1'),
      _user('minister-001', 'Dina Kebede', 'dina@ieec.test', ['minister', 'member'], ['worship', 'media'], 'bs-foundations', 'worship-g1'),
      _user('minister-002', 'Caleb Desta', 'caleb@ieec.test', ['minister', 'member'], ['welcome'], 'bs-foundations', 'welcome-g1'),
      _user('minister-003', 'Ruth Henok', 'ruth@ieec.test', ['minister', 'member'], ['media'], 'bs-foundations', 'media-g1'),
      _user('minister-004', 'Eden Solomon', 'eden@ieec.test', ['minister', 'member'], ['worship'], 'bs-foundations', 'worship-g1'),
      _user('minister-005', 'Bereket Tadesse', 'bereket@ieec.test', ['minister', 'member'], ['welcome', 'media'], 'bs-foundations', 'welcome-g1'),
    ];

    for (final user in users) {
      batch.set(firestore.collection('users').doc(user['uid'] as String), user);
    }

    final groups = [
      _group('worship-g1', 'Worship G5 Alpha', 'worship', 'leader-001', 5, [initialHeadLeaderUid, 'leader-001', 'minister-001', 'minister-004']),
      _group('welcome-g1', 'Welcome G4 Alpha', 'welcome', 'leader-002', 4, ['core-001', 'leader-002', 'minister-002', 'minister-005']),
      _group('media-g1', 'Media G7 Alpha', 'media', 'leader-003', 7, ['core-002', 'leader-003', 'minister-001', 'minister-003', 'minister-005']),
    ];
    for (final group in groups) {
      batch.set(firestore.collection('g5_groups').doc(group['id'] as String), group);
    }

    final bibleGroups = [
      _bibleGroup('bs-foundations', 'Foundations Bible Study', 'core-001', users.map((u) => u['uid'] as String).where((id) => id != 'core-002').toList()),
      _bibleGroup('bs-leaders', 'Leadership Bible Study', initialHeadLeaderUid, ['core-002', 'leader-001', 'leader-002', 'leader-003']),
    ];
    for (final group in bibleGroups) {
      batch.set(firestore.collection('bible_study_groups').doc(group['id'] as String), group);
    }

    for (final team in teams) {
      final teamId = team['id'] as String;
      final allowed = users.where((user) => (user['assignedTeams'] as List).contains(teamId)).map((user) => user['uid'] as String).toList();
      batch.set(firestore.collection('team_chats').doc('$teamId-chat'), {
        'id': '$teamId-chat',
        'teamId': teamId,
        'allowedMemberIds': allowed,
      });
      batch.set(firestore.collection('team_chats').doc('$teamId-chat').collection('chat_messages').doc('welcome'), {
        'senderId': 'system',
        'senderName': 'IEEC YA Connect',
        'text': 'Welcome to the private ${team['name']} chat.',
        'timestamp': FieldValue.serverTimestamp(),
      });
    }

    final months = ['2026-04', '2026-05', '2026-06'];
    for (final user in users.where((user) => (user['roles'] as List).contains('minister'))) {
      for (final month in months) {
        final id = '${user['uid']}-$month';
        batch.set(firestore.collection('contributions').doc(id), {
          'id': id,
          'userId': user['uid'],
          'amount': 25.00,
          'monthYear': month,
          'status': month == '2026-06' ? 'pending' : 'paid',
          'autoPay': true,
          'paidDate': month == '2026-06' ? null : Timestamp.fromDate(now),
          'receipts': month == '2026-06' ? [] : ['receipt://$id'],
        });
      }
    }

    final newComers = [
      {'id': 'new-001', 'fullName': 'Hana Worku', 'phone': '+251911000001', 'email': 'hana@example.test', 'status': 'registered', 'assignedLeaderId': 'leader-001', 'currentStep': 'assign_follow_up_leader'},
      {'id': 'new-002', 'fullName': 'Robel Fikru', 'phone': '+251911000002', 'email': 'robel@example.test', 'status': 'contacted', 'assignedLeaderId': 'leader-002', 'currentStep': 'weekly_updates'},
      {'id': 'new-003', 'fullName': 'Mekdes Tola', 'phone': '+251911000003', 'email': 'mekdes@example.test', 'status': 'in_follow_up', 'assignedLeaderId': 'leader-003', 'currentStep': 'weekly_updates'},
    ];
    for (final newComer in newComers) {
      batch.set(firestore.collection('new_comers').doc(newComer['id'] as String), newComer);
      batch.set(firestore.collection('new_comers').doc(newComer['id'] as String).collection('follow_up_updates').doc('initial'), {
        'leaderId': newComer['assignedLeaderId'],
        'updateText': 'Initial follow-up record created during mock seed.',
        'date': FieldValue.serverTimestamp(),
        'outcome': newComer['status'],
      });
    }

    final placeholders = [
      'people',
      'members',
      'ministers',
      'leadership_roles',
      'team_members',
      'team_responsibilities',
      'attendance',
      'tasks',
      'reports',
      'events',
      'notifications',
    ];
    for (final collection in placeholders) {
      batch.set(firestore.collection(collection).doc('_placeholder'), {
        'collection': collection,
        'description': 'Reserved IEEC YA Connect extension collection.',
        'createdAt': FieldValue.serverTimestamp(),
      });
    }

    await batch.commit();
  }

  static Map<String, dynamic> _user(String uid, String fullName, String email, List<String> roles, List<String> teams, String bibleStudyGroupId, String g5GroupId) => {
        'uid': uid,
        'fullName': fullName,
        'email': email,
        'phone': '+251900000000',
        'gender': 'not_specified',
        'dateOfBirth': Timestamp.fromDate(DateTime(1998, 1, 1)),
        'address': 'Addis Ababa',
        'status': roles.contains('minister') ? 'minister' : 'active_member',
        'firstVisitDate': Timestamp.fromDate(DateTime(2024, 1, 7)),
        'notes': 'Seeded profile for live pipeline testing.',
        'emergencyContact': '+251900000001',
        'spiritualGrowthStatus': 'active_bible_study',
        'roles': roles,
        'assignedTeams': teams,
        'bibleStudyGroupId': bibleStudyGroupId,
        'g5GroupId': g5GroupId,
      };

  static Map<String, dynamic> _group(String id, String name, String teamId, String leaderId, int maxCapacity, List<String> memberIds) => {
        'id': id,
        'name': name,
        'teamId': teamId,
        'leaderId': leaderId,
        'maxCapacity': maxCapacity,
        'memberIds': memberIds,
        'currentMemberCount': memberIds.length,
      };

  static Map<String, dynamic> _bibleGroup(String id, String name, String leaderId, List<String> memberIds) => {
        'id': id,
        'name': name,
        'leaderId': leaderId,
        'memberIds': memberIds,
        'mandatoryFor': ['member', 'minister'],
      };
}
