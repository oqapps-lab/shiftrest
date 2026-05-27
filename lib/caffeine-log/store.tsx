/**
 * Caffeine logger — records "I just had coffee" taps so the caffeine
 * cutoff displayed on Home/Plan reflects reality, not a static estimate.
 *
 * Cutoff math: lastCup + 6h (default), clamped not to exceed 22:00.
 * If user opted out of caffeine (cupsPerDay=0), the logger is hidden.
 *
 * Stored only for the current local day. Resets at midnight.
 */

import { useEffect, useState } from 'react';
import { DeviceEventEmitter } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'shiftrest:caffeine-log:v1';
const EVT = 'caffeine-log:changed';

interface LogEntry {
  /** YYYY-MM-DD local */
  date: string;
  /** ISO datetime string of the most recent log within `date`. */
  lastCupAt: string;
  /** Cumulative cup count for the day so user can see what they've had. */
  cups: number;
}

let memCache: LogEntry | null = null;
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
      const parsed = JSON.parse(raw) as LogEntry;
      // Discard old days
      if (parsed.date === localDateKey()) {
        memCache = parsed;
      }
    }
  } catch {
    // ignore corrupt blob
  }
  hydrated = true;
}

void hydrate();

export function getCaffeineLog(): LogEntry | null {
  // Auto-expire across midnight
  if (memCache && memCache.date !== localDateKey()) {
    memCache = null;
    void AsyncStorage.removeItem(STORAGE_KEY);
  }
  return memCache;
}

export function logCaffeine(): void {
  const now = new Date();
  const today = localDateKey(now);
  if (!memCache || memCache.date !== today) {
    memCache = { date: today, lastCupAt: now.toISOString(), cups: 1 };
  } else {
    memCache = { ...memCache, lastCupAt: now.toISOString(), cups: memCache.cups + 1 };
  }
  void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(memCache));
  DeviceEventEmitter.emit(EVT);
}

export function clearCaffeineLog(): void {
  memCache = null;
  void AsyncStorage.removeItem(STORAGE_KEY);
  DeviceEventEmitter.emit(EVT);
}

export function useCaffeineLog(): LogEntry | null {
  const [snap, setSnap] = useState<LogEntry | null>(getCaffeineLog());
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(EVT, () => setSnap(getCaffeineLog()));
    return () => sub.remove();
  }, []);
  return snap;
}

/** Returns the recommended cutoff (in fractional local hours, e.g. 19.5)
 *  given the last cup time. Default rule: lastCup + 6h, clamped to 22:00.
 *  Returns null if no log entry today. */
export function caffeineCutoffFromLog(): number | null {
  const log = getCaffeineLog();
  if (!log) return null;
  const last = new Date(log.lastCupAt);
  // Same day cutoff
  const cutoff = last.getHours() + last.getMinutes() / 60 + 6;
  return Math.min(cutoff, 22);
}
