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
