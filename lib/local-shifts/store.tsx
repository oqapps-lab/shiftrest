/**
 * Anonymous-user local shifts — AsyncStorage-backed, no provider.
 *
 * Signed-in users have shifts in Supabase via useShifts(). Anon users
 * have no backend, so this module keeps their Add-shift entries on
 * device so the Schedule calendar dots can reflect their input (I1 fix).
 *
 * Schema: Record<YYYY-MM-DD, 'day' | 'night' | 'off'>.
 */

import { useEffect, useState } from 'react';
import { DeviceEventEmitter } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { emitChange, EVENTS } from '../queries';

export type LocalShiftKind = 'day' | 'night' | 'off';
export type LocalShiftMap = Record<string, LocalShiftKind>;

const STORAGE_KEY = 'shiftrest:local-shifts:v1';

let memCache: LocalShiftMap = {};
let hydrated = false;
let hydratingPromise: Promise<void> | null = null;

async function hydrate(): Promise<void> {
  if (hydrated) return;
  if (hydratingPromise) return hydratingPromise;
  hydratingPromise = (async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) memCache = JSON.parse(raw) as LocalShiftMap;
    } catch {
      // ignore corrupt blob
    }
    hydrated = true;
  })();
  return hydratingPromise;
}

void hydrate();

export function getLocalShifts(): LocalShiftMap {
  return memCache;
}

export function setLocalShift(iso: string, kind: LocalShiftKind): void {
  memCache = { ...memCache, [iso]: kind };
  void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(memCache));
  emitChange(EVENTS.shiftsChanged);
}

export function clearLocalShifts(): void {
  memCache = {};
  void AsyncStorage.removeItem(STORAGE_KEY);
  emitChange(EVENTS.shiftsChanged);
}

/** Remove a single date's local shift entry. */
export function removeLocalShift(iso: string): void {
  if (!(iso in memCache)) return;
  const next = { ...memCache };
  delete next[iso];
  memCache = next;
  void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(memCache));
  emitChange(EVENTS.shiftsChanged);
}

/**
 * React hook returning the current local-shifts map. Re-renders when
 * EVENTS.shiftsChanged fires.
 */
export function useLocalShifts(): LocalShiftMap {
  const [snapshot, setSnapshot] = useState<LocalShiftMap>(memCache);

  useEffect(() => {
    let active = true;
    void hydrate().then(() => {
      if (active) setSnapshot({ ...memCache });
    });

    const sub = DeviceEventEmitter.addListener(EVENTS.shiftsChanged, () => {
      if (active) setSnapshot({ ...memCache });
    });

    return () => {
      active = false;
      sub.remove();
    };
  }, []);

  return snapshot;
}
