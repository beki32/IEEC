import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import { PublicNavigator } from './src/navigation/PublicNavigator';
import { StaffNavigator } from './src/navigation/StaffNavigator';
import { StaffSignInScreen } from './src/screens/public/StaffSignInScreen';
import { useMobileStore } from './src/hooks';
import { colors } from './src/theme';
import type { RootStackParamList } from './src/navigation/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  useMobileStore();

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
            <Stack.Screen name="PublicApp" component={PublicNavigator} />
            <Stack.Screen
              name="StaffSignIn"
              component={StaffSignInScreen}
              options={{
                headerShown: true,
                title: 'Staff Sign In',
                headerTintColor: colors.brand,
                headerShadowVisible: false,
              }}
            />
            <Stack.Screen name="StaffApp" component={StaffNavigator} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
