import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { CHURCH } from '../../content';
import { Button, H1, ListRow, Screen, SectionLabel } from '../../components/ui';
import { colors } from '../../theme';
import type { PublicStackParamList, RootStackParamList } from '../../navigation/types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<PublicStackParamList, 'PublicMore'>;

export function MoreScreen({ navigation }: Props) {
  function openStaffSignIn() {
    let nav: { navigate: (name: keyof RootStackParamList) => void; getParent?: () => unknown } =
      navigation as unknown as NativeStackNavigationProp<RootStackParamList>;
    while (nav.getParent?.()) {
      nav = nav.getParent() as typeof nav;
    }
    nav.navigate('StaffSignIn');
  }

  return (
    <Screen>
      <H1>More</H1>
      <SectionLabel>About</SectionLabel>
      <ListRow
        title="Our Story"
        subtitle={CHURCH.story.slice(0, 72) + '…'}
        right={<Text style={styles.chev}>›</Text>}
        onPress={() => navigation.navigate('About')}
      />
      <ListRow
        title="What We Believe"
        right={<Text style={styles.chev}>›</Text>}
        onPress={() => navigation.navigate('Beliefs')}
      />
      <ListRow
        title="Our Ministries"
        right={<Text style={styles.chev}>›</Text>}
        onPress={() => navigation.navigate('Ministries')}
      />

      <SectionLabel>Connect</SectionLabel>
      <ListRow
        title={`Instagram ${CHURCH.instagram}`}
        right={<Text style={styles.chev}>›</Text>}
        onPress={() => Linking.openURL('https://instagram.com/ieec_youngadults')}
      />

      <SectionLabel>Account</SectionLabel>
      <ListRow
        title="Newcomer Registration"
        right={<Text style={styles.chev}>›</Text>}
        onPress={() => navigation.navigate('RegisterDetails')}
      />
      <View style={{ marginTop: 8 }}>
        <Button label="Staff Sign In" onPress={openStaffSignIn} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  chev: { color: colors.mutedSoft, fontSize: 22, fontWeight: '300' },
});
