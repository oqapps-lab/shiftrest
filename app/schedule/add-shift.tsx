/**
 * S31 — Add shift (modal). Date+time wheel pickers, cross-day support
 * (a 24h on-call shift can legitimately span midnight), live summary
 * pinned right above the floating Save CTA.
 *
 * On Save: writes to local-shifts when off-day OR no Supabase, else
 * inserts into the shifts table with proper start/end timestamps.
 */

import React, { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  Screen,
  Eyebrow,
  HeroNumber,
  Text,
  PillCTA,
  TextField,
  GlassCard,
  Glyph,
  SegmentedControl,
  DateTimePickerField,
  type SegmentOption,
  showAppDialog,
} from '../../components/ui';
import { colors, radii, spacing } from '../../constants/tokens';
import { safeDismiss } from '../../lib/nav';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useAuth } from '../../lib/auth/store';
import { emitChange, EVENTS } from '../../lib/queries';
import { setLocalShift } from '../../lib/local-shifts/store';
import i18n, { t } from '../../lib/i18n';

type Kind = 'day' | 'night' | 'off';

const getKindOptions = (): SegmentOption<Kind>[] => [
  { value: 'day', label: t('shift_kind.day') },
  { value: 'night', label: t('shift_kind.night') },
  { value: 'off', label: t('shift_kind.off') },
];

interface Preset {
  id: string;
  labelKey: string;
  kind: 'day' | 'night';
  startHour: number;
  durationH: number;
}
const PRESETS: Preset[] = [
  { id: 'day-12', labelKey: 'add_shift.preset_day_12', kind: 'day', startHour: 7, durationH: 12 },
  { id: 'night-12', labelKey: 'add_shift.preset_night_12', kind: 'night', startHour: 19, durationH: 12 },
  { id: 'oncall-24', labelKey: 'add_shift.preset_oncall_24', kind: 'day', startHour: 8, durationH: 24 },
];

/** Local YYYY-MM-DD; do NOT use Date.toISOString here — UTC pulls the day
 *  back by one for any timezone east of UTC. */
function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function snapToTopOfHour(d: Date, hour: number): Date {
  const next = new Date(d);
  next.setHours(hour, 0, 0, 0);
  return next;
}

function durationLabel(startsAt: Date, endsAt: Date): string {
  const ms = endsAt.getTime() - startsAt.getTime();
  const totalMin = Math.round(ms / 60000);
  if (totalMin <= 0) return t('add_shift.duration_invalid');
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m === 0 ? t('add_shift.duration_h', { h }) : t('add_shift.duration_h_m', { h, m });
}

