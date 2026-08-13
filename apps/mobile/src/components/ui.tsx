import { ReactNode, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, initials, journeyBadge, radii, space, type } from '../theme';

export function Screen({
  children,
  scroll = true,
  style,
  edges,
}: {
  children: ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
  edges?: ('top' | 'right' | 'bottom' | 'left')[];
}) {
  const body = scroll ? (
    <ScrollView contentContainerStyle={[styles.screenPad, style]} keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.screenPad, styles.flex, style]}>{children}</View>
  );
  return (
    <SafeAreaView style={styles.safe} edges={edges ?? ['top', 'left', 'right']}>
      {body}
    </SafeAreaView>
  );
}

export function BrandTitle({ size = 'lg' }: { size?: 'lg' | 'sm' }) {
  return (
    <Text style={[styles.brand, size === 'sm' && { fontSize: 20 }]}>IEEC YA</Text>
  );
}

export function H1({ children }: { children: ReactNode }) {
  return <Text style={styles.h1}>{children}</Text>;
}

export function H2({ children }: { children: ReactNode }) {
  return <Text style={styles.h2}>{children}</Text>;
}

export function Muted({ children }: { children: ReactNode }) {
  return <Text style={styles.muted}>{children}</Text>;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  disabled?: boolean;
}) {
  const [pressed, setPressed] = useState(false);
  const tone =
    variant === 'primary'
      ? [styles.btnPrimary, pressed && styles.btnPrimaryPressed]
      : variant === 'secondary'
        ? [styles.btnSecondary, pressed && styles.btnSecondaryPressed]
        : variant === 'danger'
          ? [styles.btnDanger]
          : [styles.btnGhost];
  const textTone =
    variant === 'primary'
      ? styles.btnPrimaryText
      : variant === 'danger'
        ? styles.btnDangerText
        : styles.btnSecondaryText;
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[styles.btn, ...tone, disabled && { opacity: 0.5 }]}
    >
      <Text style={textTone}>{label}</Text>
    </Pressable>
  );
}

export function Field({
  label,
  error,
  ...props
}: TextInputProps & { label?: string; error?: string | null }) {
  return (
    <View style={styles.field}>
      {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.mutedSoft}
        style={[styles.input, error ? styles.inputError : null, props.multiline && styles.area]}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

export function Avatar({
  firstName,
  lastName,
  size = 40,
  tone = 'brand',
}: {
  firstName: string;
  lastName: string;
  size?: number;
  tone?: 'brand' | 'warm';
}) {
  const bg = tone === 'warm' ? '#FCE7F3' : colors.brandSoft;
  const fg = tone === 'warm' ? '#BE123C' : colors.brand;
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: bg }]}>
      <Text style={[styles.avatarText, { color: fg, fontSize: size * 0.36 }]}>
        {initials(firstName, lastName)}
      </Text>
    </View>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const b = journeyBadge(status);
  return (
    <View style={[styles.badge, { backgroundColor: b.bg }]}>
      <Text style={[styles.badgeText, { color: b.fg }]}>{b.label}</Text>
    </View>
  );
}

export function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && styles.chipOn]}>
      <Text style={[styles.chipText, selected && styles.chipTextOn]}>{label}</Text>
    </Pressable>
  );
}

export function ListRow({
  title,
  subtitle,
  right,
  onPress,
  left,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  left?: ReactNode;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.listRow} disabled={!onPress}>
      {left}
      <View style={styles.flex}>
        <Text style={styles.listTitle}>{title}</Text>
        {subtitle ? <Text style={styles.listSub}>{subtitle}</Text> : null}
      </View>
      {right}
    </Pressable>
  );
}

export function EventRow({
  day,
  month,
  title,
  meta,
}: {
  day: string;
  month: string;
  title: string;
  meta: string;
}) {
  return (
    <View style={styles.eventRow}>
      <View style={styles.dateBlock}>
        <Text style={styles.dateDay}>{day}</Text>
        <Text style={styles.dateMonth}>{month}</Text>
      </View>
      <View style={styles.flex}>
        <Text style={styles.listTitle}>{title}</Text>
        <Text style={styles.listSub}>{meta}</Text>
      </View>
    </View>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

export function BottomSheet({
  visible,
  onClose,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.sheetOverlay} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.grab} />
        {children}
      </View>
    </Modal>
  );
}

export function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  screenPad: { padding: space.md, paddingBottom: space.xl, gap: space.md },
  brand: { ...type.brand, color: colors.brandDeep },
  h1: { ...type.h1, color: colors.ink },
  h2: { ...type.h2, color: colors.ink, marginTop: space.sm },
  muted: { ...type.body, color: colors.muted },
  btn: {
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: { backgroundColor: colors.brand },
  btnPrimaryPressed: { backgroundColor: colors.brandPressed },
  btnPrimaryText: { color: colors.white, fontWeight: '700', fontSize: 16 },
  btnSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.brand,
  },
  btnSecondaryPressed: { backgroundColor: colors.brandSoft },
  btnSecondaryText: { color: colors.brand, fontWeight: '700', fontSize: 16 },
  btnGhost: { backgroundColor: 'transparent' },
  btnDanger: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.dangerBorder,
  },
  btnDangerText: { color: colors.danger, fontWeight: '700', fontSize: 16 },
  field: { gap: 6 },
  fieldLabel: { ...type.label, color: colors.inkSoft },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.ink,
  },
  inputError: { borderColor: colors.dangerBorder },
  area: { minHeight: 110, textAlignVertical: 'top' },
  error: { color: colors.danger, fontWeight: '600', fontSize: 12 },
  avatar: { alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: '700' },
  badge: {
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
  chip: {
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipOn: { backgroundColor: colors.brandSoft, borderColor: colors.brand },
  chipText: { color: colors.inkSoft, fontWeight: '600', fontSize: 13 },
  chipTextOn: { color: colors.brand },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    padding: 14,
  },
  listTitle: { fontSize: 16, fontWeight: '700', color: colors.ink },
  listSub: { fontSize: 13, color: colors.muted, marginTop: 2 },
  eventRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    padding: 12,
  },
  dateBlock: {
    width: 52,
    borderRadius: radii.sm,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    paddingVertical: 8,
  },
  dateDay: { fontSize: 18, fontWeight: '800', color: colors.brandDeep },
  dateMonth: { fontSize: 11, fontWeight: '700', color: colors.brand },
  sectionLabel: {
    ...type.caption,
    color: colors.mutedSoft,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: space.sm,
  },
  sheetOverlay: { flex: 1, backgroundColor: colors.overlay },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: space.md,
    paddingBottom: space.xl,
    gap: space.md,
    maxHeight: '80%',
  },
  grab: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.line,
    marginBottom: 4,
  },
});
