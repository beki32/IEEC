# IEEC YA Connect

IEEC YA Connect is a two-app Flutter/Firebase Young Adult Ministry Management System:

- `ieec_ya_mobile`: iOS/Android member, minister, and leader app.
- `ieec_ya_admin`: responsive Flutter Web administration console.

Both apps are configured to share one Firebase project and the same Firestore security model.

## Firebase setup

1. Use Firebase project `ieec-ya-connect` with Authentication and Cloud Firestore enabled.
2. The shared Firebase Web app config and iOS mobile config are present in the generated files.
   Add the Android Firebase app config before Android release builds.
3. Deploy rules from `firestore.rules`.
4. Create the initial authenticated admin user and `/users/{uid}` document with `roles: ['head_leader']`.
5. Run the admin app and use **Seed mock data** to populate sample ministries, leaders, ministers, chats, Bible Study groups, contributions, new comers, and placeholder extension collections.

## Firestore collections

Primary collections implemented in models and screens:

- `users`
- `teams`
- `g5_groups`
- `team_chats/{chatId}/chat_messages`
- `contributions`
- `new_comers/{newComerId}/follow_up_updates`
- `bible_study_groups`

Reserved extension paths are present in rules and seed placeholders:

`people`, `members`, `ministers`, `leadership_roles`, `team_members`, `team_responsibilities`, `attendance`, `tasks`, `reports`, `events`, `notifications`.

## Run locally

```bash
cd ieec_ya_mobile
flutter pub get
flutter run

cd ../ieec_ya_admin
flutter pub get
flutter run -d chrome
```
