/**
 * TODAY-9 — Sleep-hours ledger (parallel store).
 *
 * The rating journal (lib/sleep-journal/store.tsx) keys YYYY-MM-DD → a
 * qualitative string ('good' | 'ok' | 'bad'). Many readers depend on that
 * string shape (weeklyTally, recentJournalDays, streak resolvers, the Today
 * journal block, history). We must NOT change it.
 *
 * So the quantitative "hours slept" capture lives in this SEPARATE,
 * fully-optional store: YYYY-MM-DD → number (hours, e.g. 6.5). Absent = not
 * logged for that day (downstream debt math must ignore unlogged days, never
 * assume). Logging hours is independent of the rating — a user can rate
 * without logging hours, or both.
 *
 * Mirrors the sleep-journal store pattern exactly: a hydrated in-memory
 * cache, a DeviceEventEmitter-backed subscribe hook, and write helpers that
 * persist + emit. Future signed-in sync can layer on the same way.
 */

import { useEffect, useState } from 'react';
import { DeviceEventEmitter } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface HoursMap {
  /** Map of YYYY-MM-DD → hours slept (e.g. 6.5). */
  entries: Record<string, number>;
}

const STORAGE_KEY = 'shiftrest:sleep-hours:v1';
const EVT = 'sleep-hours:changed';

let memCache: HoursMap = { entries: {} };
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
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<HoursMap>;
      // Defensive: only keep finite, positive numbers — guards a corrupt blob
      // from poisoning the debt math (which trusts every value it reads).
      const clean: Record<string, number> = {};
      for (const [k, v] of Object.entries(parsed.entries ?? {})) {
        if (typeof v === 'number' && Number.isFinite(v) && v > 0) clean[k] = v;
      }
      memCache = { entries: clean };
    }
  } catch {
    // ignore corrupt blob
  }
  hydrated = true;
}

void hydrate();

export function getSleepHours(): HoursMap {
  return memCache;
}

/** Hours logged for a given ISO date (YYYY-MM-DD), or null when not logged. */
export function hoursForDate(dateIso: string): number | null {
  return memCache.entries[dateIso] ?? null;
}

/** Hours logged for today, or null when not logged. */
export function hoursForToday(): number | null {
  return memCache.entries[localDateKey()] ?? null;
}

/**
 * Log hours slept for a date (defaults to today). `hours` is the real
 * duration (bucket midpoints from the UI, e.g. 6.5). Non-positive or
 * non-finite values are dropped. Future-dated entries are silently dropped to
 * mirror the rating journal's R17/A2 guard.
 */
export function setSleepHours(hours: number, date: Date = new Date()): void {
  if (!Number.isFinite(hours) || hours <= 0) return;
  const today = new Date();
  if (date > today) return;
  const key = localDateKey(date);
  memCache = { entries: { ...memCache.entries, [key]: hours } };
  void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(memCache));
  DeviceEventEmitter.emit(EVT);
}

/** Remove a logged-hours entry (defaults to today). */
export function clearSleepHours(date: Date = new Date()): void {
  const key = localDateKey(date);
  const next = { ...memCache.entries };
  delete next[key];
  memCache = { entries: next };
  void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(memCache));
  DeviceEventEmitter.emit(EVT);
}

/** Count of days with a logged hours value (across all time). */
export function loggedHoursDayCount(): number {
  return Object.keys(memCache.entries).length;
}

/** Live snapshot of the hours ledger; re-renders on any write. */
export function useSleepHours(): HoursMap {
  const [snap, setSnap] = useState<HoursMap>(memCache);
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(EVT, () =>
      setSnap({ entries: { ...memCache.entries } }),
    );
    return () => sub.remove();
  }, []);
  return snap;
}
