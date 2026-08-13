import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import { announcements, CHURCH, upcomingEvents } from '../../content';
import { Button, EventRow, H2, Screen, SectionLabel } from '../../components/ui';
import { colors, radii, space } from '../../theme';
import type { PublicStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<PublicStackParamList, 'PublicHome'>;

export function HomeScreen({ navigation }: Props) {
  const featured = announcements.find((a) => a.featured) ?? announcements[0];

  return (
    <Screen style={{ paddingTop: 0, gap: space.lg }}>
      <ImageBackground
        source={{
          uri: 'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=1200&q=80',
        }}
        style={styles.hero}
        imageStyle={styles.heroImg}
      >
        <View style={styles.heroTint}>
          <Text style={styles.heroBrand}>{CHURCH.name}</Text>
          <Text style={styles.heroTag}>{CHURCH.tagline}</Text>
          <View style={styles.heroActions}>
            <Button label="Join as a newcomer" onPress={() => navigation.navigate('RegisterDetails')} />
            <Button
              label="See upcoming events"
              variant="secondary"
              onPress={() => navigation.navigate('PublicEvents')}
            />
          </View>
        </View>
      </ImageBackground>

      <View style={styles.section}>
        <SectionLabel>Announcements</SectionLabel>
        <View style={styles.featured}>
          <Text style={styles.featuredTag}>FEATURED</Text>
          <Text style={styles.featuredTitle}>{featured.title}</Text>
          <Text style={styles.featuredBody}>{featured.body}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <H2>Upcoming events</H2>
        {upcomingEvents.map((e) => (
          <EventRow key={e.id} day={e.day} month={e.month} title={e.title} meta={`${e.time} · ${e.location}`} />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginHorizontal: -space.md,
    minHeight: 340,
    justifyContent: 'flex-end',
  },
  heroImg: { resizeMode: 'cover' },
  heroTint: {
    backgroundColor: colors.heroTint,
    padding: space.lg,
    paddingTop: 56,
    gap: space.sm,
  },
  heroBrand: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: -0.8,
  },
  heroTag: { color: '#D7E8E0', fontSize: 16, marginBottom: space.sm },
  heroActions: { gap: 10, marginTop: space.sm },
  section: { gap: space.sm },
  featured: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    padding: space.md,
    gap: 8,
  },
  featuredTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.brandSoft,
    color: colors.brand,
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.8,
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  featuredTitle: { fontSize: 18, fontWeight: '700', color: colors.ink },
  featuredBody: { color: colors.muted, lineHeight: 21 },
});
