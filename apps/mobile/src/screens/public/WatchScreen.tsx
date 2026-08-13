import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { mediaItems } from '../../content';
import { Chip, H1, Muted, Screen, SectionLabel } from '../../components/ui';
import { colors, radii, space } from '../../theme';

type Filter = 'all' | 'sermon' | 'devotional';

export function WatchScreen() {
  const [filter, setFilter] = useState<Filter>('all');
  const items = useMemo(
    () => mediaItems.filter((m) => filter === 'all' || m.kind === filter),
    [filter],
  );
  const featured = items[0];

  return (
    <Screen>
      <H1>Watch</H1>
      <Muted>Sermons and devotionals from IEEC YA.</Muted>
      <View style={styles.row}>
        <Chip label="All" selected={filter === 'all'} onPress={() => setFilter('all')} />
        <Chip label="Sermons" selected={filter === 'sermon'} onPress={() => setFilter('sermon')} />
        <Chip label="Devotionals" selected={filter === 'devotional'} onPress={() => setFilter('devotional')} />
      </View>

      {featured ? (
        <View style={styles.featured}>
          <View style={styles.thumb}>
            <Text style={styles.play}>▶</Text>
          </View>
          <Text style={styles.title}>{featured.title}</Text>
          <Text style={styles.meta}>
            {featured.speaker} · {featured.publishedAt}
          </Text>
        </View>
      ) : null}

      <SectionLabel>Recent</SectionLabel>
      {items.slice(1).map((m) => (
        <View key={m.id} style={styles.rowCard}>
          <View style={styles.thumbSm}>
            <Text style={styles.playSm}>▶</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.titleSm}>{m.title}</Text>
            <Text style={styles.meta}>
              {m.kind === 'sermon' ? 'Sermon' : 'Devotional'} · {m.speaker}
            </Text>
            <Text style={styles.meta}>{m.duration}</Text>
          </View>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  featured: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    overflow: 'hidden',
    gap: 8,
    paddingBottom: space.md,
  },
  thumb: {
    height: 180,
    backgroundColor: colors.brandDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  play: { color: colors.white, fontSize: 36 },
  title: { fontSize: 18, fontWeight: '700', color: colors.ink, paddingHorizontal: space.md },
  meta: { color: colors.muted, fontSize: 13, paddingHorizontal: space.md },
  rowCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    padding: 12,
    alignItems: 'center',
  },
  thumbSm: {
    width: 72,
    height: 56,
    borderRadius: radii.sm,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playSm: { color: colors.white, fontSize: 16 },
  titleSm: { fontWeight: '700', color: colors.ink, fontSize: 15 },
});
