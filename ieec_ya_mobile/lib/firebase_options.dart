import 'package:firebase_core/firebase_core.dart';

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform => web;

  // Replace these placeholder values with the config from the shared Firebase project.
  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'REPLACE_WITH_FIREBASE_API_KEY',
    appId: 'REPLACE_WITH_FIREBASE_APP_ID',
    messagingSenderId: 'REPLACE_WITH_FIREBASE_MESSAGING_SENDER_ID',
    projectId: 'ieec-ya-connect',
    authDomain: 'ieec-ya-connect.firebaseapp.com',
    storageBucket: 'ieec-ya-connect.firebasestorage.app',
  );
}
