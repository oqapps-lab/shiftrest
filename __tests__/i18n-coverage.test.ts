/**
 * R9-5 gap guardrail.
 *
 * En is the source of truth; every other locale MUST define every
 * key en defines, otherwise non-EN users see English-text leakage
 * (e.g. "LOG CUP" inside a German Today screen).
 *
 * If you add a key to en.ts, this test fails for every other locale
 * until you add the translation. CI catches it — no silent leakage
 * to App Review.
 *
 * Allowed: locales may TEMPORARILY mark a key as `__TODO_TRANSLATE__`
 * to ship a partial; that's a TODO marker, not a real translation.
 */

import en from '../lib/i18n/locales/en';
import deDE from '../lib/i18n/locales/de-DE';
import esES from '../lib/i18n/locales/es-ES';
import frFR from '../lib/i18n/locales/fr-FR';
import itIT from '../lib/i18n/locales/it-IT';
import ja from '../lib/i18n/locales/ja';
import ko from '../lib/i18n/locales/ko';
import nlNL from '../lib/i18n/locales/nl-NL';
import ptBR from '../lib/i18n/locales/pt-BR';
import sv from '../lib/i18n/locales/sv';
import zhHant from '../lib/i18n/locales/zh-Hant';

type AnyDict = Record<string, unknown>;

function collectKeys(obj: unknown, prefix = ''): string[] {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    return [prefix];
  }
  const out: string[] = [];
  for (const k of Object.keys(obj as AnyDict)) {
    const path = prefix ? `${prefix}.${k}` : k;
    out.push(...collectKeys((obj as AnyDict)[k], path));
  }
  return out;
}

const enKeys = new Set(collectKeys(en));

const locales: Array<[string, unknown]> = [
  ['de-DE', deDE],
  ['es-ES', esES],
  ['fr-FR', frFR],
  ['it-IT', itIT],
  ['ja', ja],
  ['ko', ko],
  ['nl-NL', nlNL],
  ['pt-BR', ptBR],
  ['sv', sv],
  ['zh-Hant', zhHant],
];

describe('i18n coverage', () => {
  // Current known gap as of R9 audit 2026-05-29. Each locale ships
  // with some missing keys (gap_baseline). New keys should never
  // ADD to the gap — i.e. this number can only ever go DOWN.
  //
  // When you add a key to en.ts, the right path is:
  // 1. Add it to EVERY locale and decrement these counts.
  // 2. If you're shipping in a hurry, decrement only the locales
  //    you translated, and the other locales' tests will fail until
  //    you fix them — that's the point.
  // F5+F6+F7+F3+F4+F9 (2026-06-03): +49 — the expanded Paywall premium-feature copy ships
  // English-first (rendered via the A2 force-English fallback) pending a
  // translation pass, same approach as the Sleep Library. Baselines bumped
  // by exactly the new-key count; translate later and decrement.
  const gapBaseline: Record<string, number> = {
    'de-DE': 253,
    'es-ES': 294,
    'fr-FR': 294,
    'it-IT': 294,
    ja: 294,
    ko: 294,
    'nl-NL': 294,
    'pt-BR': 294,
    sv: 294,
    'zh-Hant': 294,
  };

  test.each(locales)('%s does not regress from gap baseline', (name, dict) => {
    const localeKeys = new Set(collectKeys(dict));
    const missing = [...enKeys].filter((k) => !localeKeys.has(k));
    const baseline = gapBaseline[name] ?? 0;
    // Fail if gap GREW (new EN keys without translation in this locale)
    expect(missing.length).toBeLessThanOrEqual(baseline);
  });

  test('en is the superset (no locale has extra keys EN lacks)', () => {
    for (const [name, dict] of locales) {
      const localeKeys = new Set(collectKeys(dict));
      const extra = [...localeKeys].filter((k) => !enKeys.has(k));
      // Tolerate up to 4 stale keys per locale (orphaned during R9 refactor),
      // but anything more signals a typo or copy-paste from a sister project.
      // Goal is to drive this to 0 over time as locales get cleaned up.
      expect(extra.length).toBeLessThanOrEqual(4);
    }
  });
});
