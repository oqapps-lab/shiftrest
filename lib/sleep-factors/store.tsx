/**
 * TODAY-10 — Reflective factor tags (parallel store).
 *
 * The rating journal (lib/sleep-journal/store.tsx) keys YYYY-MM-DD → a
 * qualitative string ('good' | 'ok' | 'bad'). The hours ledger
 * (lib/sleep-hours/store.tsx) keys YYYY-MM-DD → a number. Both are read by
 * many downstream consumers and must NOT change shape.
 *
 * This SEPARATE, fully-optional store captures the reflective "what affected
 * it?" factor tags: YYYY-MM-DD → string[] (factor ids, e.g. ['blackout',
 * 'late_caffeine']). Absent / empty = nothing tagged for that day. Tagging is
 * independent of the rating and the hours — a user can rate without tagging,
 * tag without logging hours, or any combination.
 *
 * Mirrors the sleep-hours store pattern exactly: a hydrated in-memory cache, a
 * DeviceEventEmitter-backed subscribe hook, and write helpers that persist +
 * emit. Future signed-in sync can layer on the same way.
 */

import { useEffect, useState } from 'react';
import { DeviceEventEmitter } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FactorsMap {
  /** Map of YYYY-MM-DD → selected factor ids. */
  entries: Record<string, string[]>;
}

/**
 * The reflective factor catalog. Shift-worker-relevant, kept to a tight set so
 * the optional chip row stays compact (one line). `id` is the stable storage
 * key; `labelKey` is the i18n key for the chip + the week-summary insight line.
 * Edit here once — both the Today chips and WeekInSleepCard read this list.
 */
export const SLEEP_FACTORS: { id: string; labelKey: string }[] = [
  { id: 'blackout', labelKey: 'today.factors.blackout' },
  { id: 'late_caffeine', labelKey: 'today.factors.late_caffeine' },
  { id: 'noise', labelKey: 'today.factors.noise' },
  { id: 'kids', labelKey: 'today.factors.kids' },
  { id: 'wound_down', labelKey: 'today.factors.wound_down' },
];

/** Resolve a factor id → its i18n label key, or null when unknown. */
export function factorLabelKey(id: string): string | null {
  return SLEEP_FACTORS.find((f) => f.id === id)?.labelKey ?? null;
}

const STORAGE_KEY = 'shiftrest:sleep-factors:v1';
const EVT = 'sleep-factors:changed';

let memCache: FactorsMap = { entries: {} };
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
      const parsed = JSON.parse(raw) as Partial<FactorsMap>;
      // Defensive: only keep arrays of non-empty strings — guards a corrupt
      // blob from poisoning the correlate math (which trusts what it reads).
      const clean: Record<string, string[]> = {};
      for (const [k, v] of Object.entries(parsed.entries ?? {})) {
        if (Array.isArray(v)) {
          const ids = v.filter((x): x is string => typeof x === 'string' && x.length > 0);
          if (ids.length > 0) clean[k] = ids;
        }
      }
      memCache = { entries: clean };
    }
  } catch {
    // ignore corrupt blob
  }
  hydrated = true;
}

void hydrate();

export function getSleepFactors(): FactorsMap {
  return memCache;
}

/** Factor ids tagged for a given ISO date (YYYY-MM-DD); [] when none. */
export function factorsForDate(dateIso: string): string[] {
  return memCache.entries[dateIso] ?? [];
}

/** Factor ids tagged for today; [] when none. */
export function factorsForToday(): string[] {
  return memCache.entries[localDateKey()] ?? [];
}

/**
 * Set the full list of factor ids for a date (defaults to today). Pass [] to
 * clear the day. Duplicate ids are de-duped; empty/blank ids dropped. Future-
 * dated entries are silently ignored to mirror the rating journal's R17/A2
 * guard. An empty resulting list removes the day's key entirely.
 */
export function setSleepFactors(ids: string[], date: Date = new Date()): void {
  const today = new Date();
  if (date > today) return;
  const key = localDateKey(date);
  const cleaned = Array.from(
    new Set(ids.filter((x) => typeof x === 'string' && x.length > 0)),
  );
  const next = { ...memCache.entries };
  if (cleaned.length === 0) {
    delete next[key];
  } else {
    next[key] = cleaned;
  }
  memCache = { entries: next };
  void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(memCache));
  DeviceEventEmitter.emit(EVT);
}

/**
 * Toggle a single factor id on/off for a date (defaults to today). Returns the
 * resulting id list. Convenience over setSleepFactors for the multi-select
 * chip UI — read the current day, flip membership of `id`, write back.
 */
export function toggleSleepFactor(id: string, date: Date = new Date()): string[] {
  const key = localDateKey(date);
  const current = memCache.entries[key] ?? [];
  const next = current.includes(id)
    ? current.filter((x) => x !== id)
    : [...current, id];
  setSleepFactors(next, date);
  return next;
}

/** Count of days with at least one tagged factor (across all time). */
export function taggedFactorDayCount(): number {
  return Object.keys(memCache.entries).length;
}

/** Live snapshot of the factors ledger; re-renders on any write. */
export function useSleepFactors(): FactorsMap {
  const [snap, setSnap] = useState<FactorsMap>(memCache);
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(EVT, () =>
      setSnap({ entries: { ...memCache.entries } }),
    );
    return () => sub.remove();
  }, []);
  return snap;
}
