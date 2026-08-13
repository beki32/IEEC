export const CHURCH = {
  name: 'IEEC YA',
  tagline: 'A place to belong, a people to grow.',
  story:
    'IEEC YA is the young adult community of International Evangelical Ethiopian Church. We gather to worship Jesus, build honest friendships, and walk with people through every season of faith.',
  beliefs: [
    { title: 'Scripture', body: 'The Bible is our authority for faith and life.' },
    { title: 'Gospel', body: 'Salvation is by grace through faith in Jesus Christ.' },
    { title: 'Community', body: 'Newcomers are welcomed, known, and walked with in Follow-Up.' },
  ],
  ministries: [
    { name: 'Follow-Up', body: 'Personal care so no one walks alone after their first visit.' },
    { name: 'Bible Study', body: 'Small groups that open Scripture and build friendships.' },
    { name: 'Worship & Media', body: 'Music and storytelling that help the community encounter God.' },
  ],
  instagram: '@ieec_youngadults',
};

export type Announcement = {
  id: string;
  title: string;
  body: string;
  featured?: boolean;
};

export type MediaItem = {
  id: string;
  title: string;
  speaker: string;
  kind: 'sermon' | 'devotional' | 'all';
  publishedAt: string;
  duration: string;
  summary: string;
};

export type EventItem = {
  id: string;
  title: string;
  day: string;
  month: string;
  time: string;
  location: string;
  startsAt: string;
};

export const announcements: Announcement[] = [
  {
    id: 'ann_1',
    title: 'Welcome to the New Season',
    body: 'Join us this Friday as we launch our new series on spiritual endurance and belonging.',
    featured: true,
  },
];

export const mediaItems: MediaItem[] = [
  {
    id: 'media_1',
    title: 'The Power of Faithful Endurance',
    speaker: 'Pastor Daniel',
    kind: 'sermon',
    publishedAt: 'Oct 20, 2024',
    duration: '38 min',
    summary: 'Featured message on staying rooted when life stretches you.',
  },
  {
    id: 'media_2',
    title: 'Morning Mercy',
    speaker: 'Ruth Desta',
    kind: 'devotional',
    publishedAt: 'Oct 18, 2024',
    duration: '8 min',
    summary: 'A short reflection for the start of your week.',
  },
  {
    id: 'media_3',
    title: 'Belonging in the Body',
    speaker: 'Pastor Daniel',
    kind: 'sermon',
    publishedAt: 'Oct 13, 2024',
    duration: '42 min',
    summary: 'Why community is not optional for young adults.',
  },
];

export const upcomingEvents: EventItem[] = [
  {
    id: 'evt_1',
    title: 'YA Friday Fellowship',
    day: '24',
    month: 'OCT',
    time: '7:00 PM',
    location: 'Youth Chapel',
    startsAt: '2024-10-24T19:00:00.000Z',
  },
  {
    id: 'evt_2',
    title: 'Saturday Program',
    day: '25',
    month: 'OCT',
    time: '5:00 PM',
    location: 'Main Sanctuary',
    startsAt: '2024-10-25T17:00:00.000Z',
  },
];
