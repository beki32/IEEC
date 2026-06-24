class FirestoreCollections {
  const FirestoreCollections._();

  static const users = 'users';
  static const teams = 'teams';
  static const g5Groups = 'g5_groups';
  static const teamChats = 'team_chats';
  static const chatMessages = 'chat_messages';
  static const contributions = 'contributions';
  static const newComers = 'new_comers';
  static const followUpUpdates = 'follow_up_updates';
  static const bibleStudyGroups = 'bible_study_groups';

  // Reserved extension paths for future ministry modules.
  static const people = 'people';
  static const members = 'members';
  static const ministers = 'ministers';
  static const leadershipRoles = 'leadership_roles';
  static const teamMembers = 'team_members';
  static const teamResponsibilities = 'team_responsibilities';
  static const attendance = 'attendance';
  static const tasks = 'tasks';
  static const reports = 'reports';
  static const events = 'events';
  static const notifications = 'notifications';

  static const placeholders = [
    people,
    members,
    ministers,
    leadershipRoles,
    teamMembers,
    teamResponsibilities,
    attendance,
    tasks,
    reports,
    events,
    notifications,
  ];
}
