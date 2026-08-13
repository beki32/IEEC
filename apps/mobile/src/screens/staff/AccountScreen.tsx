import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { CommonActions } from '@react-navigation/native';
import { Avatar, Button, Field, H1, Muted, Screen } from '../../components/ui';
import { useMobileStore } from '../../hooks';
import type { RootStackParamList, StaffStackParamList } from '../../navigation/types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<StaffStackParamList, 'Account'>;

export function AccountScreen({ navigation }: Props) {
  const store = useMobileStore();
  const session = store.getSession()!;
  const [firstName, setFirst] = useState(session.person.firstName);
  const [lastName, setLast] = useState(session.person.lastName);
  const [phone, setPhone] = useState(session.person.phone.display);
  const [saved, setSaved] = useState(false);

  return (
    <Screen>
      <Avatar firstName={session.person.firstName} lastName={session.person.lastName} size={72} />
      <H1>
        {session.person.firstName} {session.person.lastName}
      </H1>
      <Muted>
        {session.roleName} · {session.account.email}
      </Muted>
      <Field label="First name" value={firstName} onChangeText={setFirst} />
      <Field label="Last name" value={lastName} onChangeText={setLast} />
      <Field label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      {saved ? <Muted>Profile updated.</Muted> : null}
      <Button
        label="Update Profile"
        onPress={() => {
          store.updateProfile({ firstName, lastName, phone });
          setSaved(true);
        }}
      />
      <Button
        label="Sign Out"
        variant="danger"
        onPress={() => {
          store.logout();
          let root: { dispatch: NativeStackNavigationProp<RootStackParamList>['dispatch']; getParent?: () => unknown } =
            navigation as unknown as NativeStackNavigationProp<RootStackParamList>;
          while (root.getParent?.()) {
            root = root.getParent() as typeof root;
          }
          root.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'PublicApp' }],
            }),
          );
        }}
      />
    </Screen>
  );
}
