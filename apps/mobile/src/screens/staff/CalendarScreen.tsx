import { StyleSheet, Text, View } from 'react-native';
import { EventRow, H1, Muted, Screen, SectionLabel } from '../../components/ui';
import { upcomingEvents } from '../../content';
import { colors, radii } from '../../theme';

export function CalendarScreen() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = 4; // highlight Friday in the mock week strip

  return (
    <Screen>
      <H1>Calendar</H1>
      <Muted>Upcoming workspace events for Follow-Up.</Muted>
      <View style={styles.week}>
        {days.map((d, i) => (
          <View key={d} style={[styles.day, i === today && styles.dayOn]}>
            <Text style={[styles.dayLabel, i === today && styles.dayLabelOn]}>{d}</Text>
            <Text style={[styles.dayNum, i === today && styles.dayLabelOn]}>{20 + i}</Text>
          </View>
        ))}
      </View>
      <SectionLabel>Upcoming workspace events</SectionLabel>
      {upcomingEvents.map((e) => (
        <EventRow key={e.id} day={e.day} month={e.month} title={e.title} meta={`${e.time} · ${e.location}`} />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  week: { flexDirection: 'row', gap: 6 },
  day: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: radii.sm,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.lineSoft,
  },
  dayOn: { backgroundColor: colors.brand, borderColor: colors.brand },
  dayLabel: { fontSize: 11, fontWeight: '600', color: colors.muted },
  dayNum: { fontSize: 15, fontWeight: '800', color: colors.ink, marginTop: 2 },
  dayLabelOn: { color: colors.white },
});
