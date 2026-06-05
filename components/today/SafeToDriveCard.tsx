/**
 * TODAY-3 — "Safe-to-Drive" post-shift drowsy-driving self-check.
 *
 * A compact, calm self-check that appears ONLY in the post-shift commute
 * window (phase.key === 'post_shift_commute' — i.e. the user just finished a
 * night/long shift and is about to drive home, the 04:00–06:00-adjacent peak
 * for drowsy-driving crashes). It is wellness-framed advice and NEVER blocks
 * the app.
 *
 * Flow (max 2 taps):
 *   Q1 "How alert do you feel?"  → Wide awake / A bit foggy / Running on empty
 *   Q2 "Sleep before this shift?" → 7h+ / Under 6h   (optional second tap)
 * Answering Q1 already reveals a recommendation; Q2 sharpens it. Risk →
 * recommendation logic lives in the pure lib/safe-to-drive.ts classifier.
 *
 * Recommendations (wellness-framed, Glyph-led):
 *   low      → "Good — keep the light low and drive safe."
 *   elevated → "Nap 20 min", "Cold water + 100 mg caffeine 30 min before"
 *   high     → the above + "Consider a ride-share / wait it out"
 *
 * Persistence: a per-day flag in AsyncStorage
 * (`shiftrest:safe-to-drive:v1` → the YYYY-MM-DD it was last dismissed/answered)
 * suppresses the card for the rest of that day once the user engages or
 * dismisses it. It re-arms automatically on the next day's post-shift window.
 *
 * The parent (Today screen) already gates mounting on the commute window, so
 * this component owns only the per-day dismissed state + the 2-tap UI.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Eyebrow, Text, GlassCard, Glyph, type GlyphName } from '../ui';
import { colors, radii, spacing } from '../../constants/tokens';
import {
  classifyDriveRisk,
  type Alertness,
  type PreShiftSleep,
  type DriveRecKey,
} from '../../lib/safe-to-drive';
import { t } from '../../lib/i18n';

const STORE_KEY = 'shiftrest:safe-to-drive:v1';

/** Glyph per recommendation row. */
const REC_GLYPH: Record<DriveRecKey, GlyphName> = {
  good: 'check',
  nap: 'bed',
  caffeine: 'coffee',
  rideshare: 'calendar',
};

function localDayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

interface AlertOption {
  value: Alertness;
  labelKey: string;
}
const ALERT_OPTIONS: AlertOption[] = [
  { value: 'awake', labelKey: 'safe_to_drive.q1_awake' },
  { value: 'foggy', labelKey: 'safe_to_drive.q1_foggy' },
  { value: 'empty', labelKey: 'safe_to_drive.q1_empty' },
];

interface SleepOption {
  value: Exclude<PreShiftSleep, null>;
  labelKey: string;
}
const SLEEP_OPTIONS: SleepOption[] = [
  { value: '7plus', labelKey: 'safe_to_drive.q2_7plus' },
  { value: 'under6', labelKey: 'safe_to_drive.q2_under6' },
];

