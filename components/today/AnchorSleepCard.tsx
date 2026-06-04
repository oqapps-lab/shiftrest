/**
 * TODAY-8 — "Anchor Sleep" card for FAST-ROTATING schedules.
 *
 * The Today tab is otherwise schedule-agnostic: a 24/48 firefighter, a
 * continental factory worker, and a 3x12 nurse all see the same cards. But on
 * a fast rotation the body clock never fully adapts, so the right tool is an
 * ANCHOR SLEEP block — one fixed 4-hour window guarded EVERY day regardless of
 * shift type. That advice already exists on the Plan tab (buildFallbackRecs);
 * this surfaces the same `anchorSleepWindow()` block on Today, where the user
 * lives day-to-day.
 *
 * Anti-bloat: ONE card, and ONLY for fast-rotating schedules. For a plain
 * day/steady worker (no schedule set, scheduleId === null) the gate returns
 * false and the card renders nothing — it must NOT show for everyone.
 *
 * The card is purely presentational + self-gating: it reads the same
 * `isFastRotatingSchedule` / `anchorSleepWindow` helpers the Plan tab uses and
 * formats the window with `formatHourRange` so the time idiom matches Plan
 * exactly ("Protect 04:00 — 08:00 every day").
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Eyebrow, Text, GlassCard, Glyph } from '../ui';
import { colors, radii, spacing } from '../../constants/tokens';
import {
  isFastRotatingSchedule,
  anchorSleepWindow,
  formatHourRange,
} from '../../lib/derive';
import { t } from '../../lib/i18n';

interface AnchorSleepCardProps {
  /** Onboarding schedule template id; the card self-gates on it. */
  scheduleId: string | null | undefined;
}

export function AnchorSleepCard({ scheduleId }: AnchorSleepCardProps) {
  // Gate: only fast-rotating schedules get an anchor block. Steady day/night
  // workers (or anyone who hasn't picked a schedule yet) see nothing.
  if (!isFastRotatingSchedule(scheduleId)) return null;

  const window = anchorSleepWindow();
  // Match the Plan tab's time idiom exactly (formatHourRange → "04:00 — 08:00").
  const range = formatHourRange(window.startHour, window.endHour);

  return (
    <GlassCard variant="glass" padding="xxl" style={{ marginBottom: spacing.md }}>
      <View style={styles.row}>
        <View style={[styles.icon, { backgroundColor: colors.primaryContainer }]}>
          <Glyph name="bed" size={22} color="primary" />
        </View>
        <View style={{ flex: 1 }}>
          <Eyebrow>{t('today.anchor_sleep.eyebrow')}</Eyebrow>
          <Text
            variant="titleLg"
            family="display"
            weight="light"
            color="ink"
            style={{ marginTop: 2 }}
          >
            {t('today.anchor_sleep.title', { window: range })}
          </Text>
          <Text variant="bodyMd" color="inkSubtle" style={{ marginTop: 4 }}>
            {t('today.anchor_sleep.why')}
          </Text>
        </View>
      </View>
    </GlassCard>
  );
}

export default AnchorSleepCard;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
});
