import { StyleSheet, Text, View } from 'react-native';
import { H1, Muted, Screen, relativeTime } from '../../components/ui';
import { useMobileStore } from '../../hooks';
import { colors, radii } from '../../theme';

export function NotificationsScreen() {
  const store = useMobileStore();
  const items = store.notifications();

  return (
    <Screen>
      <H1>Notifications</H1>
      <Muted>Assignment alerts and registration updates.</Muted>
      {items.map((n) => (
        <View key={n.id} style={[styles.card, !n.read && styles.unread]}>
          <Text style={styles.title}>{n.title}</Text>
          <Text style={styles.body}>{n.body}</Text>
          <Muted>{relativeTime(n.createdAt)}</Muted>
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
    gap: 4,
  },
  unread: { borderColor: colors.brand, backgroundColor: colors.brandSoft },
  title: { fontWeight: '700', color: colors.ink },
  body: { color: colors.inkSoft },
});
