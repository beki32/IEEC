import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Avatar, Button, Chip, Field, H1, Muted, Screen, relativeTime } from '../../components/ui';
import { useMobileStore } from '../../hooks';
import { colors, radii } from '../../theme';

type Tab = 'notes' | 'tasks';

export function NotesTasksScreen() {
  const store = useMobileStore();
  const [tab, setTab] = useState<Tab>('notes');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const notes = store.notes();
  const tasks = store.tasks();

  return (
    <Screen>
      <H1>Notes & Tasks</H1>
      <Muted>Shared team meeting check-ins and checklist.</Muted>
      <View style={styles.row}>
        <Chip label="Meeting Notes" selected={tab === 'notes'} onPress={() => setTab('notes')} />
        <Chip label="Shared Tasks" selected={tab === 'tasks'} onPress={() => setTab('tasks')} />
      </View>

      {tab === 'notes' ? (
        <>
          <Field label="Title" value={title} onChangeText={setTitle} placeholder="Check-in title" />
          <Field label="Note" value={body} onChangeText={setBody} multiline placeholder="What happened?" />
          <Button
            label="Add note"
            onPress={() => {
              if (!title.trim() || !body.trim()) return;
              store.addNote({ title: title.trim(), body: body.trim() });
              setTitle('');
              setBody('');
            }}
          />
          {notes.map((n) => {
            const author = store.getState().people.find((p) => p.id === n.authorPersonId)!;
            return (
              <View key={n.id} style={styles.card}>
                <Text style={styles.cardTitle}>{n.title}</Text>
                <Muted>{relativeTime(n.createdAt)}</Muted>
                <Text style={styles.body}>{n.body}</Text>
                <View style={styles.author}>
                  <Avatar firstName={author.firstName} lastName={author.lastName} size={28} />
                  <Muted>
                    {author.firstName} {author.lastName}
                  </Muted>
                </View>
              </View>
            );
          })}
        </>
      ) : (
        tasks.map((t) => (
          <Pressable key={t.id} style={styles.taskRow} onPress={() => store.toggleTask(t.id)}>
            <View style={[styles.check, t.done && styles.checkOn]}>
              {t.done ? <Text style={styles.checkMark}>✓</Text> : null}
            </View>
            <Text style={[styles.taskText, t.done && styles.taskDone]}>{t.title}</Text>
          </Pressable>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    padding: 14,
    gap: 6,
  },
  cardTitle: { fontWeight: '700', fontSize: 16, color: colors.ink },
  body: { color: colors.inkSoft, lineHeight: 20 },
  author: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    padding: 14,
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: { backgroundColor: colors.brand, borderColor: colors.brand },
  checkMark: { color: colors.white, fontWeight: '800', fontSize: 12 },
  taskText: { flex: 1, fontWeight: '600', color: colors.ink },
  taskDone: { color: colors.mutedSoft, textDecorationLine: 'line-through' },
});