export function SafeToDriveCard() {
  // Per-day dismissed gate. `null` = still hydrating; once hydrated, the card
  // hides itself for the rest of the day if it was already engaged/dismissed.
  const [dismissedDay, setDismissedDay] = useState<string | null | undefined>(undefined);
  const [alertness, setAlertness] = useState<Alertness | null>(null);
  const [sleep, setSleep] = useState<PreShiftSleep>(null);

  // Hydrate the per-day dismissed flag once on mount.
  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(STORE_KEY)
      .then((raw) => {
        if (alive) setDismissedDay(raw);
      })
      .catch(() => {
        if (alive) setDismissedDay(null);
      });
    return () => {
      alive = false;
    };
  }, []);

  // Persist today's marker so the card stays hidden for the rest of the day.
  // Used both on dismiss and on first engagement (answering Q1 counts).
  const markDoneToday = useCallback(() => {
    const today = localDayKey();
    setDismissedDay(today);
    AsyncStorage.setItem(STORE_KEY, today).catch(() => null);
  }, []);

  const onPickAlertness = useCallback(
    (value: Alertness) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setAlertness(value);
    },
    [],
  );

  const onPickSleep = useCallback((value: Exclude<PreShiftSleep, null>) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSleep(value);
  }, []);

  const onDismiss = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    markDoneToday();
  }, [markDoneToday]);

  // Don't render until hydrated, and never if already engaged/dismissed today.
  if (dismissedDay === undefined) return null;
  if (dismissedDay === localDayKey()) return null;

  const assessment = alertness ? classifyDriveRisk(alertness, sleep) : null;

  return (
    <GlassCard variant="sunrise" padding="xxl" style={{ marginBottom: spacing.md }}>
      {/* Header: eyebrow + framing + dismiss affordance */}
      <View style={styles.headerRow}>
        <View style={[styles.icon, { backgroundColor: colors.surfaceLowest }]}>
          <Glyph name="pulse" size={22} color="sunriseDim" />
        </View>
        <View style={{ flex: 1 }}>
          <Eyebrow color="sunriseDim">{t('safe_to_drive.eyebrow')}</Eyebrow>
          <Text variant="bodyMd" color="ink" weight="medium" style={styles.framing}>
            {t('safe_to_drive.framing')}
          </Text>
        </View>
        <Pressable
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel={t('safe_to_drive.dismiss_a11y')}
          hitSlop={12}
          style={styles.dismissBtn}
        >
          <Glyph name="close" size={16} color="inkMuted" />
        </Pressable>
      </View>

      {/* Q1 — alertness (always shown) */}
      <Text variant="bodyMd" color="inkSubtle" weight="medium" style={styles.question}>
        {t('safe_to_drive.q1')}
      </Text>
      <View style={styles.optionRow}>
        {ALERT_OPTIONS.map((opt) => {
          const active = alertness === opt.value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => onPickAlertness(opt.value)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={t(opt.labelKey)}
              style={[
                styles.chip,
                { backgroundColor: active ? colors.sunriseDim : colors.surfaceLowest },
              ]}
            >
              <Text
                variant="labelMd"
                family="body"
                weight="medium"
                color={active ? 'surfaceLowest' : 'ink'}
                align="center"
              >
                {t(opt.labelKey)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Q2 — pre-shift sleep (revealed after Q1, optional) */}
      {alertness && (
        <>
          <Text variant="bodyMd" color="inkSubtle" weight="medium" style={styles.question}>
            {t('safe_to_drive.q2')}
          </Text>
          <View style={styles.optionRow}>
            {SLEEP_OPTIONS.map((opt) => {
              const active = sleep === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => onPickSleep(opt.value)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={t(opt.labelKey)}
                  style={[
                    styles.chip,
                    { backgroundColor: active ? colors.sunriseDim : colors.surfaceLowest },
                  ]}
                >
                  <Text
                    variant="labelMd"
                    family="body"
                    weight="medium"
                    color={active ? 'surfaceLowest' : 'ink'}
                    align="center"
                  >
                    {t(opt.labelKey)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </>
      )}

      {/* Recommendation block — revealed once Q1 is answered */}
      {assessment && (
        <View style={styles.recBlock}>
          <Text
            variant="labelMd"
            family="body"
            weight="medium"
            color="sunriseDim"
            uppercase
            style={styles.recHeading}
          >
            {t(`safe_to_drive.risk_${assessment.risk}`)}
          </Text>
          {assessment.recs.map((rec) => (
            <View key={rec} style={styles.recRow}>
              <View style={[styles.recIcon, { backgroundColor: colors.surfaceLowest }]}>
                <Glyph name={REC_GLYPH[rec]} size={16} color="ink" />
              </View>
              <Text variant="bodyMd" color="ink" style={styles.recText}>
                {t(`safe_to_drive.rec_${rec}`)}
              </Text>
            </View>
          ))}

          {/* Once engaged, offer to dismiss for the day so it doesn't nag. */}
          <Pressable
            onPress={onDismiss}
            accessibilityRole="button"
            accessibilityLabel={t('safe_to_drive.done')}
            hitSlop={8}
            style={styles.doneBtn}
          >
            <Text variant="labelMd" family="body" weight="medium" color="inkMuted" uppercase>
              {t('safe_to_drive.done')}
            </Text>
          </Pressable>
        </View>
      )}
    </GlassCard>
  );
}

export default SafeToDriveCard;

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  framing: {
    marginTop: 2,
  },
  dismissBtn: {
    width: 28,
    height: 28,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  question: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  optionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  chip: {
    flex: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recBlock: {
    marginTop: spacing.lg,
  },
  recHeading: {
    marginBottom: spacing.md,
  },
  recRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  recIcon: {
    width: 30,
    height: 30,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  recText: {
    flex: 1,
  },
  doneBtn: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
  },
});
