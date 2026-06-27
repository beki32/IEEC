# IEEC YA Mobile

Flutter app for IEEC Young Adult members, ministers, team leaders, core team, and head leaders.

## Setup

1. Ensure Email/Password authentication is enabled in Firebase Auth.
2. The shared Firebase web, iOS, and Android app configs are already present in `lib/firebase_options.dart`.
3. The native iOS config is available at `ios/Runner/GoogleService-Info.plist`.
4. The iOS `AppDelegate.swift` includes a guarded `FirebaseApp.configure()` call for native Firebase setup.
5. The native Android config is available at `android/app/google-services.json`.
6. The Android Gradle config applies `com.google.gms.google-services` and imports Firebase BoM `34.15.0`.
7. Generate platform folders if this scaffold is checked out without them:

```bash
flutter create --platforms=android,ios .
flutter pub get
flutter run
```
