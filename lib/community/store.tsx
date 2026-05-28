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
}

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
        setStories(rows);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [profession, locale, nonce]);

  return { stories, loading, refetch: () => setNonce((n) => n + 1) };
}
