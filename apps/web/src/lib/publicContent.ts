export interface ChurchAnnouncement {
  id: string;
  title: string;
  body: string;
  publishedAt: string;
  pinned?: boolean;
}

export interface SermonOrDevotional {
  id: string;
  title: string;
  speaker: string;
  kind: 'sermon' | 'devotional';
  /** YouTube watch URL or embeddable URL */
  mediaUrl: string;
  publishedAt: string;
  summary: string;
}

export interface PrayerRequest {
  id: string;
  name: string;
  email: string | null;
  request: string;
  isPrivate: boolean;
  createdAt: string;
  status: 'received' | 'praying' | 'closed';
}

export interface InstagramPost {
  id: string;
  caption: string;
  imageUrl: string;
  permalink: string;
  postedAt: string;
}

export const CHURCH_ABOUT = {
  name: 'IEEC Young Adults',
  tagline: 'A home to belong, grow, and serve together.',
  story:
    'IEEC YA is the young adult community of International Evangelical Ethiopian Church. We gather to worship Jesus, build honest friendships, and walk with people through every season of faith.',
  beliefs: [
    {
      title: 'Scripture',
      body: 'The Bible is our authority for faith and life — we teach it plainly and apply it practically.',
    },
    {
      title: 'Gospel',
      body: 'Salvation is by grace through faith in Jesus Christ, not by works, status, or background.',
    },
    {
      title: 'Community',
      body: 'We grow best together — newcomers are welcomed, known, and walked with in Follow-Up.',
    },
  ],
  ministries: [
    {
      name: 'Follow-Up',
      body: 'Personal care for newcomers so no one walks alone after their first visit.',
    },
    {
      name: 'Bible Study',
      body: 'Small groups that open Scripture and build friendships through the week.',
    },
    {
      name: 'Worship & Media',
      body: 'Music, tech, and storytelling that help the whole community encounter God.',
    },
  ],
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[\d\s()+.-]{7,20}$/;

export function validateRequiredName(value: string, label: string): string | null {
  const v = value.trim();
  if (!v) return `${label} is required.`;
  if (v.length < 2) return `${label} must be at least 2 characters.`;
  return null;
}

export function validateEmail(value: string): string | null {
  const v = value.trim();
  if (!v) return 'Email is required.';
  if (!EMAIL_RE.test(v)) return 'Enter a valid email address.';
  return null;
}

export function validateOptionalEmail(value: string): string | null {
  const v = value.trim();
  if (!v) return null;
  if (!EMAIL_RE.test(v)) return 'Enter a valid email address.';
  return null;
}

export function validatePhone(value: string): string | null {
  const v = value.trim();
  if (!v) return 'Phone is required.';
  if (!PHONE_RE.test(v)) return 'Enter a valid phone number.';
  return null;
}

export function validatePrayerRequest(value: string): string | null {
  const v = value.trim();
  if (!v) return 'Prayer request is required.';
  if (v.length < 10) return 'Please share at least a short request (10+ characters).';
  return null;
}

export function youtubeEmbedUrl(mediaUrl: string): string | null {
  try {
    const u = new URL(mediaUrl);
    if (u.hostname.includes('youtu.be')) {
      const id = u.pathname.replace('/', '');
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (u.hostname.includes('youtube.com')) {
      const id = u.searchParams.get('v');
      if (id) return `https://www.youtube.com/embed/${id}`;
      const parts = u.pathname.split('/');
      const embedIdx = parts.indexOf('embed');
      if (embedIdx >= 0 && parts[embedIdx + 1]) {
        return `https://www.youtube.com/embed/${parts[embedIdx + 1]}`;
      }
    }
  } catch {
    return null;
  }
  return null;
}
