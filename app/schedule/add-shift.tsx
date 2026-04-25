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

type Kind = 'day' | 'night' | 'off';

const KIND_OPTIONS: SegmentOption<Kind>[] = [
  { value: 'day', label: 'Day' },
  { value: 'night', label: 'Night' },
  { value: 'off', label: 'Off' },
];

// Hour presets for start / end. Real picker lands when we add a TimePicker
// primitive (tracked alongside S04 current-shift TODO).
const HOUR_PRESETS: number[] = [6, 7, 8, 12, 18, 19, 20, 22];

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
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : formatDayMonth(d),
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
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const selectedDay = days.find((d) => d.key === dateKey) ?? days[0];
  const isOff = kind === 'off';
  const canSave = !!dateKey && (isOff || startHour !== endHour);

  const summaryLine = `${formatDayMonth(selectedDay.date)} · ${
    kind === 'off' ? 'Off day' : `${kind} ${formatHour(startHour)}–${formatHour(endHour)}`
  }${notes.trim() ? '\n\nNote: ' + notes.trim() : ''}`;

  const onSave = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Off-day means "no shift today" — we don't insert a row for that yet
    // (the schema's shifts table only stores active day/night entries with
    // start_time and end_time). When we add an `off_days` table or a
    // shift_type='off' enum value, this branch will INSERT instead of
    // showing the local-only confirmation.
    if (kind === 'off' || !isSupabaseConfigured || !supabase || !user?.id) {
      Alert.alert('Shift saved', summaryLine, [
        { text: 'OK', onPress: () => safeDismiss('/(tabs)/schedule') },
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
      Alert.alert('Could not save shift', error.message, [{ text: 'OK' }]);
      return;
    }
    Alert.alert('Shift saved', summaryLine, [
      { text: 'OK', onPress: () => safeDismiss('/(tabs)/schedule') },
    ]);
  };

  return (
    <Screen
      orbs="subtle"
      scroll
      tabBarClearance={false}
      keyboardAvoiding
      floatingFooter={
        <PillCTA
          variant="primary"
          label={submitting ? 'Saving…' : 'Save shift'}
          disabled={!canSave || submitting}
          onPress={onSave}
        />
      }
    >
      <View style={styles.headerRow}>
        <View style={{ width: 22 }} />
        <Eyebrow>NEW SHIFT</Eyebrow>
        <Pressable
          onPress={() => safeDismiss('/(tabs)/schedule')}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <Glyph name="close" size={22} color="inkMuted" />
        </Pressable>
      </View>

      <HeroNumber
        value="Add a shift"
        size="md"
        style={{ marginTop: spacing.lg }}
      />
      <Text variant="bodyMd" color="inkSubtle" style={{ marginTop: spacing.md }}>
        {"Quick entry — adjust later from your calendar."}
      </Text>

      {/* Date picker */}
      <View style={{ marginTop: spacing.huge }}>
        <Eyebrow>WHEN</Eyebrow>
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
        <Eyebrow style={{ marginBottom: spacing.md }}>SHIFT TYPE</Eyebrow>
        <SegmentedControl<Kind>
          options={KIND_OPTIONS}
          value={kind}
          onChange={setKind}
        />
      </View>

      {/* Hours (hidden when type=off) */}
      {!isOff && (
        <View style={{ marginTop: spacing.xl }}>
          <Eyebrow style={{ marginBottom: spacing.md }}>START</Eyebrow>
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
                accessibilityLabel={`Start ${formatHour(h)}`}
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

          <Eyebrow style={{ marginTop: spacing.lg, marginBottom: spacing.md }}>END</Eyebrow>
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
                accessibilityLabel={`End ${formatHour(h)}`}
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
          label="NOTES (OPTIONAL)"
          placeholder="On-call, swap with Anna, etc."
          value={notes}
          onChangeText={setNotes}
          autoCapitalize="sentences"
        />
      </View>

      {/* Summary card */}
      <GlassCard variant="paper" padding="xl" style={{ marginTop: spacing.huge }}>
        <Eyebrow>SUMMARY</Eyebrow>
        <Text
          variant="titleMd"
          family="display"
          weight="medium"
          color="ink"
          style={{ marginTop: spacing.sm }}
        >
          {`${formatDayMonth(selectedDay.date)} · ${
            kind === 'off' ? 'Off day' : `${kind} shift ${formatHour(startHour)}–${formatHour(endHour)}`
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
