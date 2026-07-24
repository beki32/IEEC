import type { InstagramPost } from './publicContent';

/** Public Instagram handle (no @). Override with VITE_INSTAGRAM_HANDLE. */
export const INSTAGRAM_HANDLE =
  (import.meta.env.VITE_INSTAGRAM_HANDLE as string | undefined)?.replace(/^@/, '').trim() ||
  'ieecya';

export const INSTAGRAM_PROFILE_URL = `https://www.instagram.com/${INSTAGRAM_HANDLE}/`;
export const INSTAGRAM_EMBED_URL = `https://www.instagram.com/${INSTAGRAM_HANDLE}/embed`;

/**
 * Demo / fallback posts shown when live Graph API credentials are not configured.
 * Replace later with Instagram Graph API or a backend proxy.
 */
export function getDemoInstagramFeed(): InstagramPost[] {
  const base = INSTAGRAM_PROFILE_URL;
  return [
    {
      id: 'ig_1',
      caption: 'Saturday gathering — come as you are.',
      imageUrl:
        'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80',
      permalink: base,
      postedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: 'ig_2',
      caption: 'Young adults night: worship + conversation.',
      imageUrl:
        'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80',
      permalink: base,
      postedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    {
      id: 'ig_3',
      caption: 'Serving together in the city this month.',
      imageUrl:
        'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=800&q=80',
      permalink: base,
      postedAt: new Date(Date.now() - 9 * 86400000).toISOString(),
    },
    {
      id: 'ig_4',
      caption: 'Midweek devotion — short word, honest prayer.',
      imageUrl:
        'https://images.unsplash.com/photo-1507692049790-de15454be3ee?auto=format&fit=crop&w=800&q=80',
      permalink: base,
      postedAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    },
  ];
}
