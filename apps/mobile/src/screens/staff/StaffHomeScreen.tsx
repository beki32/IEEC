import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import { Avatar, Button, H1, ListRow, Muted, Screen, SectionLabel } from '../../components/ui';
import { upcomingEvents } from '../../content';
import { useMobileStore } from '../../hooks';
import { colors, radii, space } from '../../theme';
import type { StaffStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<StaffStackParamList, 'StaffHome'>;

export function StaffHomeScreen({ navigation }: Props) {
  const store = useMobileStore();
  const session = store.getSession()!;
  const waiting = store.unassignedCount();
  const mine = store.myAssignments().length;
  const next = upcomingEvents[0];

  return (
    <Screen>
      <View style={styles.header}>
        <Avatar firstName={session.person.firstName} lastName={session.person.lastName} size={48} />
        <View style={{ flex: 1 }}>
          <H1>
            {session.person.firstName} {session.person.lastName}
          </H1>
          <Muted>
            {session.roleName} · Follow-Up Team
          </Muted>
        </View>
      </View>

      <View style={styles.cta}>
        <Text style={styles.ctaCount}>{waiting}</Text>
        <Text style={styles.ctaLabel}>Waiting in Queue</Text>
        <Button label="Open Queue" onPress={() => navigation.navigate('Queue')} />
      </View>

      <SectionLabel>Shortcuts</SectionLabel>
      <ListRow
        title="My Assigned Shepherding"
        subtitle={`${mine} active newcomer${mine === 1 ? '' : 's'}`}
        onPress={() => navigation.navigate('Assigned')}
      />
      <ListRow
        title="Notes & Shared Tasks"
        subtitle="Meeting check-ins and team checklist"
        onPress={() => navigation.navigate('NotesTasks')}
      />
      <ListRow
        title="Upcoming YA Calendar"
        subtitle={next ? `${next.title} · ${next.time}` : 'No events'}
        onPress={() => navigation.navigate('Calendar')}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  cta: {
    backgroundColor: colors.brandDeep,
    borderRadius: radii.lg,
    padding: space.lg,
    gap: 8,
  },
  ctaCount: { color: colors.white, fontSize: 40, fontWeight: '800' },
  ctaLabel: { color: '#C9E5D8', fontSize: 16, marginBottom: 8 },
});
