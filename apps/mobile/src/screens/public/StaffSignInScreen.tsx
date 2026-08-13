import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Field, H1, Muted, Screen } from '../../components/ui';
import { mobileStore } from '../../demoStore';
import { colors } from '../../theme';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'StaffSignIn'>;

const DEMOS = [
  { label: 'Leader', email: 'leader@ieec.demo' },
  { label: 'Assistant', email: 'assistant@ieec.demo' },
  { label: 'Minister', email: 'minister@ieec.demo' },
];

export function StaffSignInScreen({ navigation }: Props) {
  const [email, setEmail] = useState('minister@ieec.demo');
  const [password, setPassword] = useState('demo-password');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');

  function signIn(nextEmail = email) {
    const result = mobileStore.login(nextEmail);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError('');
    navigation.replace('StaffApp');
  }

  return (
    <Screen>
      <H1>Staff Sign In</H1>
      <Muted>Follow-Up team access · demo mode</Muted>
      <Field
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="you@ieec.demo"
      />
      <View>
        <Field
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPw}
          placeholder="Password"
        />
        <Text style={styles.toggle} onPress={() => setShowPw((v) => !v)}>
          {showPw ? 'Hide' : 'Show'}
        </Text>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button label="Sign In" onPress={() => signIn()} />
      <Muted>Quick demo accounts</Muted>
      <View style={styles.row}>
        {DEMOS.map((d) => (
          <Button
            key={d.email}
            label={d.label}
            variant="secondary"
            onPress={() => {
              setEmail(d.email);
              signIn(d.email);
            }}
          />
        ))}
      </View>
      <Button
        label="Back to Home"
        variant="ghost"
        onPress={() => {
          if (navigation.canGoBack()) navigation.goBack();
          else navigation.replace('PublicApp');
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  toggle: { color: colors.brand, fontWeight: '700', marginTop: -8, marginBottom: 4 },
  error: { color: colors.danger, fontWeight: '600' },
  row: { gap: 8 },
});
