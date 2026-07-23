import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Pressable,
  View,
} from 'react-native';
import { mobileStore } from './src/demoStore';
import type { AttendanceStatus } from '@ieec/shared';

type Screen = 'login' | 'home' | 'detail' | 'register';

export default function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [email, setEmail] = useState('minister@ieec.demo');
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [summary, setSummary] = useState('');
  const [bio, setBio] = useState('');
  const [att, setAtt] = useState<AttendanceStatus>('attended');
  const [msg, setMsg] = useState('');
  const [tick, setTick] = useState(0);
  const [reg, setReg] = useState({ firstName: '', lastName: '', email: '', phone: '' });

  const session = useMemo(() => {
    void tick;
    return mobileStore.getSession();
  }, [tick]);

  const assignments = useMemo(() => {
    void tick;
    return mobileStore.myAssignments();
  }, [tick]);

  const selected = assignments.find((a) => a.person.id === selectedId);

  function bump(message?: string) {
    setTick((t) => t + 1);
    if (message) setMsg(message);
  }

  if (screen === 'register') {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.brand}>IEEC YA Connect</Text>
          <Text style={styles.h1}>Newcomer registration</Text>
          <TextInput style={styles.input} placeholder="First name" value={reg.firstName} onChangeText={(v) => setReg({ ...reg, firstName: v })} />
          <TextInput style={styles.input} placeholder="Last name" value={reg.lastName} onChangeText={(v) => setReg({ ...reg, lastName: v })} />
          <TextInput style={styles.input} placeholder="Email" autoCapitalize="none" value={reg.email} onChangeText={(v) => setReg({ ...reg, email: v })} />
          <TextInput style={styles.input} placeholder="Phone" value={reg.phone} onChangeText={(v) => setReg({ ...reg, phone: v })} />
          <Pressable
            style={styles.btn}
            onPress={() => {
              mobileStore.register(reg);
              setMsg('Registered — awaiting assignment');
              setScreen('login');
            }}
          >
            <Text style={styles.btnText}>Submit</Text>
          </Pressable>
          <Pressable onPress={() => setScreen('login')}><Text style={styles.link}>Back to sign in</Text></Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!session || screen === 'login') {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.container}>
          <StatusBar style="dark" />
          <Text style={styles.brand}>IEEC YA Connect</Text>
          <Text style={styles.h1}>Mobile Follow-Up</Text>
          <Text style={styles.muted}>React Native (Expo) · demo mode · same RBAC model as web</Text>
          {msg ? <Text style={styles.ok}>{msg}</Text> : null}
          <TextInput
            style={styles.input}
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable
            style={styles.btn}
            onPress={() => {
              const result = mobileStore.login(email);
              if (!result.ok) {
                setError(result.error);
                return;
              }
              setError('');
              setScreen('home');
              bump();
            }}
          >
            <Text style={styles.btnText}>Sign in</Text>
          </Pressable>
          <Pressable onPress={() => setEmail('minister@ieec.demo')}><Text style={styles.link}>Use minister@ieec.demo</Text></Pressable>
          <Pressable onPress={() => setScreen('register')}><Text style={styles.link}>Public registration</Text></Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (screen === 'detail' && selected) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.container}>
          <Pressable onPress={() => setScreen('home')}><Text style={styles.link}>← Assigned</Text></Pressable>
          <Text style={styles.h1}>{selected.person.firstName} {selected.person.lastName}</Text>
          <Text style={styles.muted}>{selected.journey.journeyStatus}</Text>
          {msg ? <Text style={styles.ok}>{msg}</Text> : null}

          <Text style={styles.h2}>Weekly report</Text>
          <TextInput style={[styles.input, styles.area]} multiline value={summary} onChangeText={setSummary} placeholder="Contact summary" />
          <Pressable
            style={styles.btn}
            onPress={() => {
              mobileStore.submitReport(selected.assignment.id, selected.journey.id, selected.person.id, summary);
              setSummary('');
              bump('Report submitted');
            }}
          >
            <Text style={styles.btnText}>Submit report</Text>
          </Pressable>

          <Text style={styles.h2}>Saturday attendance</Text>
          <View style={styles.row}>
            {(['attended', 'did_not_attend', 'unknown'] as AttendanceStatus[]).map((s) => (
              <Pressable key={s} style={[styles.chip, att === s && styles.chipOn]} onPress={() => setAtt(s)}>
                <Text style={styles.chipText}>{s}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable
            style={styles.btn}
            onPress={() => {
              mobileStore.recordAttendance(selected.person.id, selected.journey.id, selected.assignment.id, att);
              bump(`Attendance: ${att}`);
            }}
          >
            <Text style={styles.btnText}>Save attendance</Text>
          </Pressable>

          <Text style={styles.h2}>Bio note</Text>
          <TextInput style={[styles.input, styles.area]} multiline value={bio} onChangeText={setBio} />
          <Pressable
            style={styles.btnSecondary}
            onPress={() => {
              mobileStore.addBio(selected.person.id, selected.journey.id, bio);
              setBio('');
              bump('Bio added');
            }}
          >
            <Text style={styles.btnSecondaryText}>Add bio</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.brand}>IEEC YA Connect</Text>
        <Text style={styles.h1}>Hi {session.person.firstName}</Text>
        <Text style={styles.muted}>{session.permissions.size} permissions resolved</Text>
        <Text style={styles.h2}>Assigned newcomers</Text>
        {assignments.map((row) => (
          <Pressable
            key={row.assignment.id}
            style={styles.card}
            onPress={() => {
              setSelectedId(row.person.id);
              setScreen('detail');
              setMsg('');
            }}
          >
            <Text style={styles.cardTitle}>{row.person.firstName} {row.person.lastName}</Text>
            <Text style={styles.muted}>{row.journey.journeyStatus}</Text>
          </Pressable>
        ))}
        <Pressable
          style={styles.btnSecondary}
          onPress={() => {
            mobileStore.logout();
            setScreen('login');
          }}
        >
          <Text style={styles.btnSecondaryText}>Sign out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F4F1EA' },
  container: { padding: 20, gap: 12 },
  brand: { color: '#0F3D2E', fontWeight: '800', fontSize: 16 },
  h1: { fontSize: 28, fontWeight: '800', color: '#1C1917' },
  h2: { marginTop: 10, fontSize: 18, fontWeight: '700', color: '#1C1917' },
  muted: { color: '#57534E' },
  input: {
    backgroundColor: '#FFFCF7',
    borderWidth: 1,
    borderColor: '#D6D0C4',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  area: { minHeight: 100, textAlignVertical: 'top' },
  btn: {
    backgroundColor: '#0F3D2E',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  btnSecondary: {
    borderWidth: 1,
    borderColor: '#0F3D2E',
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnSecondaryText: { color: '#0F3D2E', fontWeight: '700' },
  link: { color: '#1F6B4F', fontWeight: '600', marginTop: 4 },
  error: { color: '#9F1239', fontWeight: '600' },
  ok: { color: '#166534', fontWeight: '700' },
  card: {
    backgroundColor: '#FFFCF7',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#D6D0C4',
  },
  cardTitle: { fontSize: 18, fontWeight: '700' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: '#E8E2D6',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  chipOn: { backgroundColor: '#C45C26' },
  chipText: { color: '#1C1917', fontWeight: '600', fontSize: 12 },
});
