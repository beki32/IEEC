# IEEC YA Admin

Responsive Flutter Web console for Head Leader and Core Team administration.

## Setup

1. Create an authenticated admin user with UID `M7gdLL39oXbULvAzlj0Z4ufNeI43`.
2. Create the matching Firestore document at `/users/M7gdLL39oXbULvAzlj0Z4ufNeI43` using `../firestore_seed/initial_admin_profile.json`.
3. The shared Firebase Web app config is already present in `lib/firebase_options.dart`.
4. Generate web platform files if needed and run:

```bash
flutter create --platforms=web .
flutter pub get
flutter run -d chrome
```

Use the **Seed mock data** action after signing in to populate the live Firestore test dataset.
