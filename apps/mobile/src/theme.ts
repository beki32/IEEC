/** Figma — IEEC YA Connect design tokens */
export const colors = {
  ink: '#0B1F18',
  inkSoft: '#1A2E26',
  muted: '#5C6B64',
  mutedSoft: '#8A9690',
  line: '#D7E0DB',
  lineSoft: '#E8EEEA',
  bg: '#F4F7F5',
  card: '#FFFFFF',
  brand: '#0B6E4F',
  brandPressed: '#14916A',
  brandSoft: '#E6F4EE',
  brandDeep: '#004D40',
  danger: '#8B1E1E',
  dangerBorder: '#B42318',
  warningBg: '#FEF3C7',
  warningText: '#92400E',
  badgeNew: '#DC2626',
  badgeProgress: '#0B6E4F',
  badgeMuted: '#6B7280',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(11, 31, 24, 0.45)',
  heroTint: 'rgba(0, 40, 32, 0.72)',
};

export const radii = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  pill: 999,
};

export const space = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
};

export const type = {
  brand: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.5 },
  h1: { fontSize: 26, fontWeight: '700' as const, letterSpacing: -0.4 },
  h2: { fontSize: 20, fontWeight: '700' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  label: { fontSize: 13, fontWeight: '600' as const },
  caption: { fontSize: 12, fontWeight: '500' as const },
};

export function journeyBadge(status: string): { label: string; bg: string; fg: string } {
  switch (status) {
    case 'awaiting_assignment':
    case 'duplicate_review_required':
      return { label: 'UNASSIGNED', bg: '#FEE2E2', fg: colors.badgeNew };
    case 'assigned':
      return { label: 'FIRST CONTACT', bg: colors.brandSoft, fg: colors.brand };
    case 'active_follow_up':
      return { label: 'IN PROGRESS', bg: colors.brandSoft, fg: colors.brand };
    case 'membership_approval_in_progress':
      return { label: 'CONNECTED', bg: '#DCFCE7', fg: '#166534' };
    case 'completed':
      return { label: 'COMPLETED', bg: '#E5E7EB', fg: colors.badgeMuted };
    default:
      return { label: 'NEW', bg: '#FEE2E2', fg: colors.badgeNew };
  }
}

export function initials(first: string, last: string) {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}
