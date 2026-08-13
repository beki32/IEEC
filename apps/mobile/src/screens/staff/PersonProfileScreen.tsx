import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { AttendanceStatus } from '@ieec/shared';
import {
  Avatar,
  Button,
  Chip,
  Field,
  H1,
  H2,
  Muted,
  Screen,
  StatusBadge,
} from '../../components/ui';
import { useMobileStore } from '../../hooks';
import { colors } from '../../theme';
import type { StaffStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<StaffStackParamList, 'PersonProfile'>;

export function PersonProfileScreen({ route, navigation }: Props) {
  const store = useMobileStore();
  const bundle = store.getPersonBundle(route.params.personId);
  const [summary, setSummary] = useState('');
  const [bio, setBio] = useState('');
  const [att, setAtt] = useState<AttendanceStatus>('attended');
  const [msg, setMsg] = useState('');

  if (!bundle?.person || !bundle.journey) {
    return (
      <Screen>
        <Muted>Person not found.</Muted>
        <Button label="Back" variant="secondary" onPress={() => navigation.goBack()} />
      </Screen>
    );
  }

  const { person, journey, assignment } = bundle;

  return (
    <Screen>
      <Button label="← Back" variant="ghost" onPress={() => navigation.goBack()} />
      <View style={styles.header}>
        <Avatar firstName={person.firstName} lastName={person.lastName} size={64} tone="warm" />
        <View style={{ flex: 1, gap: 6 }}>
          <H1>
            {person.firstName} {person.lastName}
          </H1>
          <StatusBadge status={journey.journeyStatus} />
          <Muted>
            Registered {new Date(journey.registrationDate).toLocaleDateString()} · {person.sex}
          </Muted>
        </View>
      </View>

      <H2>Contact</H2>
      <Muted>{person.email.address}</Muted>
      <Muted>{person.phone.display}</Muted>

      <View style={styles.row}>
        <Button
          label="Message"
          variant="secondary"
          onPress={() => navigation.navigate('Chat', { personId: person.id })}
        />
      </View>

      {msg ? <Text style={styles.ok}>{msg}</Text> : null}

      {assignment ? (
        <>
          <H2>Weekly report</H2>
          <Field
            label="Contact summary"
            multiline
            value={summary}
            onChangeText={setSummary}
            placeholder="What happened this week?"
          />
          <Button
            label="Submit report"
            onPress={() => {
              if (!summary.trim()) return;
              store.submitReport(assignment.id, journey.id, person.id, summary.trim());
              setSummary('');
              setMsg('Report submitted');
            }}
          />

          <H2>Saturday attendance</H2>
          <View style={styles.chips}>
            {(['attended', 'did_not_attend', 'unknown'] as AttendanceStatus[]).map((s) => (
              <Chip key={s} label={s.replace(/_/g, ' ')} selected={att === s} onPress={() => setAtt(s)} />
            ))}
          </View>
          <Button
            label="Save attendance"
            onPress={() => {
              store.recordAttendance(person.id, journey.id, assignment.id, att);
              setMsg(`Attendance: ${att}`);
            }}
          />

          <H2>Bio note</H2>
          <Field multiline value={bio} onChangeText={setBio} placeholder="Add a bio note" />
          <Button
            label="Add bio"
            variant="secondary"
            onPress={() => {
              if (!bio.trim()) return;
              store.addBio(person.id, journey.id, bio.trim());
              setBio('');
              setMsg('Bio added');
            }}
          />
        </>
      ) : (
        <Muted>Assign this newcomer from the Queue to unlock reporting tools.</Muted>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  row: { marginTop: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  ok: { color: colors.brand, fontWeight: '700' },
});
