import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Button, Chip, Field, H1, Muted, Screen } from '../../components/ui';
import { useMobileStore } from '../../hooks';
import { colors, radii } from '../../theme';
import type { StaffStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<StaffStackParamList, 'Chat'>;

export function ChatScreen({ route }: Props) {
  const store = useMobileStore();
  const session = store.getSession()!;
  const contacts = store.myAssignments().map((a) => a.person);
  const [contactId, setContactId] = useState(route.params?.personId ?? contacts[0]?.id ?? '');
  const [text, setText] = useState('');
  const messages = contactId ? store.messagesFor(contactId) : [];
  const contact = contacts.find((c) => c.id === contactId) ?? store.getPersonBundle(contactId)?.person;

  return (
    <Screen scroll={false} style={{ paddingBottom: 8 }}>
      <H1>Chat</H1>
      {contact ? (
        <Muted>
          Conversation with {contact.firstName} {contact.lastName}
        </Muted>
      ) : (
        <Muted>Select an assigned contact to message.</Muted>
      )}
      <View style={styles.row}>
        {contacts.map((c) => (
          <Chip
            key={c.id}
            label={c.firstName}
            selected={contactId === c.id}
            onPress={() => setContactId(c.id)}
          />
        ))}
      </View>
      <FlatList
        style={{ flex: 1 }}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ gap: 8, paddingVertical: 8 }}
        ListEmptyComponent={<Muted>No messages yet.</Muted>}
        renderItem={({ item }) => {
          const mine = item.fromPersonId === session.person.id;
          return (
            <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
              <Text style={[styles.bubbleText, mine && { color: colors.white }]}>{item.text}</Text>
            </View>
          );
        }}
      />
      <Field
        value={text}
        onChangeText={setText}
        placeholder="Write a message"
        editable={!!contactId}
      />
      <Button
        label="Send"
        disabled={!contactId || !text.trim()}
        onPress={() => {
          store.sendMessage(contactId, text.trim());
          setText('');
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  bubble: {
    maxWidth: '82%',
    borderRadius: radii.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  mine: { alignSelf: 'flex-end', backgroundColor: colors.brand },
  theirs: { alignSelf: 'flex-start', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.lineSoft },
  bubbleText: { color: colors.ink, lineHeight: 20 },
});
