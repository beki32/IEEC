import { StyleSheet, Text, View } from 'react-native';
import { CHURCH } from '../../content';
import { H1, Muted, Screen, SectionLabel } from '../../components/ui';
import { colors, radii } from '../../theme';

export function AboutScreen() {
  return (
    <Screen>
      <H1>Our Story</H1>
      <Muted>{CHURCH.story}</Muted>
    </Screen>
  );
}

export function BeliefsScreen() {
  return (
    <Screen>
      <H1>What We Believe</H1>
      {CHURCH.beliefs.map((b) => (
        <View key={b.title} style={styles.card}>
          <Text style={styles.title}>{b.title}</Text>
          <Text style={styles.body}>{b.body}</Text>
        </View>
      ))}
    </Screen>
  );
}

export function MinistriesScreen() {
  return (
    <Screen>
      <H1>Our Ministries</H1>
      <SectionLabel>Serving together</SectionLabel>
      {CHURCH.ministries.map((m) => (
        <View key={m.name} style={styles.card}>
          <Text style={styles.title}>{m.name}</Text>
          <Text style={styles.body}>{m.body}</Text>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    padding: 14,
    gap: 6,
  },
  title: { fontWeight: '700', color: colors.ink, fontSize: 16 },
  body: { color: colors.muted, lineHeight: 21 },
});