function formatSummary(kind: Kind, startsAt: Date, endsAt: Date): string {
  if (kind === 'off') return t('add_shift.summary_off');
  // R19/i18n-3: was hardcoded English month array. Use Intl.DateTimeFormat
  // with the active i18n.locale so non-EN users see localised month names.
  const dateFmt = new Intl.DateTimeFormat(i18n.locale, { day: 'numeric', month: 'short' });
  const fmt = (d: Date): string =>
    `${dateFmt.format(d)} · ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return `${fmt(startsAt)} → ${fmt(endsAt)}`;
}

export default function AddShift() {
  const { user } = useAuth();
  // H1: when tapped from calendar, the `iso` query param pre-fills the
  // start date so the user doesn't have to re-pick what they already
  // tapped. Fallback: today.
  const params = useLocalSearchParams<{ iso?: string }>();
  const isoParam = typeof params.iso === 'string' ? params.iso : null;

  const baseDate = isoParam
    ? new Date(isoParam + 'T00:00:00')
    : new Date();
  const [kind, setKind] = useState<Kind>('day');
  const [startsAt, setStartsAt] = useState<Date>(snapToTopOfHour(baseDate, 7));
  const [endsAt, setEndsAt] = useState<Date>(snapToTopOfHour(baseDate, 19));
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const applyPreset = (p: Preset) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const start = snapToTopOfHour(new Date(), p.startHour);
    const end = new Date(start.getTime() + p.durationH * 60 * 60 * 1000);
    setKind(p.kind);
    setStartsAt(start);
    setEndsAt(end);
  };

  const selectKind = (next: Kind) => {
    setKind(next);
    // When switching to a work kind from off, ensure we have valid times.
    if (next !== 'off' && endsAt <= startsAt) {
      setEndsAt(new Date(startsAt.getTime() + 12 * 60 * 60 * 1000));
    }
  };

  // Auto-fix when start gets pushed past end (cross-day shifts handled by
  // the user setting end on the next day; we just guarantee end > start).
  const onStartChange = (next: Date) => {
    setStartsAt(next);
    if (endsAt <= next) {
      setEndsAt(new Date(next.getTime() + 12 * 60 * 60 * 1000));
    }
  };

  const isOff = kind === 'off';
  const invalidDuration = !isOff && endsAt <= startsAt;
  const canSave = !invalidDuration && !submitting;

  const summary = formatSummary(kind, startsAt, endsAt);
  const dur = isOff ? '' : durationLabel(startsAt, endsAt);

  const onSave = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (kind === 'off' || !isSupabaseConfigured || !supabase || !user?.id) {
      const isoDate = localDateKey(startsAt);
      setLocalShift(isoDate, kind);
      emitChange(EVENTS.shiftsChanged);
      showAppDialog({
        title: t('add_shift.saved_title'),
        message: summary,
        actions: [{ label: t('add_shift.ok'), onPress: () => safeDismiss('/(tabs)/schedule') }],
      });
      return;
    }

    setSubmitting(true);
    const dateIso = localDateKey(startsAt);
    const { error } = await supabase.from('shifts').insert({
      user_id: user.id,
      date: dateIso,
      start_time: startsAt.toISOString(),
      end_time: endsAt.toISOString(),
      shift_type: kind,
      is_manual: true,
      notes: notes.trim() || null,
    });
    setSubmitting(false);

    if (error) {
      // R14-4: was leaking Supabase error.message into Alert body.
      if (__DEV__) console.warn('[add-shift]', error);
      showAppDialog({
        title: t('add_shift.save_failed_title'),
        message: t('add_shift.save_failed_body'),
        actions: [{ label: t('add_shift.ok') }],
      });
      return;
    }
    emitChange(EVENTS.shiftsChanged);
    showAppDialog({
      title: t('add_shift.saved_title'),
      message: summary,
      actions: [{ label: t('add_shift.ok'), onPress: () => safeDismiss('/(tabs)/schedule') }],
    });
  };

  return (
    <Screen
      orbs="subtle"
      scroll
      tabBarClearance={false}
      keyboardAvoiding
      footerClearance={220}
      floatingFooter={
        <View style={{ width: '100%' }}>
          {!isOff && (
            <GlassCard variant="paper" padding="lg" style={{ marginBottom: spacing.md }}>
              <Eyebrow>{t('add_shift.summary')}</Eyebrow>
              <Text
                variant="titleMd"
                family="display"
                weight="medium"
                color={invalidDuration ? 'coralDim' : 'ink'}
                style={{ marginTop: 2 }}
              >
                {summary}
              </Text>
              {!!dur && (
                <Text variant="bodyMd" color="inkSubtle" style={{ marginTop: 2 }}>
                  {dur}
                </Text>
              )}
            </GlassCard>
          )}
          <PillCTA
            variant="primary"
            label={submitting ? t('add_shift.saving') : t('add_shift.save')}
            disabled={!canSave}
            onPress={onSave}
          />
        </View>
      }
    >
      <View style={styles.headerRow}>
        <View style={{ width: 22 }} />
        <Eyebrow>{t('add_shift.eyebrow')}</Eyebrow>
        <Pressable
          onPress={() => safeDismiss('/(tabs)/schedule')}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={t('a11y.close')}
        >
          <Glyph name="close" size={22} color="inkMuted" />
        </Pressable>
      </View>

      <HeroNumber
        value={t('add_shift.hero')}
        size="md"
        style={{ marginTop: spacing.lg }}
      />
      <Text variant="bodyMd" color="inkSubtle" style={{ marginTop: spacing.md }}>
        {t('add_shift.sub')}
      </Text>

      {/* Quick presets */}
      <Eyebrow style={{ marginTop: spacing.huge, marginBottom: spacing.md }}>
        {t('add_shift.presets_label')}
      </Eyebrow>
      <View style={styles.presetRow}>
        {PRESETS.map((p) => (
          <Pressable
            key={p.id}
            onPress={() => applyPreset(p)}
            accessibilityRole="button"
            accessibilityLabel={t(p.labelKey)}
            style={styles.presetChip}
          >
            <Text
              variant="labelMd"
              family="body"
              weight="medium"
              color="ink"
              uppercase
            >
              {t(p.labelKey)}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Type */}
      <Eyebrow style={{ marginTop: spacing.xl, marginBottom: spacing.md }}>
        {t('add_shift.shift_type')}
      </Eyebrow>
      <SegmentedControl<Kind>
        options={getKindOptions()}
        value={kind}
        onChange={selectKind}
      />

      {/* Date+time pickers (hidden when type=off) */}
      {!isOff && (
        <View style={{ marginTop: spacing.xl }}>
          <DateTimePickerField
            label={t('add_shift.starts_label')}
            value={startsAt}
            onChange={onStartChange}
            accessibilityLabel={t('add_shift.starts_label')}
          />
          <DateTimePickerField
            label={t('add_shift.ends_label')}
            value={endsAt}
            onChange={setEndsAt}
            accessibilityLabel={t('add_shift.ends_label')}
          />
          {invalidDuration && (
            <Text variant="bodyMd" color="coralDim" style={{ marginTop: spacing.sm }}>
              {t('add_shift.duration_invalid_hint')}
            </Text>
          )}
        </View>
      )}

      {/* Notes */}
      <View style={{ marginTop: spacing.xl }}>
        <TextField
          label={t('add_shift.notes_label')}
          placeholder={t('add_shift.notes_placeholder')}
          value={notes}
          onChangeText={setNotes}
          autoCapitalize="sentences"
        />
      </View>

      <View style={{ height: spacing.huge }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  presetChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceLow,
  },
});
