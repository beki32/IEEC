import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart'
    show TargetPlatform, defaultTargetPlatform, kIsWeb;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) return web;

    switch (defaultTargetPlatform) {
      case TargetPlatform.iOS:
        return ios;
      case TargetPlatform.android:
        return android;
      case TargetPlatform.macOS:
      case TargetPlatform.windows:
      case TargetPlatform.linux:
      case TargetPlatform.fuchsia:
        return web;
    }
  }

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyCnlL-LMRPZ6MK8UQL45bX7J-4GP6D-z5E',
    appId: '1:598438295878:web:5dbe9d98758c2b451c8d47',
    messagingSenderId: '598438295878',
    projectId: 'ieec-ya-connect',
    authDomain: 'ieec-ya-connect.firebaseapp.com',
    storageBucket: 'ieec-ya-connect.firebasestorage.app',
    measurementId: 'G-BFZWT6R482',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyAJK8fQCjSzl7eB9eA6wSvw8Cf1tLcw7tg',
    appId: '1:598438295878:ios:a4d55162d8812d8a1c8d47',
    messagingSenderId: '598438295878',
    projectId: 'ieec-ya-connect',
    storageBucket: 'ieec-ya-connect.firebasestorage.app',
    iosBundleId: 'IEECYaConnect',
  );

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyAjbMTIfXp9ZZRXzSy7Ohqwd5vfB0gGEvc',
    appId: '1:598438295878:android:97fdc59e573c79a41c8d47',
    messagingSenderId: '598438295878',
    projectId: 'ieec-ya-connect',
    storageBucket: 'ieec-ya-connect.firebasestorage.app',
  );
}
