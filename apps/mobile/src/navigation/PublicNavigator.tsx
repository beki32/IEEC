import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { AboutScreen, BeliefsScreen, MinistriesScreen } from '../screens/public/AboutScreens';
import { EventsScreen } from '../screens/public/EventsScreen';
import { HomeScreen } from '../screens/public/HomeScreen';
import { MoreScreen } from '../screens/public/MoreScreen';
import { PrayScreen } from '../screens/public/PrayScreen';
import {
  RegisterDetailsScreen,
  RegisterPhotoScreen,
  RegisterSuccessScreen,
} from '../screens/public/RegisterScreen';
import { WatchScreen } from '../screens/public/WatchScreen';
import { colors } from '../theme';
import type { PublicStackParamList, PublicTabParamList } from './types';

const Tab = createBottomTabNavigator<PublicTabParamList>();
const HomeStack = createNativeStackNavigator<PublicStackParamList>();
const MoreStack = createNativeStackNavigator<PublicStackParamList>();

function tabIcon(label: string, focused: boolean) {
  const map: Record<string, string> = {
    Home: '⌂',
    Watch: '▷',
    Pray: '♡',
    More: '···',
  };
  return (
    <Text style={{ color: focused ? colors.brand : colors.mutedSoft, fontSize: 18, fontWeight: '700' }}>
      {map[label] ?? '•'}
    </Text>
  );
}

function HomeStackNav() {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerShadowVisible: false,
        headerTintColor: colors.brand,
        headerTitleStyle: { fontWeight: '700', color: colors.ink },
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <HomeStack.Screen name="PublicHome" component={HomeScreen} options={{ headerShown: false }} />
      <HomeStack.Screen name="PublicEvents" component={EventsScreen} options={{ title: 'Events' }} />
      <HomeStack.Screen name="RegisterDetails" component={RegisterDetailsScreen} options={{ title: 'Register' }} />
      <HomeStack.Screen name="RegisterPhoto" component={RegisterPhotoScreen} options={{ title: 'Photo' }} />
      <HomeStack.Screen
        name="RegisterSuccess"
        component={RegisterSuccessScreen}
        options={{ title: 'Success', headerBackVisible: false }}
      />
      <HomeStack.Screen name="About" component={AboutScreen} options={{ title: 'Our Story' }} />
      <HomeStack.Screen name="Beliefs" component={BeliefsScreen} options={{ title: 'Beliefs' }} />
      <HomeStack.Screen name="Ministries" component={MinistriesScreen} options={{ title: 'Ministries' }} />
    </HomeStack.Navigator>
  );
}

function MoreStackNav() {
  return (
    <MoreStack.Navigator
      screenOptions={{
        headerShadowVisible: false,
        headerTintColor: colors.brand,
        headerTitleStyle: { fontWeight: '700', color: colors.ink },
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <MoreStack.Screen name="PublicMore" component={MoreScreen} options={{ headerShown: false }} />
      <MoreStack.Screen name="About" component={AboutScreen} options={{ title: 'Our Story' }} />
      <MoreStack.Screen name="Beliefs" component={BeliefsScreen} options={{ title: 'Beliefs' }} />
      <MoreStack.Screen name="Ministries" component={MinistriesScreen} options={{ title: 'Ministries' }} />
      <MoreStack.Screen name="RegisterDetails" component={RegisterDetailsScreen} options={{ title: 'Register' }} />
      <MoreStack.Screen name="RegisterPhoto" component={RegisterPhotoScreen} options={{ title: 'Photo' }} />
      <MoreStack.Screen
        name="RegisterSuccess"
        component={RegisterSuccessScreen}
        options={{ title: 'Success', headerBackVisible: false }}
      />
    </MoreStack.Navigator>
  );
}

export function PublicNavigator() {
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
      <Tab.Screen name="Home" component={HomeStackNav} />
      <Tab.Screen name="Watch" component={WatchScreen} />
      <Tab.Screen name="Pray" component={PrayScreen} />
      <Tab.Screen name="More" component={MoreStackNav} />
    </Tab.Navigator>
  );
}
