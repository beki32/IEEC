import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';

import 'firebase_options.dart';
import 'screens/bible_study_groups.dart';
import 'screens/g5_groups.dart';
import 'screens/login_screen.dart';
import 'screens/member_list_screen.dart';
import 'screens/minister_profile_screen.dart';
import 'screens/mobile_dashboard.dart';
import 'screens/new_comer_registration.dart';
import 'screens/team_chat_screen.dart';
import 'theme/app_theme.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  runApp(const IeecYaMobileApp());
}

class IeecYaMobileApp extends StatelessWidget {
  const IeecYaMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'IEEC YA Connect',
      debugShowCheckedModeBanner: false,
      theme: IeecTheme.light(),
      darkTheme: IeecTheme.dark(),
      home: StreamBuilder<User?>(
        stream: FirebaseAuth.instance.authStateChanges(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Scaffold(body: Center(child: CircularProgressIndicator()));
          }
          return snapshot.data == null ? const LoginScreen() : const MobileDashboard();
        },
      ),
      routes: {
        MemberListScreen.routeName: (_) => const MemberListScreen(),
        MinisterProfileScreen.routeName: (_) => const MinisterProfileScreen(),
        NewComerRegistration.routeName: (_) => const NewComerRegistration(),
        TeamChatScreen.routeName: (_) => const TeamChatScreen(),
        BibleStudyGroupsScreen.routeName: (_) => const BibleStudyGroupsScreen(),
        G5GroupsScreen.routeName: (_) => const G5GroupsScreen(),
      },
    );
  }
}
