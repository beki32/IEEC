import 'package:firebase_core/firebase_core.dart';

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform => web;

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyCnlL-LMRPZ6MK8UQL45bX7J-4GP6D-z5E',
    appId: '1:598438295878:web:5dbe9d98758c2b451c8d47',
    messagingSenderId: '598438295878',
    projectId: 'ieec-ya-connect',
    authDomain: 'ieec-ya-connect.firebaseapp.com',
    storageBucket: 'ieec-ya-connect.firebasestorage.app',
    measurementId: 'G-BFZWT6R482',
  );
}
