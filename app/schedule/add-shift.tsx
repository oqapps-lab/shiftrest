/**
 * S31 — Add shift (modal). Pick a date + shift type + start/end + notes.
 *
 * Stage 5 scope: UI-only. On Save, the shift would `insert` into the
 * `shifts` table from DATABASE-SCHEMA.md once Supabase is connected.
 * For now, the form exists and validates locally; Save closes the modal
 * with a friendly Alert acknowledging the addition is queued for sync.
 */

import React, { useState } from 'react';
import { View, Pressable, StyleSheet, Alert } from 'react-native';
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
  type SegmentOption,
} from '../../components/ui';
import { colors, radii, spacing } from '../../constants/tokens';
import { formatDayMonth, formatHour } from '../../lib/derive';
import { safeDismiss } from '../../lib/nav';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useAuth } from '../../lib/auth/store';
import { emitChange, EVENTS } from '../../lib/queries';
import { t } from '../../lib/i18n';

type Kind = 'day' | 'night' | 'off';

const getKindOptions = (): SegmentOption<Kind>[] => [
  { value: 'day', label: t('shift_kind.day') },
  { value: 'night', label: t('shift_kind.night') },
  { value: 'off', label: t('shift_kind.off') },
];

// Hour presets for start / end. Real picker lands when we add a TimePicker
// primitive (tracked alongside S04 current-shift TODO).
const HOUR_PRESETS: number[] = Array.from({ length: 24 }, (_, i) => i);

interface DayOption {
  /** Local YYYY-MM-DD; do NOT use Date.toISOString here — UTC pulls the
   * day back by one for any timezone east of UTC. */
  key: string;
  date: Date;
  label: string;
}

function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function nextSevenDays(): DayOption[] {
  const out: DayOption[] = [];
  const base = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i);
    out.push({
      key: localDateKey(d),
      date: d,
      label: i === 0 ? t('add_shift.day_today') : i === 1 ? t('add_shift.day_tomorrow') : formatDayMonth(d),
    });
  }
  return out;
}

