import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Avatar,
  BottomSheet,
  Button,
  Chip,
  H1,
  ListRow,
  Muted,
  Screen,
  StatusBadge,
} from '../../components/ui';
import { useMobileStore } from '../../hooks';
import { colors, radii } from '../../theme';
import type { StaffStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<StaffStackParamList, 'Queue'>;
type Filter = 'all' | 'unassigned' | 'assigned';

export function QueueScreen({ navigation }: Props) {
  const store = useMobileStore();
  const [filter, setFilter] = useState<Filter>('all');
  const rows = store.queueRows(filter);
  const counts = {
    all: store.queueRows('all').length,
    unassigned: store.queueRows('unassigned').length,
    assigned: store.queueRows('assigned').length,
  };

  const [assignJourneyId, setAssignJourneyId] = useState<string | null>(null);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState('');
  const staff = store.assignableStaff();
  const assignRow = assignJourneyId
    ? store.queueRows('all').find((r) => r.journey.id === assignJourneyId)
    : null;

  return (
    <Screen>
      <H1>Queue</H1>
      <Muted>Incoming newcomers and assignment status.</Muted>
      <View style={styles.row}>
        <Chip label={`All (${counts.all})`} selected={filter === 'all'} onPress={() => setFilter('all')} />
        <Chip
          label={`Unassigned (${counts.unassigned})`}
          selected={filter === 'unassigned'}
          onPress={() => setFilter('unassigned')}
        />
        <Chip
          label={`Assigned (${counts.assigned})`}
          selected={filter === 'assigned'}
          onPress={() => setFilter('assigned')}
        />
      </View>

      {rows.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No newcomers found</Text>
          <Muted>Try adjusting your filter.</Muted>
        </View>
      ) : (
        rows.map(({ person, journey, assignee }) => (
          <ListRow
            key={journey.id}
            left={<Avatar firstName={person.firstName} lastName={person.lastName} tone="warm" />}
            title={`${person.firstName} ${person.lastName}`}
            subtitle={
              assignee
                ? `${person.email.address} · ${assignee.firstName}`
                : `${person.email.address} · Unassigned`
            }
            right={<StatusBadge status={journey.journeyStatus} />}
            onPress={() => {
              if (!assignee) {
                setAssignJourneyId(journey.id);
                setSelectedAssigneeId(staff[0]?.person.id ?? '');
              } else {
                navigation.navigate('PersonProfile', { personId: person.id });
              }
            }}
          />
        ))
      )}

      <BottomSheet visible={!!assignRow} onClose={() => setAssignJourneyId(null)}>
        {assignRow ? (
          <>
            <View style={styles.assignHeader}>
              <Avatar firstName={assignRow.person.firstName} lastName={assignRow.person.lastName} tone="warm" size={48} />
              <View style={{ flex: 1 }}>
                <Text style={styles.assignTitle}>
                  Assign {assignRow.person.firstName} {assignRow.person.lastName}
                </Text>
                <Muted>Select follow-up team member to shepherd</Muted>
              </View>
            </View>
            {staff.map((s) => {
              const selected = selectedAssigneeId === s.person.id;
              return (
                <Pressable
                  key={s.person.id}
                  onPress={() => setSelectedAssigneeId(s.person.id)}
                  style={[styles.staffCard, selected && styles.staffCardOn]}
                >
                  <Avatar firstName={s.person.firstName} lastName={s.person.lastName} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.staffName}>
                      {s.person.firstName} {s.person.lastName}
                    </Text>
                    <Muted>{s.roleName}</Muted>
                  </View>
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>{s.activeCount} active</Text>
                  </View>
                  <View style={[styles.radio, selected && styles.radioOn]}>
                    {selected ? <Text style={styles.radioCheck}>✓</Text> : null}
                  </View>
                </Pressable>
              );
            })}
            <Button
              label="Confirm Assignment"
              disabled={!selectedAssigneeId}
              onPress={() => {
                store.assignNewcomer(assignRow.journey.id, selectedAssigneeId);
                setAssignJourneyId(null);
                navigation.navigate('PersonProfile', { personId: assignRow.person.id });
              }}
            />
            <Button label="Cancel" variant="secondary" onPress={() => setAssignJourneyId(null)} />
          </>
        ) : null}
      </BottomSheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  empty: {
    backgroundColor: colors.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    padding: 24,
    alignItems: 'center',
    gap: 6,
  },
  emptyTitle: { fontWeight: '700', color: colors.ink },
  assignHeader: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  assignTitle: { fontSize: 18, fontWeight: '800', color: colors.ink },
  staffCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radii.md,
    padding: 12,
  },
  staffCardOn: { borderColor: colors.brand, backgroundColor: colors.brandSoft },
  staffName: { fontWeight: '700', color: colors.ink },
  activeBadge: {
    backgroundColor: colors.lineSoft,
    borderRadius: radii.pill,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  activeBadgeText: { fontSize: 11, fontWeight: '700', color: colors.muted },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { backgroundColor: colors.brand, borderColor: colors.brand },
  radioCheck: { color: colors.white, fontWeight: '800', fontSize: 12 },
});
