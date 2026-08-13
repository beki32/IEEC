import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { AccountScreen } from '../screens/staff/AccountScreen';
import { AssignedScreen } from '../screens/staff/AssignedScreen';
import { CalendarScreen } from '../screens/staff/CalendarScreen';
import { ChatScreen } from '../screens/staff/ChatScreen';
import { NotesTasksScreen } from '../screens/staff/NotesTasksScreen';
import { NotificationsScreen } from '../screens/staff/NotificationsScreen';
import { PersonProfileScreen } from '../screens/staff/PersonProfileScreen';
import { QueueScreen } from '../screens/staff/QueueScreen';
import { StaffHomeScreen } from '../screens/staff/StaffHomeScreen';
import { StaffMoreScreen } from '../screens/staff/StaffMoreScreen';
import { colors } from '../theme';
import type { StaffStackParamList, StaffTabParamList } from './types';

const Tab = createBottomTabNavigator<StaffTabParamList>();
const Stack = createNativeStackNavigator<StaffStackParamList>();

function tabIcon(label: string, focused: boolean) {
  const map: Record<string, string> = {
    QueueTab: '☰',
    AssignedTab: '◎',
    NotesTab: '✎',
    MoreTab: '···',
  };
  return (
    <Text style={{ color: focused ? colors.brand : colors.mutedSoft, fontSize: 16, fontWeight: '700' }}>
      {map[label] ?? '•'}
    </Text>
  );
}

function stackScreenOptions() {
  return {
    headerShadowVisible: false,
    headerTintColor: colors.brand,
    headerTitleStyle: { fontWeight: '700' as const, color: colors.ink },
    contentStyle: { backgroundColor: colors.bg },
  };
}

function QueueStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions()}>
      <Stack.Screen name="Queue" component={QueueScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PersonProfile" component={PersonProfileScreen} options={{ title: 'Profile' }} />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Chat' }} />
      <Stack.Screen name="StaffHome" component={StaffHomeScreen} options={{ title: 'Dashboard' }} />
    </Stack.Navigator>
  );
}

function AssignedStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions()}>
      <Stack.Screen name="Assigned" component={AssignedScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PersonProfile" component={PersonProfileScreen} options={{ title: 'Profile' }} />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Chat' }} />
    </Stack.Navigator>
  );
}

function NotesStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions()}>
      <Stack.Screen name="NotesTasks" component={NotesTasksScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function MoreStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions()}>
      <Stack.Screen name="StaffMore" component={StaffMoreScreen} options={{ headerShown: false }} />
      <Stack.Screen name="StaffHome" component={StaffHomeScreen} options={{ title: 'Dashboard' }} />
      <Stack.Screen name="Calendar" component={CalendarScreen} options={{ title: 'Calendar' }} />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Chat' }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
      <Stack.Screen name="Account" component={AccountScreen} options={{ title: 'My Account' }} />
      <Stack.Screen name="PersonProfile" component={PersonProfileScreen} options={{ title: 'Profile' }} />
      <Stack.Screen name="Queue" component={QueueScreen} options={{ title: 'Queue' }} />
      <Stack.Screen name="Assigned" component={AssignedScreen} options={{ title: 'Assigned' }} />
      <Stack.Screen name="NotesTasks" component={NotesTasksScreen} options={{ title: 'Notes & Tasks' }} />
    </Stack.Navigator>
  );
}

export function StaffNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.mutedSoft,
        tabBarStyle: {
          borderTopColor: colors.lineSoft,
          backgroundColor: colors.card,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontWeight: '700', fontSize: 11 },
        tabBarIcon: ({ focused }) => tabIcon(route.name, focused),
      })}
    >
      <Tab.Screen name="QueueTab" component={QueueStack} options={{ title: 'Queue' }} />
      <Tab.Screen name="AssignedTab" component={AssignedStack} options={{ title: 'Assigned' }} />
      <Tab.Screen name="NotesTab" component={NotesStack} options={{ title: 'Notes' }} />
      <Tab.Screen name="MoreTab" component={MoreStack} options={{ title: 'More' }} />
    </Tab.Navigator>
  );
}
