import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text } from 'react-native';
import { H1, ListRow, Screen, SectionLabel } from '../../components/ui';
import { useMobileStore } from '../../hooks';
import { colors } from '../../theme';
import type { StaffStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<StaffStackParamList, 'StaffMore'>;

export function StaffMoreScreen({ navigation }: Props) {
  const store = useMobileStore();
  const session = store.getSession()!;

  return (
    <Screen>
      <H1>More</H1>
      <SectionLabel>Workspace</SectionLabel>
      <ListRow
        title="Team Dashboard"
        subtitle={`${session.person.firstName} · ${session.roleName}`}
        right={<Text style={styles.chev}>›</Text>}
        onPress={() => navigation.navigate('StaffHome')}
      />
      <ListRow
        title="Calendar"
        right={<Text style={styles.chev}>›</Text>}
        onPress={() => navigation.navigate('Calendar')}
      />
      <ListRow
        title="Chat"
        right={<Text style={styles.chev}>›</Text>}
        onPress={() => navigation.navigate('Chat')}
      />
      <ListRow
        title="Notifications"
        right={<Text style={styles.chev}>›</Text>}
        onPress={() => navigation.navigate('Notifications')}
      />
      <ListRow
        title="My Account"
        right={<Text style={styles.chev}>›</Text>}
        onPress={() => navigation.navigate('Account')}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  chev: { color: colors.mutedSoft, fontSize: 22, fontWeight: '300' },
});
