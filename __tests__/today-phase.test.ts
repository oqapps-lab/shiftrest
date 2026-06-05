/**
 * Unit tests for lib/today-phase.ts — the "Right now in your body" circadian
 * phase picker. Pure + deterministic, so we assert the exact phase key chosen
 * at representative wall-clock times across shift types.
 *
 * Covered (per G8-P0 acceptance):
 *  - night-shift nadir window (02:30–05:00)
 *  - in-sleep-window
 *  - wind-down (sleep opens within 90 min)
 *  - off-day default
 *  - missing/garbage data default (never crashes, never blank)
 */

import { phaseForNow, phaseFromShift, type PhaseArgs } from '../lib/today-phase';
import { suggestedPlanFromOnboarding } from '../lib/derive';

// derive.ts pulls t() only via month/weekday helpers we don't touch here,
// but suggestedPlanFromOnboarding is pure — still, mock i18n so importing
// derive never needs the real i18n stack.
jest.mock('../lib/i18n', () => ({
  t: (key: string): string => `[${key}]`,
}));

const dayPlan = suggestedPlanFromOnboarding('day', 'intermediate');
const nightPlan = suggestedPlanFromOnboarding('night', 'intermediate');

function args(partial: Partial<PhaseArgs> & Pick<PhaseArgs, 'nowHour' | 'shift'>): PhaseArgs {
  const plan = partial.plan ?? (partial.shift === 'night' ? nightPlan : dayPlan);
  return {
    plan,
    takesMelatonin: false,
    ...partial,
  };
}

describe('phaseForNow — sleep window', () => {
  test('day shift, 02:00 is inside the 23:00–07:00 window → sleep_window', () => {
    const r = phaseForNow(args({ nowHour: 2, shift: 'day' }));
    expect(r.key).toBe('sleep_window');
    expect(r.tone).toBe('dusk');
    expect(r.glyph).toBe('bed');
  });

  test('night shift, 12:00 is inside the 09:00–17:00 window → sleep_window', () => {
    const r = phaseForNow(args({ nowHour: 12, shift: 'night' }));
    expect(r.key).toBe('sleep_window');
  });
});

describe('phaseForNow — night nadir', () => {
  test('night shift at 03:30 → night_nadir with napMin param', () => {
    const r = phaseForNow(args({ nowHour: 3.5, shift: 'night' }));
    expect(r.key).toBe('night_nadir');
    expect(r.tone).toBe('sunrise');
    expect(r.params.napMin).toBeDefined();
  });

  test('day shift at 03:30 is NOT a nadir (it is sleep_window instead)', () => {
    const r = phaseForNow(args({ nowHour: 3.5, shift: 'day' }));
    expect(r.key).toBe('sleep_window');
  });

  test('nadir only fires 02:30–05:00 — 05:30 on nights is not nadir', () => {
    const r = phaseForNow(args({ nowHour: 5.5, shift: 'night' }));
    expect(r.key).not.toBe('night_nadir');
  });
});

describe('phaseForNow — wind-down', () => {
  test('day shift at 22:00 (sleep 23:00, 60 min away) → wind_down', () => {
    const r = phaseForNow(args({ nowHour: 22, shift: 'day' }));
    expect(r.key).toBe('wind_down');
    expect(r.params.mins).toBe('60');
    expect(r.glyph).toBe('moon');
  });

  test('wind-down with melatonin includes a melatonin param', () => {
    const r = phaseForNow(args({ nowHour: 22, shift: 'day', takesMelatonin: true }));
    expect(r.key).toBe('wind_down');
    expect(r.params.melatonin).toBeDefined();
  });

  test('uses the provided format() for melatonin time', () => {
    const r = phaseForNow(
      args({
        nowHour: 22,
        shift: 'day',
        takesMelatonin: true,
        format: () => 'NINE-THIRTY',
      }),
    );
    expect(r.params.melatonin).toBe('NINE-THIRTY');
  });
});

describe('phaseForNow — post-shift commute (night)', () => {
  test('night shift at 08:00 (sleep opens 09:00 — within 90m → wind_down, not commute)', () => {
    // At 08:00 the daytime sleep window (09:00) is 60 min away, so the
    // higher-precedence wind-down phase wins. Verify that boundary.
    const r = phaseForNow(args({ nowHour: 8, shift: 'night' }));
    expect(r.key).toBe('wind_down');
  });

  test('night shift at 06:00 (sleep opens 09:00, 3h away) → post_shift_commute', () => {
    const r = phaseForNow(args({ nowHour: 6, shift: 'night' }));
    expect(r.key).toBe('post_shift_commute');
    expect(r.glyph).toBe('sun');
  });
});

describe('phaseForNow — caffeine cutoff', () => {
  test('day shift at 12:30 (cutoff 14:00, ~1.5h away) → caffeine_cutoff_soon', () => {
    const r = phaseForNow(args({ nowHour: 12.5, shift: 'day' }));
    expect(r.key).toBe('caffeine_cutoff_soon');
    expect(r.params.caffeine).toBeDefined();
  });
});

describe('phaseForNow — defaults', () => {
  test('off day at 15:00 → rest_day calm default', () => {
    const plan = suggestedPlanFromOnboarding('off', 'intermediate');
    const r = phaseForNow({ nowHour: 15, shift: 'off', plan, takesMelatonin: false });
    expect(r.key).toBe('rest_day');
    expect(r.tone).toBe('calm');
  });

  test('day shift at 10:00 (nothing imminent) → on_track default with caffeine param', () => {
    const r = phaseForNow(args({ nowHour: 10, shift: 'day' }));
    expect(r.key).toBe('on_track');
    expect(r.params.caffeine).toBeDefined();
  });
});

describe('phaseForNow — missing / garbage data never crashes', () => {
  test('NaN nowHour → calm on_track default, no throw', () => {
    const r = phaseForNow(args({ nowHour: NaN, shift: 'day' }));
    expect(r.key).toBe('on_track');
    expect(r.tone).toBe('calm');
  });

  test('Infinity nowHour → calm on_track default', () => {
    const r = phaseForNow(args({ nowHour: Infinity, shift: 'day' }));
    expect(r.key).toBe('on_track');
  });

  test('every result returns the full i18n key set', () => {
    const r = phaseForNow(args({ nowHour: 15, shift: 'off', plan: suggestedPlanFromOnboarding('off', null) }));
    expect(r.eyebrowKey).toBe('today.now_phase.eyebrow');
    expect(r.titleKey).toContain('today.now_phase.');
    expect(r.bodyKey).toContain('today.now_phase.');
    expect(typeof r.params).toBe('object');
  });
});

describe('phaseFromShift convenience builder', () => {
  test('derives the plan then picks the phase (night nadir at 03:00)', () => {
    const r = phaseFromShift(3, 'night', 'intermediate', false);
    expect(r.key).toBe('night_nadir');
  });

  test('respects plan overrides (custom sleepStart shifts the window)', () => {
    // Override sleepStart to 14:00 so 13:30 lands in the wind-down window.
    const r = phaseFromShift(13.5, 'day', 'intermediate', false, { sleepStart: 14 });
    expect(r.key).toBe('wind_down');
  });
});
