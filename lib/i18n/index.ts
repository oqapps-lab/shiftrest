/**
 * i18n setup for ShiftRest. Auto-detects device locale, falls back to English.
 * Set SCREENSHOT_OVERRIDE to force a locale for ASO screenshot batches.
 *
 * Locales shipped: en (source), de-DE, es-ES, fr-FR, it-IT, ja, ko, nl-NL,
 * pt-BR, sv, zh-Hant. en-GB falls back to en.
 */
import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';

import en from './locales/en';
import deDE from './locales/de-DE';
import esES from './locales/es-ES';
import frFR from './locales/fr-FR';
import itIT from './locales/it-IT';
import ja from './locales/ja';
import ko from './locales/ko';
import nlNL from './locales/nl-NL';
import ptBR from './locales/pt-BR';
import sv from './locales/sv';
import zhHant from './locales/zh-Hant';

/**
 * Force a specific locale for screenshot batches. Empty string = use device.
 * Set to e.g. 'de-DE' before running an ASO capture run, restart Metro with
 * --clear, capture screens.
 */
export const SCREENSHOT_OVERRIDE: string = '';

const i18n = new I18n({
  en,
  'en-US': en,
  'en-GB': en,
  de: deDE,
  'de-DE': deDE,
  es: esES,
  'es-ES': esES,
  fr: frFR,
  'fr-FR': frFR,
  it: itIT,
  'it-IT': itIT,
  ja,
  ko,
  nl: nlNL,
  'nl-NL': nlNL,
  pt: ptBR,
  'pt-BR': ptBR,
  sv,
  zh: zhHant,
  'zh-Hant': zhHant,
  'zh-TW': zhHant,
  'zh-HK': zhHant,
  // QA-1 fix: i18n-js fallback derivation only walks the language portion
  // (ru-US → ru). When neither is registered, it shows "[missing X]" instead
  // of defaulting to defaultLocale. Russian translation isn't shipped yet,
  // so explicitly point ru* at en. Same trick for any other locale a
  // Russian-region user might surface (ru-US shows up on dev devices set
  // to Russian language + US region).
  ru: en,
  'ru-RU': en,
  'ru-US': en,
  'ru-BY': en,
  'ru-KZ': en,
});

i18n.enableFallback = true;
i18n.defaultLocale = 'en';

function deviceLocale(): string {
  try {
    const locales = Localization.getLocales();
    return locales[0]?.languageTag || 'en';
  } catch {
    return 'en';
  }
}

i18n.locale = SCREENSHOT_OVERRIDE || deviceLocale();

if (__DEV__) {
  // Single-line debug marker the capture script can grep
  console.log('[i18n] locale =', i18n.locale, '| sample =', i18n.t('welcome.hero'));
}

export const t = (key: string, opts?: Record<string, unknown>): string =>
  i18n.t(key, opts) as string;

export default i18n;
