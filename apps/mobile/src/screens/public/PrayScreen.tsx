import { useState } from 'react';
import { Alert, View } from 'react-native';
import { Button, Chip, Field, H1, Muted, Screen } from '../../components/ui';

/** Prayer UI is intentionally light — polish deferred. */
export function PrayScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [request, setRequest] = useState('');
  const [isPrivate, setPrivate] = useState(true);

  return (
    <Screen>
      <H1>Prayer Request</H1>
      <Muted>Share a request with the prayer team. Full polish comes next.</Muted>
      <Field label="Name" value={name} onChangeText={setName} placeholder="Your name" />
      <Field
        label="Email (optional)"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="you@email.com"
      />
      <Field
        label="Prayer request"
        value={request}
        onChangeText={setRequest}
        multiline
        placeholder="How can we pray?"
      />
      <View style={{ flexDirection: 'row' }}>
        <Chip
          label={isPrivate ? 'Private to prayer team' : 'Share with community'}
          selected={isPrivate}
          onPress={() => setPrivate((v) => !v)}
        />
      </View>
      <Button
        label="Send Prayer Request"
        onPress={() => {
          if (!name.trim() || !request.trim()) {
            Alert.alert('Missing details', 'Name and prayer request are required.');
            return;
          }
          Alert.alert('Received', 'Your prayer request was noted. Team polish comes next.');
          setName('');
          setEmail('');
          setRequest('');
        }}
      />
    </Screen>
  );
}