export default function AddShift() {
  const days = nextSevenDays();
  const { user } = useAuth();
  const [dateKey, setDateKey] = useState<string>(days[0].key);
  const [kind, setKind] = useState<Kind>('day');
  const [startHour, setStartHour] = useState<number>(7);
  const [endHour, setEndHour] = useState<number>(19);
  // B14 — selecting Night auto-populates 19:00-07:00, Day → 07:00-19:00
  function selectKind(next: Kind) {
    setKind(next);
    if (next === 'night') {
      setStartHour(19);
      setEndHour(7);
    } else if (next === 'day') {
      setStartHour(7);
      setEndHour(19);
    }
  }
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const selectedDay = days.find((d) => d.key === dateKey) ?? days[0];
  const isOff = kind === 'off';
  const canSave = !!dateKey;

  const overnightSuffix = kind !== 'off' && endHour <= startHour ? ' ' + t('add_shift.next_day_suffix') : '';
  const summaryLine = `${formatDayMonth(selectedDay.date)} · ${
    kind === 'off' ? t('add_shift.summary_off') : t('add_shift.summary_kind_short', { kind: t('shift_kind.' + kind), start: formatHour(startHour), end: formatHour(endHour) }) + overnightSuffix
  }${notes.trim() ? '\n\n' + t('add_shift.note_prefix') + notes.trim() : ''}`;

  const onSave = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Off-day means "no shift today" — we don't insert a row for that yet
    // (the schema's shifts table only stores active day/night entries with
    // start_time and end_time). When we add an `off_days` table or a
    // shift_type='off' enum value, this branch will INSERT instead of
    // showing the local-only confirmation.
    if (kind === 'off' || !isSupabaseConfigured || !supabase || !user?.id) {
      Alert.alert(t('add_shift.saved_title'), summaryLine, [
        { text: t('add_shift.ok'), onPress: () => safeDismiss('/(tabs)/schedule') },
      ]);
      return;
    }

    setSubmitting(true);
    // Build start/end timestamps from selectedDay + start/endHour. End-hour
    // smaller than start-hour means the shift wraps midnight, so we add
    // one day to the end.
    const startAt = new Date(selectedDay.date);
    startAt.setHours(startHour, 0, 0, 0);
    const endAt = new Date(selectedDay.date);
    endAt.setHours(endHour, 0, 0, 0);
    if (endAt <= startAt) endAt.setDate(endAt.getDate() + 1);

    const dateIso = `${selectedDay.date.getFullYear()}-${String(
      selectedDay.date.getMonth() + 1,
    ).padStart(2, '0')}-${String(selectedDay.date.getDate()).padStart(2, '0')}`;

    const { error } = await supabase.from('shifts').insert({
      user_id: user.id,
      date: dateIso,
      start_time: startAt.toISOString(),
      end_time: endAt.toISOString(),
      shift_type: kind,
      is_manual: true,
      notes: notes.trim() || null,
    });
    setSubmitting(false);

    if (error) {
      Alert.alert(t('add_shift.save_failed_title'), error.message, [{ text: t('add_shift.ok') }]);
      return;
    }
    // Notify any subscribed `useShifts(...)` so the calendar refetches.
    emitChange(EVENTS.shiftsChanged);
    Alert.alert(t('add_shift.saved_title'), summaryLine, [
      { text: t('add_shift.ok'), onPress: () => safeDismiss('/(tabs)/schedule') },
    ]);
  };

  return (
    <Screen
      orbs="subtle"
      scroll
      tabBarClearance={false}
      keyboardAvoiding
      footerClearance={200}
      floatingFooter={
        <PillCTA
          variant="primary"
          label={submitting ? t('add_shift.saving') : t('add_shift.save')}
          disabled={!canSave || submitting}
          onPress={onSave}
        />
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

      {/* Date picker */}
      <View style={{ marginTop: spacing.huge }}>
        <Eyebrow>{t('add_shift.when_label')}</Eyebrow>
        <View style={[styles.dayRow, { marginTop: spacing.md }]}>
          {days.map((d) => {
            const active = d.key === dateKey;
            return (
              <Pressable
                key={d.key}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setDateKey(d.key);
                }}
                style={[
                  styles.dayChip,
                  {
                    backgroundColor: active ? colors.primary : colors.surfaceLow,
                  },
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={d.label}
              >
                <Text
                  variant="labelMd"
                  family="body"
                  weight="medium"
                  color={active ? 'onPrimary' : 'inkMuted'}
                  uppercase
                >
                  {d.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Type */}
      <View style={{ marginTop: spacing.xl }}>
        <Eyebrow style={{ marginBottom: spacing.md }}>{t('add_shift.shift_type')}</Eyebrow>
        <SegmentedControl<Kind>
          options={getKindOptions()}
          value={kind}
          onChange={selectKind}
        />
      </View>

      {/* Hours (hidden when type=off) */}
      {!isOff && (
        <View style={{ marginTop: spacing.xl }}>
          <Eyebrow style={{ marginBottom: spacing.md }}>{t('add_shift.start')}</Eyebrow>
          <View style={styles.hourRow}>
            {HOUR_PRESETS.map((h) => (
              <Pressable
                key={`s${h}`}
                onPress={() => setStartHour(h)}
                style={[
                  styles.hourChip,
                  startHour === h && { backgroundColor: colors.primary },
                ]}
                accessibilityRole="button"
                accessibilityLabel={t('a11y.start_hour', { hour: formatHour(h) })}
              >
                <Text
                  variant="labelMd"
                  family="mono"
                  weight="medium"
                  color={startHour === h ? 'onPrimary' : 'ink'}
                >
                  {formatHour(h)}
                </Text>
              </Pressable>
            ))}
          </View>

          <Eyebrow style={{ marginTop: spacing.lg, marginBottom: spacing.md }}>{t('add_shift.end')}</Eyebrow>
          <View style={styles.hourRow}>
            {HOUR_PRESETS.map((h) => (
              <Pressable
                key={`e${h}`}
                onPress={() => setEndHour(h)}
                style={[
                  styles.hourChip,
                  endHour === h && { backgroundColor: colors.primary },
                ]}
                accessibilityRole="button"
                accessibilityLabel={t('a11y.end_hour', { hour: formatHour(h) })}
              >
                <Text
                  variant="labelMd"
                  family="mono"
                  weight="medium"
                  color={endHour === h ? 'onPrimary' : 'ink'}
                >
                  {formatHour(h)}
                </Text>
              </Pressable>
            ))}
          </View>
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

      {/* Summary card */}
      <GlassCard variant="paper" padding="xl" style={{ marginTop: spacing.huge }}>
        <Eyebrow>{t('add_shift.summary')}</Eyebrow>
        <Text
          variant="titleMd"
          family="display"
          weight="medium"
          color="ink"
          style={{ marginTop: spacing.sm }}
        >
          {`${formatDayMonth(selectedDay.date)} · ${
            kind === 'off' ? t('add_shift.summary_off') : t('add_shift.summary_kind_long', { kind: t('shift_kind.' + kind), start: formatHour(startHour), end: formatHour(endHour) })
          }`}
        </Text>
      </GlassCard>

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
  dayRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  dayChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
  },
  hourRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  hourChip: {
    minWidth: 64,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
