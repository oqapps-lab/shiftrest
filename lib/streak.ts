/**
 * TODAY-4 — Streak Freeze + loss-averse streak math.
 *
 * Shift workers can't always log every single day — a brutal night, a
 * back-to-back double, a sick kid. A pure consecutive-day streak resets to
 * zero on the FIRST missed day, which punishes exactly the audience we serve
 * and trains them to abandon the habit. The Streak Freeze absorbs one
 * unavoidable rough/missed day so a single gap no longer wipes the streak.
 *
 * This module has two halves:
 *  1. `resolveStreak` — a PURE, deterministic function. Given the last day
 *     the streak advanced, the stored streak value, "today", and how many
 *     freezes are available, it returns the streak as it should DISPLAY now,
 *     whether a freeze was consumed, and whether the streak is at-risk (a
 *     gap is forming that a freeze would cover). It NEVER throws and is
 *     side-effect free — it does not touch storage.
 *  2. A thin AsyncStorage layer (`shiftrest:streak-freezes:v1`) that grants
 *     2 freezes per calendar month, auto-refilling on month rollover, and a
 *     `consumeFreeze` mutation the display path calls when `resolveStreak`
 *     reports a freeze was used.
 *
 * The freeze is applied in the CLIENT display path (see app/(tabs)/index.tsx).
 * For signed-in users the streak is server-authoritative (Supabase
 * `sleep_streaks` row, updated by an insert-time RPC/trigger). The server RPC
 * is NOT freeze-aware yet, so on a 1-day gap the server may have already
 * reset current_streak to 0 by the time the client reads it. The client
 * adjustment below covers the DISPLAY case where the server still holds the
 * pre-gap value; full correctness for the server-reset case requires making
 * the Supabase RPC freeze-aware too (a DB migration — intentionally out of
 * scope for this task; tracked as a TODO at the call site).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Pure resolver ───────────────────────────────────────────────────────────

export interface ResolveStreakInput {
  /** YYYY-MM-DD of the last day the streak advanced (last logged day). */
  lastDateIso: string | null;
  /** Streak value as currently stored (server row or local derivation). */
  currentStreak: number;
  /** "Today" — defaults to now; pass a fixed Date in tests. */
  today?: Date;
  /** Freezes available to spend (0..N). */
  freezes: number;
}

export interface ResolveStreakResult {
  /** The streak value to DISPLAY now. */
  streak: number;
  /** True when this resolution consumed one freeze to keep the streak alive. */
  freezeConsumed: boolean;
  /**
   * True when the streak is alive but a gap is forming that WILL need a
   * freeze (or a log today) to survive — i.e. the user has not logged today
   * and the streak would be lost without action. Drives the loss-averse UI.
   */
  atRisk: boolean;
}

/** UTC-midnight epoch-day index for a YYYY-MM-DD string (calendar-day safe). */
function dayIndexFromIso(iso: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const ms = Date.UTC(y, mo - 1, d);
  if (Number.isNaN(ms)) return null;
  return Math.floor(ms / 86_400_000);
}

/** UTC-midnight epoch-day index for a Date, using its LOCAL calendar date. */
function dayIndexFromDate(d: Date): number {
  return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86_400_000);
}

/**
 * Resolve the displayed streak with freeze awareness. Deterministic.
 *
 * Rules (gap = today − lastDate, in whole calendar days):
 *  - no lastDate / streak ≤ 0      → { streak: max(0,currentStreak), atRisk:false }
 *  - gap = 0 (logged today)        → unchanged, not at risk
 *  - gap = 1 (logged yesterday)    → streak intact, AT RISK (log today to keep)
 *  - gap = 2, freezes > 0          → CONSUME one freeze, KEEP streak, AT RISK
 *  - gap = 2, no freeze            → reset to 0
 *  - gap ≥ 3                       → reset to 0
 *  - gap < 0 (lastDate in future)  → treat as logged today (clock skew safety)
 */
