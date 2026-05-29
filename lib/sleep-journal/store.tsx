/**
 * Sleep journal — one-tap morning rating. Local AsyncStorage; signed-in
 * sync layered on later.
 *
 * Each entry is keyed by YYYY-MM-DD so we get one rating per day. The
 * profile stats query counts non-null entries as a "logged day".
 */

import { useEffect, useState } from 'react';
import { DeviceEventEmitter } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type SleepRating = 'good' | 'ok' | 'bad';

interface JournalMap {
  /** Map of YYYY-MM-DD → rating. */
  entries: Record<string, SleepRating>;
}

const STORAGE_KEY = 'shiftrest:sleep-journal:v1';
const EVT = 'sleep-journal:changed';

let memCache: JournalMap = { entries: {} };
let hydrated = false;

function localDateKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

async function hydrate(): Promise<void> {
  if (hydrated) return;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) memCache = JSON.parse(raw) as JournalMap;
  } catch {
    // ignore corrupt blob
  }
  hydrated = true;
}

void hydrate();

export function getSleepJournal(): JournalMap {
  return memCache;
}

export function ratingForToday(): SleepRating | null {
  return memCache.entries[localDateKey()] ?? null;
}

export function setSleepRating(rating: SleepRating, date: Date = new Date()): void {
  const key = localDateKey(date);
  memCache = { entries: { ...memCache.entries, [key]: rating } };
  void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(memCache));
  DeviceEventEmitter.emit(EVT);
}

export function clearSleepRating(date: Date = new Date()): void {
  const key = localDateKey(date);
  const next = { ...memCache.entries };
  delete next[key];
  memCache = { entries: next };
  void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(memCache));
  DeviceEventEmitter.emit(EVT);
}

export function useSleepJournal(): JournalMap {
  const [snap, setSnap] = useState<JournalMap>(memCache);
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(EVT, () => setSnap({ entries: { ...memCache.entries } }));
    return () => sub.remove();
  }, []);
  return snap;
}

/** Count of total journaled days (across all time). */
export function journaledDayCount(): number {
  return Object.keys(memCache.entries).length;
}

/**
 * R7-1 — Local-only current streak.
 *
 * Consecutive days with ANY journal entry ending TODAY (or YESTERDAY
 * if today not yet logged). Returns 0 if today/yesterday both empty.
 *
 * Used by Profile + Today for anonymous users (signed-in users get
 * the authoritative streak from Supabase via useStreak()).
 */
export function localCurrentStreak(): number {
  const today = new Date();
  const todayKey = localDateKey(today);
  let streak = 0;
  // Allow yesterday-only streaks (user hasnt logged today yet)
  const startOffset = memCache.entries[todayKey] ? 0 : 1;
  if (startOffset === 1) {
    const yest = new Date(today);
    yest.setDate(today.getDate() - 1);
    if (!memCache.entries[localDateKey(yest)]) return 0;
  }
  for (let i = startOffset; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (memCache.entries[localDateKey(d)]) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

/**
 * F9 — Non-Judgmental Sleep Score.
 *
 * Computes a 0-100 score from the last 14 days of journal entries.
 * Scale is positive (never penalises daytime sleep, never compares to a
 * fixed bedtime). Returns null when too few entries to be meaningful
 * (need at least 3 logged days).
 *
 * Math: good=+2, ok=+1, bad=-1, empty=0. Sum capped to [0..max] where
 * max = entries * 2. Normalised to 0-100 ratio against max possible.
 */
export function weeklyAdaptScore(): number | null {
  const days = recentJournalDays(14);
  const logged = days.filter((d) => d.rating !== null);
  if (logged.length < 3) return null;
  const raw = logged.reduce((acc, d) => {
    if (d.rating === 'good') return acc + 2;
    if (d.rating === 'ok') return acc + 1;
    if (d.rating === 'bad') return acc - 1;
    return acc;
  }, 0);
  const maxPossible = logged.length * 2;
  // Map raw [-N..+2N] → [0..100] linearly. Bad week (all 'bad') = 0,
  // mixed = ~50, all great = 100.
  const normalised = ((raw + logged.length) / (maxPossible + logged.length)) * 100;
  return Math.round(Math.max(0, Math.min(100, normalised)));
}

/**
 * Last N days of journal entries (oldest → newest), each item carries the
 * rating or null when not logged. Drives the Profile heatmap.
 */
export function recentJournalDays(n = 14): { iso: string; rating: SleepRating | null }[] {
  const today = new Date();
  const out: { iso: string; rating: SleepRating | null }[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const iso = localDateKey(d);
    out.push({ iso, rating: memCache.entries[iso] ?? null });
  }
  return out;
}

/**
 * USER-BUG-9: last-7-days tally so the Today card can reveal visible
 * feedback after the user logs a mood. Returns counts (good/ok/bad)
 * + a trend symbol comparing this week vs. the 7 prior days. Null
 * when there's nothing logged yet (let the caller hide the row).
 */
export function weeklyTally(): { good: number; ok: number; bad: number; trend: 'up' | 'down' | 'flat' | null } | null {
  const last14 = recentJournalDays(14);
  const cur = last14.slice(7);
  const prev = last14.slice(0, 7);
  const score = (ds: { rating: SleepRating | null }[]) => ds.reduce((a, d) => {
    if (d.rating === 'good') return a + 2;
    if (d.rating === 'ok') return a + 1;
    if (d.rating === 'bad') return a - 1;
    return a;
  }, 0);
  const good = cur.filter((d) => d.rating === 'good').length;
  const ok = cur.filter((d) => d.rating === 'ok').length;
  const bad = cur.filter((d) => d.rating === 'bad').length;
  if (good + ok + bad === 0) return null;
  const prevLogged = prev.filter((d) => d.rating !== null).length;
  const trend = prevLogged === 0 ? null : score(cur) > score(prev) ? 'up' : score(cur) < score(prev) ? 'down' : 'flat';
  return { good, ok, bad, trend };
}
