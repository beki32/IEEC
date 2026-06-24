# IEEC YA Mobile

Flutter app for IEEC Young Adult members, ministers, team leaders, core team, and head leaders.

## Setup

1. Replace `lib/firebase_options.dart` placeholders with the shared Firebase project values.
2. Ensure Email/Password authentication is enabled in Firebase Auth.
3. Generate platform folders if this scaffold is checked out without them:

```bash
flutter create --platforms=android,ios .
flutter pub get
flutter run
```
