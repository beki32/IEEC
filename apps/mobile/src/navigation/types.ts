export type PublicStackParamList = {
  PublicHome: undefined;
  PublicEvents: undefined;
  RegisterDetails: undefined;
  RegisterPhoto: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    sex: 'male' | 'female' | 'unspecified';
    contact: 'text' | 'call' | 'email';
  };
  RegisterSuccess: undefined;
  About: undefined;
  Beliefs: undefined;
  Ministries: undefined;
  PublicMore: undefined;
};

export type PublicTabParamList = {
  Home: undefined;
  Watch: undefined;
  Pray: undefined;
  More: undefined;
};

export type StaffStackParamList = {
  StaffHome: undefined;
  Queue: undefined;
  Assigned: undefined;
  NotesTasks: undefined;
  StaffMore: undefined;
  PersonProfile: { personId: string };
  Calendar: undefined;
  Chat: { personId?: string } | undefined;
  Notifications: undefined;
  Account: undefined;
};

export type StaffTabParamList = {
  QueueTab: undefined;
  AssignedTab: undefined;
  NotesTab: undefined;
  MoreTab: undefined;
};

export type RootStackParamList = {
  PublicApp: undefined;
  StaffSignIn: undefined;
  StaffApp: undefined;
};
