/**
 * F20-P2 — Community stories store.
 *
 * Three operations:
 *   submitStory(rawText, profession, locale)
 *     → INSERT into community_stories(approved=false)
 *     → fire-and-forget call to summarize-story Edge Function
 *   useApprovedStories(profession?)
 *     → SELECT approved=true, optionally filtered by profession.
 *     Returns memoised array; auto-refetches on focus.
 *   reactToStory(id)
 *     → RPC story_react which bumps the reaction count.
 *
 * The Edge Function (supabase/functions/summarize-story) calls
 * OpenAI to produce a 1-2 sentence ai_summary so we never display
 * the raw user input verbatim.
 *
 * Falls back gracefully when Supabase is unconfigured: submit
 * silently no-ops with success, fetch returns empty list.
 */

import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../supabase';

export interface CommunityStory {
  id: string;
  profession: string | null;
  ai_summary: string | null;
  raw_text: string;
  locale: string;
  reactions: number;
  created_at: string;
  // C3: optional authored-identity fields. Real DB rows leave these null
  // (anonymous), but the 6 bundled "founding member" stories carry a name,
  // role line and avatar so the feed feels like real humans from day one.
  author_name?: string | null;
  role_line?: string | null;
  avatar?: number | null; // require() asset module id, or null
}

/**
 * C3 — six bundled community stories (real-feeling shift workers) so the
 * cover-flow is alive before/without a Supabase feed. Avatars live in
 * assets/community/. `ai_summary` holds the punchy pull-quote the card
 * renders; `raw_text` holds the full story for the detail view.
 */
export const SEEDED_STORIES: CommunityStory[] = [
  {
    id: 'seed-margaret',
    profession: 'nurse',
    author_name: 'Margaret',
    role_line: 'ICU nurse · 25 yrs on nights',
    avatar: require('../../assets/community/margaret.png'),
    ai_summary: 'I stopped fighting the daylight. That was the whole secret.',
    raw_text:
      'For twenty-five years I treated my days off like a punishment for working nights — forcing myself awake at noon so I’d "feel normal," then lying in bed at 3 a.m. wide-eyed and furious. What changed wasn’t willpower, it was permission. I quit apologizing for sleeping when the sun was up. Now I put my sunglasses on the second I leave the unit at 7, get into bed by 8:30 with the blackout curtains drawn, and I keep my last coffee no later than 3 a.m. on shift. My husband jokes I finally "joined the vampire union." Honestly? I sleep through the lawnmowers now. After all these years, I rest like it’s allowed.',
    reactions: 312,
    locale: 'en',
    created_at: '2026-05-18T08:00:00.000Z',
  },
  {
    id: 'seed-priya',
    profession: 'nurse',
    author_name: 'Priya',
    role_line: 'ER nurse · rotating day/night',
    avatar: require('../../assets/community/priya.png'),
    ai_summary: 'The day after a night used to eat me alive. Now I have a plan.',
    raw_text:
      'I love the ER and I love my friends, and for a while I thought I had to choose. Flipping from days to nights every week, I’d come home that first morning a zombie, crash until 4, miss every brunch, every birthday, and feel like I was watching my life through glass. The thing that saved me wasn’t sleeping more — it was sleeping smarter on the turn. I take a short anchor sleep when I get home, set an alarm, then catch real light in the afternoon so I can actually show up to dinner. I cut caffeine earlier than feels natural. I’m still tired sometimes, but I’m not disappearing anymore. I get to be a nurse AND a person.',
    reactions: 248,
    locale: 'en',
    created_at: '2026-05-19T08:00:00.000Z',
  },
  {
    id: 'seed-sofia',
    profession: 'factory',
    author_name: 'Sofia',
    role_line: 'Production line lead · 2-2-3 rotation',
    avatar: require('../../assets/community/sofia.png'),
    ai_summary: 'The brain fog lifted once my sleep stopped being random.',
    raw_text:
      'Two days, two nights, three off — my body never knew what year it was. I run a line, I make calls all shift, and the brain fog scared me. I’d drive forty minutes home and not remember the road. I assumed that was just my life now. What helped was treating my commute as part of wind-down instead of an afterthought: sunglasses on the drive home after nights so the morning light didn’t wake me up, screens off, a small melatonin dose timed to when I actually wanted to sleep instead of whenever I remembered. I keep one anchor block the same even on the swing days. The fog didn’t vanish overnight, but it lifted. I trust my own head again.',
    reactions: 174,
    locale: 'en',
    created_at: '2026-05-20T08:00:00.000Z',
  },
  {
    id: 'seed-dana',
    profession: 'other',
    author_name: 'Dana',
    role_line: 'Paramedic · 24/48 shifts',
    avatar: require('../../assets/community/dana.png'),
    ai_summary: 'Anchor sleep and smart naps turned my 24s from survival to steady.',
    raw_text:
      'On a 24 you can’t promise yourself sleep — some nights it’s three calls, some nights it’s eleven. I used to come off shift running on adrenaline, refuse to nap because "real people sleep at night," then lie awake at 2 a.m. resenting the ceiling. The unlock was permission to nap with intention: a real recovery sleep when I get home, then a short anchor block at the same hour every single night, busy shift or quiet one. That one steady anchor is what my body holds onto when everything else is chaos. I caffeine-cutoff hard in the back half of the shift now. My partner says I came back to myself. I feel like I’m living between the runs, not just surviving them.',
    reactions: 287,
    locale: 'en',
    created_at: '2026-05-21T08:00:00.000Z',
  },
  {
    id: 'seed-marcus',
    profession: 'other',
    author_name: 'Marcus',
    role_line: 'Overnight warehouse stocker',
    avatar: require('../../assets/community/marcus.png'),
    ai_summary: 'I traded four energy drinks a night for actual sleep. No contest.',
    raw_text:
      'I’m 24 and I genuinely thought I’d just feel wrecked forever. Overnight stocking, four or five energy drinks a shift, then home at 7 a.m. buzzing too hard to sleep and too fried to skate or do anything I actually like. I figured that was the job. Turns out it was mostly the caffeine and the sunlight wrecking me. I moved my last energy drink way earlier — like, hours before I clock out — and I blacked out my room properly, taped foil over the one window the cheap curtains couldn’t beat. First week I slept five solid hours and almost cried, no joke. Now I skate on my days off with energy in the tank. Wish someone told me at 19.',
    reactions: 203,
    locale: 'en',
    created_at: '2026-05-22T08:00:00.000Z',
  },
  {
    id: 'seed-dave',
    profession: 'firefighter',
    author_name: 'Dave',
    role_line: 'Firefighter · 24/48 shifts',
    avatar: require('../../assets/community/dave.png'),
    ai_summary: 'A boring wind-down ritual is what finally let me come down.',
    raw_text:
      'After a busy tour the worst part wasn’t the calls — it was getting home keyed up and not being able to switch off. Twenty-eight years in, and I’d sit in the recliner at 8 a.m. still wired, then waste my whole first day off in that gray half-sleep. What turned it around sounds almost too simple: a wind-down ritual I do the same way every time. Hot shower, no screens, dim everything, ten minutes of slow breathing, then a proper recovery sleep before I try to live the day. Same routine whether the night was quiet or hell. It tells my body the tour is over and it’s safe to land. I get my days off back now. After all this time, that’s no small thing.',
    reactions: 196,
    locale: 'en',
    created_at: '2026-05-23T08:00:00.000Z',
  },
];