export function resolveStreak({
  lastDateIso,
  currentStreak,
  today = new Date(),
  freezes,
}: ResolveStreakInput): ResolveStreakResult {
  const safeStreak = Math.max(0, Math.floor(currentStreak || 0));
  if (!lastDateIso || safeStreak <= 0) {
    return { streak: safeStreak, freezeConsumed: false, atRisk: false };
  }
  const lastIdx = dayIndexFromIso(lastDateIso);
  if (lastIdx === null) {
    return { streak: safeStreak, freezeConsumed: false, atRisk: false };
  }
  const todayIdx = dayIndexFromDate(today);
  const gap = todayIdx - lastIdx;

  // Logged today (or clock skew put lastDate ahead) → nothing at risk.
  if (gap <= 0) {
    return { streak: safeStreak, freezeConsumed: false, atRisk: false };
  }
  // Logged yesterday → streak alive, but today is unlogged → at risk.
  if (gap === 1) {
    return { streak: safeStreak, freezeConsumed: false, atRisk: true };
  }
  // Exactly one missed day → a freeze can absorb it and keep the streak.
  if (gap === 2) {
    if (freezes > 0) {
      return { streak: safeStreak, freezeConsumed: true, atRisk: true };
    }
    return { streak: 0, freezeConsumed: false, atRisk: false };
  }
  // Two or more missed days → freeze covers only ONE day; streak resets.
  return { streak: 0, freezeConsumed: false, atRisk: false };
}

// ─── Freeze allowance (AsyncStorage, 2 per calendar month) ───────────────────

export const FREEZE_STORAGE_KEY = 'shiftrest:streak-freezes:v1';
export const FREEZES_PER_MONTH = 2;

export interface FreezeLedger {
  /** Calendar month this ledger applies to, 'YYYY-MM'. */
  month: string;
  /** Freezes already used this month. */
  used: number;
}

/** Local 'YYYY-MM' for a Date (calendar month, device-local). */
export function monthKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

/**
 * Normalise a (possibly stale or corrupt) ledger against the current month.
 * Pure — refills `used` to 0 when the stored month differs from `now`.
 */
export function normalizeLedger(raw: FreezeLedger | null, now: Date = new Date()): FreezeLedger {
  const mk = monthKey(now);
  if (!raw || raw.month !== mk || typeof raw.used !== 'number' || raw.used < 0) {
    return { month: mk, used: 0 };
  }
  return { month: mk, used: Math.min(raw.used, FREEZES_PER_MONTH) };
}

/** Freezes still available this month from a ledger. Pure. */
export function availableFromLedger(ledger: FreezeLedger): number {
  return Math.max(0, FREEZES_PER_MONTH - ledger.used);
}

async function readLedger(now: Date = new Date()): Promise<FreezeLedger> {
  try {
    const raw = await AsyncStorage.getItem(FREEZE_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as FreezeLedger) : null;
    const normalized = normalizeLedger(parsed, now);
    // Persist the refill so callers see a stable month on next read.
    if (!parsed || parsed.month !== normalized.month) {
      await AsyncStorage.setItem(FREEZE_STORAGE_KEY, JSON.stringify(normalized));
    }
    return normalized;
  } catch {
    return normalizeLedger(null, now);
  }
}

/** Read freezes available this month (refills lazily on month rollover). */
export async function getAvailableFreezes(now: Date = new Date()): Promise<number> {
  const ledger = await readLedger(now);
  return availableFromLedger(ledger);
}

/**
 * Consume one freeze for the current month. Returns the freezes REMAINING
 * after consumption. No-op (returns current remaining) when none are left.
 * Call this only after `resolveStreak` reports `freezeConsumed: true`.
 */
export async function consumeFreeze(now: Date = new Date()): Promise<number> {
  const ledger = await readLedger(now);
  if (availableFromLedger(ledger) <= 0) {
    return 0;
  }
  const next: FreezeLedger = { month: ledger.month, used: ledger.used + 1 };
  try {
    await AsyncStorage.setItem(FREEZE_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // best-effort; if persistence fails the display still kept the streak
  }
  return availableFromLedger(next);
}
