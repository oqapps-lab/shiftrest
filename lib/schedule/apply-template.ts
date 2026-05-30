/**
 * Apply a rotation pattern (3×12, 24/48, continental, etc.) over N weeks
 * starting from a given date. Writes into the local shifts store for
 * anon users or Supabase shifts table for signed-in users.
 *
 * Cells in the preview pattern map to our two-or-three-kind shift types:
 *   'day' / 'night' / 'off'  → straight pass-through
 *   'shift24'                → 24h on-call = treat as 'night' (overnight)
 *   'shift48'                → first day 'day', second day 'night' (rough)
 */

import { mockScheduleTemplates } from '../../mock/user';
import { setLocalShift } from '../local-shifts/store';
import { supabase, isSupabaseConfigured } from '../supabase';

type CellKind = 'day' | 'night' | 'off';

function preview_cell_to_kind(cell: string, dayIdx: number): CellKind {
  if (cell === 'day' || cell === 'night' || cell === 'off') return cell;
  if (cell === 'shift24') return 'night';
  if (cell === 'shift48') return dayIdx % 2 === 0 ? 'day' : 'night';
  return 'off';
}

function localIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

interface ApplyOptions {
  /** YYYY-MM-DD local. Default = today. */
  startIso?: string;
  /** Default 4 weeks = 28 days. */
  weeks?: number;
  userId?: string | null;
}

export interface ApplyResult {
  inserted: number;
  skippedExisting: number;
  errored: number;
}

export async function applyScheduleTemplate(
  scheduleId: string,
  opts: ApplyOptions = {},
): Promise<ApplyResult> {
  const tpl = mockScheduleTemplates.find((t) => t.id === scheduleId);
  if (!tpl || tpl.preview.length === 0) {
    return { inserted: 0, skippedExisting: 0, errored: 0 };
  }
  const weeks = opts.weeks ?? 4;
  const total = weeks * 7;
  const startIso = opts.startIso ?? localIso(new Date());
  const start = new Date(startIso + 'T00:00:00');

  // For each day in the window, find the cell in the preview that day maps to.
  const rows: { iso: string; kind: CellKind }[] = [];
  for (let i = 0; i < total; i++) {
    const cell = tpl.preview[i % tpl.preview.length];
    const kind = preview_cell_to_kind(cell, i);
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    rows.push({ iso: localIso(d), kind });
  }

  // Anon path: write to local store.
  if (!isSupabaseConfigured || !supabase || !opts.userId) {
    for (const r of rows) setLocalShift(r.iso, r.kind);
    return { inserted: rows.length, skippedExisting: 0, errored: 0 };
  }

  // Signed-in path: bulk insert into Supabase. Skip days already populated.
  // R19/R-2 TODO: this SELECT-then-INSERT races against concurrent applies.
  // Once migration 20260530000002_shifts_unique_index_r19.sql is APPLIED in
  // prod (adds UNIQUE partial index on shifts(user_id,date) WHERE deleted_at
  // IS NULL), switch the `.insert(inserts)` below to
  // `.upsert(inserts, { onConflict: 'user_id,date', ignoreDuplicates: true })`
  // and drop the read-filter. Do NOT switch before the index is live —
  // onConflict with no matching index throws and breaks schedule-apply.
  const isoList = rows.map((r) => r.iso);
  const { data: existing } = await supabase
    .from('shifts')
    .select('date')
    .eq('user_id', opts.userId)
    .gte('date', isoList[0])
    .lte('date', isoList[isoList.length - 1])
    .is('deleted_at', null);

  const existingSet = new Set((existing ?? []).map((r) => (r as { date: string }).date));
  const newRows = rows.filter((r) => !existingSet.has(r.iso));

  if (newRows.length === 0) {
    return { inserted: 0, skippedExisting: rows.length, errored: 0 };
  }

  // Build start/end times — 07-19 for day, 19-07 for night, no row for off.
  const inserts = newRows
    .filter((r) => r.kind !== 'off')
    .map((r) => {
      const startAt = new Date(r.iso + 'T00:00:00');
      const endAt = new Date(r.iso + 'T00:00:00');
      if (r.kind === 'day') {
        startAt.setHours(7, 0, 0, 0);
        endAt.setHours(19, 0, 0, 0);
      } else {
        startAt.setHours(19, 0, 0, 0);
        endAt.setHours(7, 0, 0, 0);
        endAt.setDate(endAt.getDate() + 1);
      }
      return {
        user_id: opts.userId,
        date: r.iso,
        start_time: startAt.toISOString(),
        end_time: endAt.toISOString(),
        shift_type: r.kind,
        is_manual: false,
        notes: null,
      };
    });

  if (inserts.length === 0) {
    return { inserted: 0, skippedExisting: rows.length, errored: 0 };
  }

  const { error: insertErr } = await supabase.from('shifts').insert(inserts);
  if (insertErr) {
    return { inserted: 0, skippedExisting: 0, errored: inserts.length };
  }
  return {
    inserted: inserts.length,
    skippedExisting: rows.length - newRows.length,
    errored: 0,
  };
}
