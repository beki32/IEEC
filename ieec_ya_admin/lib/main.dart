import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';

import 'firebase_options.dart';
import 'screens/admin_dashboard.dart';
import 'screens/follow_up_dashboard.dart';
import 'screens/group_config_panel.dart';
import 'screens/monthly_contributions_ledger.dart';
import 'screens/reports_screen.dart';
import 'services/mock_data_bootstrapper.dart';
import 'theme/app_theme.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  runApp(const IeecYaAdminApp());
}

class IeecYaAdminApp extends StatelessWidget {
  const IeecYaAdminApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'IEEC YA Admin',
      debugShowCheckedModeBanner: false,
      theme: IeecTheme.light(),
      darkTheme: IeecTheme.dark(),
      home: const AdminShell(),
    );
  }
}

class AdminShell extends StatefulWidget {
  const AdminShell({super.key});

  @override
  State<AdminShell> createState() => _AdminShellState();
}

class _AdminShellState extends State<AdminShell> {
  int _index = 0;
  final _screens = const [
    AdminDashboard(),
    GroupConfigPanel(),
    FollowUpDashboard(),
    MonthlyContributionsLedger(),
    ReportsScreen(),
  ];

  Future<void> _ensureAdminSession(BuildContext context) async {
    if (FirebaseAuth.instance.currentUser != null) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Sign in with Firebase Auth before accessing protected production data.')),
    );
  }

  @override
  Widget build(BuildContext context) {
    final labels = ['Dashboard', 'Groups', 'Follow-up', 'Ledger', 'Reports'];
    return Scaffold(
      body: Row(
        children: [
          NavigationRail(
            extended: MediaQuery.sizeOf(context).width > 1050,
            selectedIndex: _index,
            onDestinationSelected: (value) async {
              await _ensureAdminSession(context);
              setState(() => _index = value);
            },
            destinations: const [
              NavigationRailDestination(icon: Icon(Icons.dashboard_outlined), selectedIcon: Icon(Icons.dashboard), label: Text('Dashboard')),
              NavigationRailDestination(icon: Icon(Icons.tune), selectedIcon: Icon(Icons.tune), label: Text('Groups')),
              NavigationRailDestination(icon: Icon(Icons.view_kanban_outlined), selectedIcon: Icon(Icons.view_kanban), label: Text('Follow-up')),
              NavigationRailDestination(icon: Icon(Icons.receipt_long_outlined), selectedIcon: Icon(Icons.receipt_long), label: Text('Ledger')),
              NavigationRailDestination(icon: Icon(Icons.analytics_outlined), selectedIcon: Icon(Icons.analytics), label: Text('Reports')),
            ],
          ),
          const VerticalDivider(width: 1),
          Expanded(
            child: Column(
              children: [
                _AdminTopBar(title: labels[_index]),
                Expanded(child: _screens[_index]),
              ],
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () async {
          if (FirebaseAuth.instance.currentUser == null) {
            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Sign in as a Head Leader or Core Team admin before seeding.')));
            return;
          }
          try {
            await MockDataBootstrapper.seed(FirebaseFirestore.instance);
          } on FirebaseException catch (error) {
            if (!context.mounted) return;
            ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(error.message ?? 'Unable to seed mock data.')));
            return;
          }
          if (!context.mounted) return;
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Mock IEEC YA data seeded.')));
        },
        icon: const Icon(Icons.cloud_upload),
        label: const Text('Seed mock data'),
      ),
    );
  }
}

class _AdminTopBar extends StatelessWidget {
  const _AdminTopBar({required this.title});
  final String title;

  Future<void> _showAdminLogin(BuildContext context) async {
    final emailController = TextEditingController();
    final passwordController = TextEditingController();
    final formKey = GlobalKey<FormState>();
    var loading = false;

    await showDialog<void>(
      context: context,
      builder: (dialogContext) {
        return StatefulBuilder(
          builder: (context, setState) {
            return AlertDialog(
              title: const Text('Admin sign in'),
              content: Form(
                key: formKey,
                child: SizedBox(
                  width: 380,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      TextFormField(
                        controller: emailController,
                        keyboardType: TextInputType.emailAddress,
                        decoration: const InputDecoration(labelText: 'Email'),
                        validator: (value) => value != null && value.contains('@') ? null : 'Enter a valid email',
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: passwordController,
                        obscureText: true,
                        decoration: const InputDecoration(labelText: 'Password'),
                        validator: (value) => (value?.length ?? 0) >= 6 ? null : 'Password must be at least 6 characters',
                      ),
                    ],
                  ),
                ),
              ),
              actions: [
                TextButton(onPressed: loading ? null : () => Navigator.pop(dialogContext), child: const Text('Cancel')),
                FilledButton.icon(
                  onPressed: loading
                      ? null
                      : () async {
                          if (!formKey.currentState!.validate()) return;
                          setState(() => loading = true);
                          try {
                            await FirebaseAuth.instance.signInWithEmailAndPassword(
                              email: emailController.text.trim(),
                              password: passwordController.text,
                            );
                            if (dialogContext.mounted) Navigator.pop(dialogContext);
                          } on FirebaseAuthException catch (error) {
                            if (!context.mounted) return;
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(content: Text(error.message ?? 'Unable to sign in.')),
                            );
                          } finally {
                            if (context.mounted) setState(() => loading = false);
                          }
                        },
                  icon: loading ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2)) : const Icon(Icons.login),
                  label: const Text('Sign in'),
                ),
              ],
            );
          },
        );
      },
    );

    emailController.dispose();
    passwordController.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      decoration: BoxDecoration(color: Theme.of(context).colorScheme.surface, boxShadow: const [BoxShadow(color: Color(0x11000000), blurRadius: 12)]),
      child: Row(
        children: [
          Expanded(child: Text(title, style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800))),
          StreamBuilder<User?>(
            stream: FirebaseAuth.instance.authStateChanges(),
            builder: (context, snapshot) {
              final signedIn = snapshot.data != null;
              return FilledButton.icon(
                onPressed: () => signedIn ? FirebaseAuth.instance.signOut() : _showAdminLogin(context),
                icon: Icon(signedIn ? Icons.logout : Icons.admin_panel_settings),
                label: Text(signedIn ? 'Sign out' : 'Admin sign in'),
              );
            },
          ),
        ],
      ),
    );
  }
}
