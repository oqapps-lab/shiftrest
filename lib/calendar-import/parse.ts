/**
 * Minimal .ics parser — extracts VEVENT entries we care about for shift
 * import. Not a full RFC5545 implementation; covers DTSTART/DTEND/SUMMARY
 * + simple unfold-by-CRLF + matching of common single-day events.
 */

export interface IcsEvent {
  /** Local YYYY-MM-DD. */
  date: string;
  /** Local HH:MM 24h, null if all-day event. */
  startTime: string | null;
  endTime: string | null;
  summary: string;
  /** Heuristic derived: 'day' / 'night' / 'off' based on summary keywords. */
  shiftType: 'day' | 'night' | 'off';
}

/** Unfold long lines (lines starting with whitespace continue the previous). */
function unfold(raw: string): string {
  return raw.replace(/\r?\n[ \t]/g, '');
}

/** Parse ICS-style date or datetime into local YYYY-MM-DD + HH:MM. */
function parseDateTimeValue(value: string): { date: string; time: string | null } {
  // DATE-only: YYYYMMDD
  if (/^\d{8}$/.test(value)) {
    return {
      date: `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`,
      time: null,
    };
  }
  // DATE-TIME local: YYYYMMDDTHHMMSS
  const localMatch = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})\d{2}$/);
  if (localMatch) {
    return {
      date: `${localMatch[1]}-${localMatch[2]}-${localMatch[3]}`,
      time: `${localMatch[4]}:${localMatch[5]}`,
    };
  }
  // DATE-TIME UTC: YYYYMMDDTHHMMSSZ — convert to local
  const utcMatch = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})\d{2}Z$/);
  if (utcMatch) {
    const utcDate = new Date(
      Date.UTC(
        Number(utcMatch[1]),
        Number(utcMatch[2]) - 1,
        Number(utcMatch[3]),
        Number(utcMatch[4]),
        Number(utcMatch[5]),
      ),
    );
    const y = utcDate.getFullYear();
    const m = String(utcDate.getMonth() + 1).padStart(2, '0');
    const d = String(utcDate.getDate()).padStart(2, '0');
    const hh = String(utcDate.getHours()).padStart(2, '0');
    const mm = String(utcDate.getMinutes()).padStart(2, '0');
    return { date: `${y}-${m}-${d}`, time: `${hh}:${mm}` };
  }
  return { date: '', time: null };
}

/** Classify summary text → day / night / off. */
export function classifyShiftType(summary: string): 'day' | 'night' | 'off' {
  // Word-boundary checks fail for non-ASCII (e.g. Cyrillic) — use plain
  // substring containment for keywords, which is sufficient for short
  // calendar summary text.
  const s = summary.toLowerCase();
  const hasAny = (needles: string[]): boolean => needles.some((n) => s.includes(n));
  if (hasAny(['night', 'ночь', 'ночн', 'nuit', 'noche', 'notte'])) return 'night';
  if (hasAny(['off', 'vacation', 'holiday', 'leave', 'выходн', 'repos'])) return 'off';
  if (hasAny(['day', 'morning', 'утренн', 'jour', 'día', 'giorno'])) return 'day';
  return 'day';
}

export function parseIcs(raw: string): IcsEvent[] {
  const unfolded = unfold(raw);
  const lines = unfolded.split(/\r?\n/);
  const events: IcsEvent[] = [];
  let current: Partial<IcsEvent> & { dtstart?: string; dtend?: string } = {};
  let inEvent = false;

  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      inEvent = true;
      current = {};
      continue;
    }
    if (line === 'END:VEVENT') {
      inEvent = false;
      if (current.dtstart) {
        const start = parseDateTimeValue(current.dtstart);
        const end = current.dtend ? parseDateTimeValue(current.dtend) : { date: '', time: null };
        if (start.date) {
          events.push({
            date: start.date,
            startTime: start.time,
            endTime: end.time,
            summary: current.summary ?? '',
            shiftType: classifyShiftType(current.summary ?? ''),
          });
        }
      }
      continue;
    }
    if (!inEvent) continue;

    // Property line: NAME[;params]:value
    const colon = line.indexOf(':');
    if (colon < 0) continue;
    const lhs = line.slice(0, colon);
    const value = line.slice(colon + 1);
    const propName = lhs.split(';')[0];

    if (propName === 'DTSTART') current.dtstart = value;
    else if (propName === 'DTEND') current.dtend = value;
    else if (propName === 'SUMMARY') current.summary = value;
  }

  return events;
}
