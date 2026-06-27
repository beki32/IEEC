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

String authErrorMessage(FirebaseAuthException error) {
  final help = switch (error.code) {
    'invalid-credential' || 'wrong-password' => 'Check the email and password, or reset the password in Firebase Authentication.',
    'user-not-found' => 'Create this email in Firebase Authentication first.',
    'user-disabled' => 'This Firebase Authentication user is disabled.',
    'operation-not-allowed' => 'Enable Email/Password sign-in in Firebase Authentication.',
    'too-many-requests' => 'Too many attempts. Wait a moment or reset the password.',
    'network-request-failed' => 'Check your internet connection.',
    _ => error.message ?? 'Unable to sign in.',
  };
  return '[${error.code}] $help';
}

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  ErrorWidget.builder = (details) => Directionality(
        textDirection: TextDirection.ltr,
        child: Material(
          color: const Color(0xFF121212),
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 720),
              child: Card(
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(Icons.error_outline, color: Colors.red, size: 40),
                      const SizedBox(height: 12),
                      const Text('IEEC YA Admin could not render this screen.', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18)),
                      const SizedBox(height: 8),
                      Text(details.exceptionAsString()),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      );
  runApp(const IeecYaAdminBootstrap());
}

class IeecYaAdminBootstrap extends StatelessWidget {
  const IeecYaAdminBootstrap({super.key});

  Future<FirebaseApp> _initializeFirebase() {
    if (Firebase.apps.isNotEmpty) {
      return Future.value(Firebase.app());
    }
    return Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'IEEC YA Admin',
      debugShowCheckedModeBanner: false,
      theme: IeecTheme.light(),
      darkTheme: IeecTheme.dark(),
      home: FutureBuilder<FirebaseApp>(
        future: _initializeFirebase(),
        builder: (context, snapshot) {
          if (snapshot.hasError) {
            return _StartupErrorScreen(error: snapshot.error);
          }

          if (snapshot.connectionState != ConnectionState.done) {
            return const _StartupLoadingScreen();
          }

          return const AdminShell();
        },
      ),
    );
  }
}

class _StartupLoadingScreen extends StatelessWidget {
  const _StartupLoadingScreen();

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            CircularProgressIndicator(),
            SizedBox(height: 16),
            Text('Starting IEEC YA Admin...'),
          ],
        ),
      ),
    );
  }
}

class _StartupErrorScreen extends StatelessWidget {
  const _StartupErrorScreen({required this.error});
  final Object? error;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 760),
          child: Card(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(Icons.cloud_off, color: Theme.of(context).colorScheme.error, size: 40),
                  const SizedBox(height: 12),
                  Text('Firebase failed to start', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800)),
                  const SizedBox(height: 8),
                  Text(error?.toString() ?? 'Unknown Firebase initialization error'),
                  const SizedBox(height: 12),
                  const Text('Check that you are running from ieec_ya_admin, then run flutter clean, flutter pub get, and flutter run -d chrome.'),
                ],
              ),
            ),
          ),
        ),
      ),
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
                const _AdminProfileStatus(),
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
                          var keepDialogOpen = true;
                          try {
                            await FirebaseAuth.instance.signInWithEmailAndPassword(
                              email: emailController.text.trim(),
                              password: passwordController.text,
                            );
                            keepDialogOpen = false;
                            if (dialogContext.mounted) Navigator.of(dialogContext).pop();
                          } on FirebaseAuthException catch (error) {
                            if (!context.mounted) return;
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text(authErrorMessage(error)),
                                duration: const Duration(seconds: 8),
                              ),
                            );
                          } finally {
                            if (keepDialogOpen && context.mounted) {
                              setState(() => loading = false);
                            }
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

class _AdminProfileStatus extends StatelessWidget {
  const _AdminProfileStatus();

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<User?>(
      stream: FirebaseAuth.instance.authStateChanges(),
      builder: (context, authSnapshot) {
        final user = authSnapshot.data;
        if (user == null) {
          return _StatusBanner(
            icon: Icons.info_outline,
            message: 'Not signed in. Use Admin sign in with your Firebase Authentication email and password.',
            color: Theme.of(context).colorScheme.primary,
          );
        }

        return StreamBuilder<DocumentSnapshot<Map<String, dynamic>>>(
          stream: FirebaseFirestore.instance.collection('users').doc(user.uid).snapshots(),
          builder: (context, profileSnapshot) {
            if (profileSnapshot.hasError) {
              return _StatusBanner(
                icon: Icons.error_outline,
                message: 'Signed in as ${user.email ?? user.uid}, but Firestore profile check failed: ${profileSnapshot.error}',
                color: Colors.red,
              );
            }

            if (!profileSnapshot.hasData) {
              return _StatusBanner(
                icon: Icons.sync,
                message: 'Signed in as ${user.email ?? user.uid}. Checking /users/${user.uid}...',
                color: Theme.of(context).colorScheme.primary,
              );
            }

            if (!profileSnapshot.data!.exists) {
              return _StatusBanner(
                icon: Icons.warning_amber,
                message: 'Signed in as ${user.email ?? user.uid}, but /users/${user.uid} does not exist. Create it with roles: [head_leader].',
                color: Colors.orange,
              );
            }

            final data = profileSnapshot.data!.data() ?? {};
            final roles = (data['roles'] as List? ?? []).join(', ');
            if (!roles.contains('head_leader') && !roles.contains('core_team')) {
              return _StatusBanner(
                icon: Icons.warning_amber,
                message: 'Signed in as ${user.email ?? user.uid}. Profile exists, but roles are [$roles]. Add head_leader or core_team for admin access.',
                color: Colors.orange,
              );
            }

            return _StatusBanner(
              icon: Icons.verified_user,
              message: 'Signed in as ${user.email ?? user.uid}. Admin profile found with roles: [$roles].',
              color: Colors.green,
            );
          },
        );
      },
    );
  }
}

class _StatusBanner extends StatelessWidget {
  const _StatusBanner({
    required this.icon,
    required this.message,
    required this.color,
  });

  final IconData icon;
  final String message;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 10),
      color: color.withOpacity(0.12),
      child: Row(
        children: [
          Icon(icon, color: color, size: 18),
          const SizedBox(width: 10),
          Expanded(child: Text(message)),
        ],
      ),
    );
  }
}
