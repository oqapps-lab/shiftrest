/**
 * F20-P1 — Sleep Tips catalog.
 *
 * 28 curated tips written in our voice: short eyebrow, declarative
 * title, 1–2 sentence body with a research-backed mechanism. No
 * generic wellness fluff; every tip has either a citation or a
 * shift-worker rationale.
 *
 * `image` is left as a slug (e.g. "warm-socks") — the Tips screen
 * resolves it via the IMAGE_MAP below. Slugs are stable so the
 * MidJourney covers (when generated) plug in by changing one URL.
 *
 * Mock-first: shipped inline so the screen renders before any
 * Supabase migration. When the `sleep_tips` table lands, this
 * file becomes a fallback for offline / first-launch.
 */

export type TipCategory = 'environment' | 'nutrition' | 'pre_sleep' | 'mental' | 'post_shift';

export interface SleepTip {
  id: string;
  category: TipCategory;
  /** i18n key suffix: `tips.<id>.title` / `tips.<id>.body`. */
  i18nKey: string;
  /** Slug for the cover image. Empty → use category gradient placeholder. */
  image: string;
  /** Optional research citation, displayed under the card. */
  citation?: string;
  /** Optional profession filter — null = universal. */
  profession?: 'nurse' | 'firefighter' | 'factory' | null;
}

/** Master tip list. */
export const TIPS: SleepTip[] = [
  // ENVIRONMENT
  { id: 'warm_socks', category: 'environment', i18nKey: 'warm_socks', image: 'warm-socks', citation: 'Kräuchi et al., Nature 1999' },
  { id: 'weighted_blanket', category: 'environment', i18nKey: 'weighted_blanket', image: 'weighted-blanket', citation: 'Ekholm et al., J Clin Sleep Med 2020' },
  { id: 'blackout_curtains', category: 'environment', i18nKey: 'blackout_curtains', image: 'blackout-curtains', profession: 'nurse' },
  { id: 'cool_room', category: 'environment', i18nKey: 'cool_room', image: 'cool-bedroom', citation: 'Okamoto-Mizuno et al., 2012' },
  { id: 'phone_charger_outside', category: 'environment', i18nKey: 'phone_charger_outside', image: 'phone-outside' },
  { id: 'white_noise', category: 'environment', i18nKey: 'white_noise', image: 'white-noise', profession: 'firefighter' },
  { id: 'eye_mask_earplugs', category: 'environment', i18nKey: 'eye_mask_earplugs', image: 'eye-mask' },

  // NUTRITION
  { id: 'no_caffeine_after_2pm', category: 'nutrition', i18nKey: 'no_caffeine_after_2pm', image: 'coffee-cup', citation: 'Drake et al., J Clin Sleep Med 2013' },
  { id: 'tart_cherry_juice', category: 'nutrition', i18nKey: 'tart_cherry_juice', image: 'cherry-juice', citation: 'Pigeon et al., 2010' },
  { id: 'magnesium_glycinate', category: 'nutrition', i18nKey: 'magnesium_glycinate', image: 'magnesium', citation: 'Abbasi et al., 2012' },
  { id: 'valerian_root', category: 'nutrition', i18nKey: 'valerian_root', image: 'valerian', citation: 'Bent et al., Am J Med 2006' },
  { id: 'chamomile_tea', category: 'nutrition', i18nKey: 'chamomile_tea', image: 'chamomile' },
  { id: 'protein_breakfast', category: 'nutrition', i18nKey: 'protein_breakfast', image: 'eggs-breakfast' },
  { id: 'no_alcohol_pre_sleep', category: 'nutrition', i18nKey: 'no_alcohol_pre_sleep', image: 'no-alcohol', citation: 'Ebrahim et al., 2013' },

  // PRE-SLEEP RITUAL
  { id: 'walk_10min', category: 'pre_sleep', i18nKey: 'walk_10min', image: 'evening-walk' },
  { id: 'warm_shower', category: 'pre_sleep', i18nKey: 'warm_shower', image: 'warm-shower', citation: 'Haghayegh et al., Sleep Med Rev 2019' },
  { id: 'breathing_478', category: 'pre_sleep', i18nKey: 'breathing_478', image: 'breathing' },
  { id: 'dim_lights_1hr', category: 'pre_sleep', i18nKey: 'dim_lights_1hr', image: 'dim-lights' },
  { id: 'read_paper_book', category: 'pre_sleep', i18nKey: 'read_paper_book', image: 'paper-book' },
  { id: 'stretching_5min', category: 'pre_sleep', i18nKey: 'stretching_5min', image: 'stretching' },

  // MENTAL
  { id: 'worry_journal', category: 'mental', i18nKey: 'worry_journal', image: 'journal', citation: 'Scullin et al., 2018' },
  { id: 'gratitude_three', category: 'mental', i18nKey: 'gratitude_three', image: 'gratitude' },
  { id: 'cognitive_shuffle', category: 'mental', i18nKey: 'cognitive_shuffle', image: 'cognitive-shuffle', citation: 'Beaudoin, 2014' },
  { id: 'no_clock_watching', category: 'mental', i18nKey: 'no_clock_watching', image: 'no-clock' },

  // POST-SHIFT
  { id: 'sunglasses_commute', category: 'post_shift', i18nKey: 'sunglasses_commute', image: 'sunglasses', profession: 'nurse', citation: 'CDC NIOSH Shift Work Training' },
  { id: 'caffeine_pre_drive', category: 'post_shift', i18nKey: 'caffeine_pre_drive', image: 'pre-drive-coffee', profession: 'nurse' },
  { id: 'no_screens_30min', category: 'post_shift', i18nKey: 'no_screens_30min', image: 'no-phone' },
  { id: 'wind_down_with_tea', category: 'post_shift', i18nKey: 'wind_down_with_tea', image: 'tea-mug' },
];

/** Filter tips by profession (null returns universal + profession-tagged). */
export function tipsForProfession(prof: SleepTip['profession']): SleepTip[] {
  if (!prof) return TIPS.filter((t) => !t.profession);
  return TIPS.filter((t) => !t.profession || t.profession === prof);
}

/** Filter by category. */
export function tipsByCategory(cat: TipCategory): SleepTip[] {
  return TIPS.filter((t) => t.category === cat);
}

/** Look up a tip by id. */
export function tipById(id: string): SleepTip | null {
  return TIPS.find((t) => t.id === id) ?? null;
}
