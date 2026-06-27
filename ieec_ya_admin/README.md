# IEEC YA Admin

Responsive Flutter Web console for Head Leader and Core Team administration.

## Setup

1. Create an authenticated admin user with a matching `/users/{uid}` document containing `head_leader` or `core_team` in `roles`.
2. The shared Firebase Web app config is already present in `lib/firebase_options.dart`.
3. Generate web platform files if needed and run:

```bash
flutter create --platforms=web .
flutter pub get
flutter run -d chrome
```

Use the **Seed mock data** action after signing in to populate the live Firestore test dataset.