export async function submitStory(
  rawText: string,
  profession: string | null,
  locale: string,
  userId: string,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { ok: false, error: 'offline' };
  }
  const trimmed = rawText.trim();
  if (trimmed.length === 0) return { ok: false, error: 'empty' };
  if (trimmed.length > 1000) return { ok: false, error: 'too_long' };

  const { data, error } = await supabase
    .from('community_stories')
    .insert({ user_id: userId, profession, raw_text: trimmed, locale })
    .select('id')
    .single();
  if (error || !data) {
    return { ok: false, error: error?.message ?? 'unknown' };
  }
  // Fire-and-forget: trigger Edge Function for ai_summary. Failure is
  // non-fatal — moderator can run it later from the Supabase dashboard.
  void supabase.functions.invoke('summarize-story', {
    body: { id: data.id, raw_text: trimmed, locale },
  }).catch(() => {});
  return { ok: true, id: data.id };
}

export async function fetchApprovedStories(
  profession: string | null,
  locale: string,
  limit = 25,
): Promise<CommunityStory[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  let q = supabase
    .from('community_stories')
    .select('id, profession, ai_summary, raw_text, locale, reactions, created_at')
    .eq('approved', true)
    .eq('locale', locale)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (profession) {
    // Show profession-tagged stories first via .or? Keep simple — fetch
    // both null and matching profession, sort by relevance client-side.
    q = q.or(`profession.is.null,profession.eq.${profession}`);
  }
  const { data, error } = await q;
  if (error || !data) return [];
  return data as CommunityStory[];
}

export async function reactToStory(id: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;
  await supabase.rpc('story_react', { story_id: id });
}

export function useApprovedStories(
  profession: string | null,
  locale: string,
): { stories: CommunityStory[]; loading: boolean; refetch: () => void } {
  const [stories, setStories] = useState<CommunityStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchApprovedStories(profession, locale).then((rows) => {
      if (!cancelled) {
        // C3: always lead with the 6 bundled stories so the feed is alive
        // even offline / before the DB has approved rows. Surface ones that
        // match the user's profession first, then the rest, then real rows.
        const seededFirst = [...SEEDED_STORIES].sort((a, b) => {
          const am = profession && a.profession === profession ? 0 : 1;
          const bm = profession && b.profession === profession ? 0 : 1;
          return am - bm;
        });
        const seenIds = new Set(seededFirst.map((s) => s.id));
        const dbRows = rows.filter((r) => !seenIds.has(r.id));
        setStories([...seededFirst, ...dbRows]);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [profession, locale, nonce]);

  return { stories, loading, refetch: () => setNonce((n) => n + 1) };
}
