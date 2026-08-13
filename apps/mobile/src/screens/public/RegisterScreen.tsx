import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Chip, Field, H1, Muted, Screen } from '../../components/ui';
import { mobileStore } from '../../demoStore';
import { colors, radii } from '../../theme';
import type { PublicStackParamList } from '../../navigation/types';

type DetailsProps = NativeStackScreenProps<PublicStackParamList, 'RegisterDetails'>;
type PhotoProps = NativeStackScreenProps<PublicStackParamList, 'RegisterPhoto'>;

type Sex = 'male' | 'female' | 'unspecified';
type Contact = 'text' | 'call' | 'email';

export function RegisterDetailsScreen({ navigation }: DetailsProps) {
  const [firstName, setFirst] = useState('');
  const [lastName, setLast] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [sex, setSex] = useState<Sex>('unspecified');
  const [contact, setContact] = useState<Contact>('text');
  const [error, setError] = useState('');

  return (
    <Screen>
      <Muted>1 of 2 · Details</Muted>
      <H1>Join as a Newcomer</H1>
      <Field label="First name" value={firstName} onChangeText={setFirst} />
      <Field label="Last name" value={lastName} onChangeText={setLast} />
      <Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <Field label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <Text style={styles.label}>Sex</Text>
      <View style={styles.row}>
        {(
          [
            ['male', 'Male'],
            ['female', 'Female'],
            ['unspecified', 'Prefer not to say'],
          ] as const
        ).map(([value, label]) => (
          <Chip key={value} label={label} selected={sex === value} onPress={() => setSex(value)} />
        ))}
      </View>
      <Text style={styles.label}>Preferred contact</Text>
      <View style={styles.row}>
        {(
          [
            ['text', 'Text Message'],
            ['call', 'Phone Call'],
            ['email', 'Email'],
          ] as const
        ).map(([value, label]) => (
          <Chip key={value} label={label} selected={contact === value} onPress={() => setContact(value)} />
        ))}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button
        label="Continue to photo"
        onPress={() => {
          if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim()) {
            setError('Please complete all required fields.');
            return;
          }
          setError('');
          navigation.navigate('RegisterPhoto', {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
            phone: phone.trim(),
            sex,
            contact,
          });
        }}
      />
    </Screen>
  );
}

export function RegisterPhotoScreen({ navigation, route }: PhotoProps) {
  const finish = () => {
    mobileStore.register({
      firstName: route.params.firstName,
      lastName: route.params.lastName,
      email: route.params.email,
      phone: route.params.phone,
      sex: route.params.sex,
      contactMethod: route.params.contact,
    });
    navigation.replace('RegisterSuccess');
  };

  return (
    <Screen>
      <Muted>2 of 2 · Photo</Muted>
      <H1>Add Your Photo (Optional)</H1>
      <View style={styles.photoPlaceholder}>
        <Text style={styles.camera}>📷</Text>
        <Muted>Photo capture is optional for this demo build.</Muted>
      </View>
      <Button label="Add Photo" variant="secondary" onPress={finish} />
      <Button label="Finish Registration" onPress={finish} />
      <Button label="Skip Photo & Finish" variant="ghost" onPress={finish} />
    </Screen>
  );
}

export function RegisterSuccessScreen({ navigation }: NativeStackScreenProps<PublicStackParamList, 'RegisterSuccess'>) {
  return (
    <Screen style={{ justifyContent: 'center', minHeight: 520 }}>
      <View style={styles.successIcon}>
        <Text style={styles.check}>✓</Text>
      </View>
      <H1>You're Registered!</H1>
      <Muted>A Follow-Up minister will reach out to you soon.</Muted>
      <Button label="Go to Home" onPress={() => navigation.popToTop()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { fontWeight: '600', color: colors.inkSoft, fontSize: 13 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  error: { color: colors.danger, fontWeight: '600' },
  photoPlaceholder: {
    height: 180,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  camera: { fontSize: 36 },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  check: { color: colors.brand, fontSize: 34, fontWeight: '800' },
});
